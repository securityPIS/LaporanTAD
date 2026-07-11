import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import { nowWIB } from "@/lib/wib";
import { AppError } from "@/lib/errors";
import { assertPeriodeTerbuka } from "@/lib/period-lock";
import { writeAudit } from "@/lib/audit";
import type { TripInput } from "@/schemas";
import type { TripRow, UserRow } from "@/lib/db/tables";

export async function listTripsByUser(userId: string): Promise<TripRow[]> {
  const rows = await db.findMany("trips", (t) => t.user_id === userId);
  return rows.sort((a, b) => (a.tanggal_mulai < b.tanggal_mulai ? 1 : -1));
}

export async function getTrip(id: string): Promise<TripRow | null> {
  return (await db.findOne("trips", (t) => t.id === id)) ?? null;
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
    status: "tercatat",
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
  if (actor.role !== "admin" && existing.user_id !== actor.id) throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
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
  if (actor.role !== "admin" && existing.user_id !== actor.id) throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  await assertPeriodeTerbuka(existing.tanggal_mulai);
  await db.deleteById("trips", id);
  await writeAudit({ actorEmail: actor.email, aksi: "hapus", entitas: "trips", entitasId: id });
}

export async function listAllTrips(filter: { month?: string; companyId?: string; lokasi?: string }): Promise<TripRow[]> {
  const users = await db.all("users");
  const byId = new Map(users.map((u) => [u.id, u]));
  let rows = await db.all("trips");
  if (filter.month) rows = rows.filter((t) => t.tanggal_mulai.slice(0, 7) === filter.month);
  if (filter.companyId) rows = rows.filter((t) => byId.get(t.user_id)?.company_id === filter.companyId);
  if (filter.lokasi) rows = rows.filter((t) => byId.get(t.user_id)?.lokasi_kerja === filter.lokasi);
  return rows.sort((a, b) => (a.tanggal_mulai < b.tanggal_mulai ? 1 : -1));
}
