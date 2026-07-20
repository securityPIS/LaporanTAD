import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import { nowWIB, todayWIB } from "@/lib/wib";
import { AppError } from "@/lib/errors";
import { assertPeriodeTerbuka } from "@/lib/period-lock";
import { writeAudit } from "@/lib/audit";
import { buildTripView, type TripView } from "@/lib/trip-view";
import type { DeklarasiInput, TripInput } from "@/schemas";
import type { DocumentRow, TripCostRow, TripRow, UserRow } from "@/lib/db/tables";

function byMulaiDesc(a: TripRow, b: TripRow): number {
  return a.tanggal_mulai < b.tanggal_mulai ? 1 : -1;
}

function assertOwner(actor: UserRow, trip: TripRow): void {
  if (actor.role !== "admin" && trip.user_id !== actor.id) {
    throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  }
}

export async function listTripsByUser(userId: string): Promise<TripRow[]> {
  const rows = await db.findMany("trips", (t) => t.user_id === userId);
  return rows.sort(byMulaiDesc);
}

/** Daftar dinas milik pekerja lengkap dengan fase & total biaya (untuk UI). */
export async function listTripViewsByUser(userId: string): Promise<TripView[]> {
  const trips = await listTripsByUser(userId);
  const costs = await db.findMany("trip_costs", (c) => c.user_id === userId);
  const today = todayWIB();
  return trips.map((t) => buildTripView(t, costs.filter((c) => c.trip_id === t.id), today));
}

export async function getTrip(id: string): Promise<TripRow | null> {
  return (await db.findOne("trips", (t) => t.id === id)) ?? null;
}

export async function listCostsByTrip(tripId: string): Promise<TripCostRow[]> {
  const rows = await db.findMany("trip_costs", (c) => c.trip_id === tripId);
  return rows.sort((a, b) => a.urutan - b.urutan);
}

/** Detail satu dinas: baris, tampilan turunan, rincian biaya, & dokumen terkait. */
export async function getTripDetail(
  id: string,
): Promise<{ trip: TripRow; view: TripView; costs: TripCostRow[]; docs: DocumentRow[] } | null> {
  const trip = await getTrip(id);
  if (!trip) return null;
  const costs = await listCostsByTrip(id);
  const docs = (await db.findMany("documents", (d) => d.sumber_entitas === "trips" && d.sumber_id === id)).sort(
    (a, b) => (a.created_at < b.created_at ? 1 : -1),
  );
  return { trip, view: buildTripView(trip, costs, todayWIB()), costs, docs };
}

export async function createTrip(actor: UserRow, input: TripInput): Promise<TripRow> {
  await assertPeriodeTerbuka(input.tanggal_mulai);
  const now = nowWIB();
  const row: TripRow = {
    id: newId(),
    user_id: actor.id,
    tujuan: input.tujuan,
    tanggal_mulai: input.tanggal_mulai,
    tanggal_selesai: input.tanggal_selesai,
    keperluan: input.keperluan,
    transportasi: input.transportasi ?? "",
    keterangan: input.keterangan ?? "",
    lampiran_file_id: input.lampiran_file_id ?? "",
    status: "draft",
    tanggal_realisasi_mulai: "",
    tanggal_realisasi_selesai: "",
    deklarasi_catatan: "",
    deklarasi_sifat: "",
    deklarasi_kendaraan_pribadi: false,
    created_at: now,
    updated_at: now,
  };
  const saved = await db.insert("trips", row);
  await writeAudit({ actorEmail: actor.email, aksi: "buat", entitas: "trips", entitasId: saved.id, detail: { tujuan: saved.tujuan } });
  return saved;
}

export async function updateTrip(actor: UserRow, id: string, input: TripInput): Promise<TripRow> {
  const existing = await getTrip(id);
  if (!existing) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
  assertOwner(actor, existing);
  await assertPeriodeTerbuka(existing.tanggal_mulai);
  await assertPeriodeTerbuka(input.tanggal_mulai);
  const patch: Partial<TripRow> = {
    tujuan: input.tujuan,
    tanggal_mulai: input.tanggal_mulai,
    tanggal_selesai: input.tanggal_selesai,
    keperluan: input.keperluan,
    transportasi: input.transportasi ?? "",
    keterangan: input.keterangan ?? "",
    lampiran_file_id: input.lampiran_file_id || existing.lampiran_file_id,
    updated_at: nowWIB(),
  };
  const saved = await db.updateById("trips", id, patch);
  await writeAudit({ actorEmail: actor.email, aksi: "ubah", entitas: "trips", entitasId: id, detail: patch });
  return saved!;
}

export async function deleteTrip(actor: UserRow, id: string): Promise<void> {
  const existing = await getTrip(id);
  if (!existing) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
  assertOwner(actor, existing);
  await assertPeriodeTerbuka(existing.tanggal_mulai);
  // Cascade: buang seluruh komponen biaya milik dinas ini.
  const costs = await db.findMany("trip_costs", (c) => c.trip_id === id);
  for (const c of costs) await db.deleteById("trip_costs", c.id);
  await db.deleteById("trips", id);
  await writeAudit({ actorEmail: actor.email, aksi: "hapus", entitas: "trips", entitasId: id });
}

/** Ganti seluruh komponen biaya dinas dengan daftar baru (dipertahankan urut). */
async function replaceCostsForTrip(trip: TripRow, items: DeklarasiInput["biaya"]): Promise<void> {
  const existing = await db.findMany("trip_costs", (c) => c.trip_id === trip.id);
  for (const c of existing) await db.deleteById("trip_costs", c.id);
  const now = nowWIB();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const vol = it.vol ?? 1;
    const jumlah = Math.round(vol * it.tarif); // ketentuan: jumlah = vol × tarif
    await db.insert("trip_costs", {
      id: newId(),
      trip_id: trip.id,
      user_id: trip.user_id,
      komponen: it.komponen,
      keterangan: it.keterangan ?? "",
      vol,
      tarif: it.tarif,
      jumlah,
      bukti_file_id: it.bukti_file_id ?? "",
      urutan: i + 1,
      created_at: now,
    });
  }
}

/** Simpan data Deklarasi (realisasi + rincian biaya). SPD wajib terbit dulu. */
export async function saveDeklarasi(actor: UserRow, id: string, input: DeklarasiInput): Promise<TripView> {
  const trip = await getTrip(id);
  if (!trip) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
  assertOwner(actor, trip);
  if (trip.status === "draft") {
    throw new AppError("VALIDASI_GAGAL", "Terbitkan SPD dulu sebelum mengisi Deklarasi.", 422);
  }
  await assertPeriodeTerbuka(input.tanggal_realisasi_mulai);
  await replaceCostsForTrip(trip, input.biaya);
  const saved = await db.updateById("trips", id, {
    tanggal_realisasi_mulai: input.tanggal_realisasi_mulai,
    tanggal_realisasi_selesai: input.tanggal_realisasi_selesai,
    deklarasi_catatan: input.catatan ?? "",
    deklarasi_sifat: input.sifat,
    deklarasi_kendaraan_pribadi: input.kendaraan_pribadi,
    updated_at: nowWIB(),
  });
  await writeAudit({
    actorEmail: actor.email,
    aksi: "ubah",
    entitas: "trips",
    entitasId: id,
    detail: { deklarasi: true, komponen: input.biaya.length },
  });
  const costs = await listCostsByTrip(id);
  return buildTripView(saved!, costs, todayWIB());
}

/** Tandai SPD terbit (dipanggil setelah dokumen SPD dibuat). Tak menurunkan fase. */
export async function markTripSpdIssued(id: string): Promise<void> {
  const trip = await getTrip(id);
  if (!trip || trip.status !== "draft") return;
  await db.updateById("trips", id, { status: "spd_terbit", updated_at: nowWIB() });
}

/** Tandai dinas selesai (dipanggil setelah dokumen Deklarasi dibuat). */
export async function markTripSelesai(id: string): Promise<void> {
  const trip = await getTrip(id);
  if (!trip || trip.status === "selesai") return;
  await db.updateById("trips", id, { status: "selesai", updated_at: nowWIB() });
}

export async function listAllTrips(filter: { month?: string; companyId?: string; lokasi?: string }): Promise<TripRow[]> {
  const users = await db.all("users");
  const byId = new Map(users.map((u) => [u.id, u]));
  let rows = await db.all("trips");
  if (filter.month) rows = rows.filter((t) => t.tanggal_mulai.slice(0, 7) === filter.month);
  if (filter.companyId) rows = rows.filter((t) => byId.get(t.user_id)?.company_id === filter.companyId);
  if (filter.lokasi) rows = rows.filter((t) => byId.get(t.user_id)?.lokasi_kerja === filter.lokasi);
  return rows.sort(byMulaiDesc);
}

/** Versi rekap admin dengan fase & total biaya per dinas. */
export async function listAllTripViews(filter: {
  month?: string;
  companyId?: string;
  lokasi?: string;
}): Promise<TripView[]> {
  const rows = await listAllTrips(filter);
  const allCosts = await db.all("trip_costs");
  const today = todayWIB();
  return rows.map((t) => buildTripView(t, allCosts.filter((c) => c.trip_id === t.id), today));
}
