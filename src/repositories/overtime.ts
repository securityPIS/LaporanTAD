import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import { nowWIB, todayWIB } from "@/lib/wib";
import { AppError } from "@/lib/errors";
import { assertPeriodeTerbuka } from "@/lib/period-lock";
import { assertBatasLembur, cekTumpangTindih } from "@/lib/overtime-rules";
import { hitungTotalJam } from "@/lib/overtime-calc";
import { writeAudit } from "@/lib/audit";
import type { OvertimeInput } from "@/schemas";
import type { OvertimeRow, UserRow } from "@/lib/db/tables";

export async function listOvertimeByUser(userId: string, month?: string): Promise<OvertimeRow[]> {
  let rows = await db.findMany("overtime", (o) => o.user_id === userId);
  if (month) rows = rows.filter((o) => o.tanggal.slice(0, 7) === month);
  return rows.sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}

export async function getOvertime(id: string): Promise<OvertimeRow | null> {
  return (await db.findOne("overtime", (o) => o.id === id)) ?? null;
}

/** Lembur milik user pada rentang tanggal [start, end] inklusif — urut ASC untuk dokumen. */
export async function listOvertimeByUserRange(
  userId: string,
  start: string,
  end: string,
): Promise<OvertimeRow[]> {
  const rows = await db.findMany(
    "overtime",
    (o) => o.user_id === userId && o.tanggal >= start && o.tanggal <= end,
  );
  return rows.sort((a, b) => (a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : 0));
}

/** Peringatan lunak (tidak memblok): rekan Lembur Cuti tak tercatat cuti; tumpang tindih. */
export interface SoftWarnings {
  warnings: string[];
}

async function buildWarnings(
  actor: UserRow,
  input: OvertimeInput,
  excludeId?: string,
): Promise<string[]> {
  const w: string[] = [];
  const existing = await db.findMany("overtime", (o) => o.user_id === actor.id);
  const tt = cekTumpangTindih(existing, input.tanggal, input.jam_mulai, input.jam_selesai, excludeId);
  if (tt) w.push(tt);
  if (input.jenis === "cuti" && input.replaced_user_id) {
    const cutiRekan = await db.findOne(
      "leaves",
      (l) =>
        l.user_id === input.replaced_user_id &&
        l.tanggal_mulai <= input.tanggal &&
        l.tanggal_selesai >= input.tanggal,
    );
    if (!cutiRekan) {
      w.push("Rekan yang dipilih tidak tercatat cuti pada tanggal ini — tetap dapat disimpan.");
    }
  }
  return w;
}

export async function createOvertime(
  actor: UserRow,
  input: OvertimeInput,
): Promise<{ row: OvertimeRow } & SoftWarnings> {
  if (input.tanggal > todayWIB()) {
    throw new AppError("TANGGAL_DEPAN", "Tanggal lembur tidak boleh melewati hari ini.", 422);
  }
  await assertPeriodeTerbuka(input.tanggal);
  await assertBatasLembur({
    userId: actor.id,
    tanggal: input.tanggal,
    jenis: input.jenis,
    jamMulai: input.jam_mulai,
    jamSelesai: input.jam_selesai,
  });
  const warnings = await buildWarnings(actor, input);

  const now = nowWIB();
  const row: OvertimeRow = {
    id: newId(),
    user_id: actor.id,
    tanggal: input.tanggal,
    jenis: input.jenis,
    holiday_id: input.holiday_id ?? "",
    replaced_user_id: input.replaced_user_id ?? "",
    keterangan: input.keterangan,
    jam_mulai: input.jam_mulai,
    jam_selesai: input.jam_selesai,
    total_jam: hitungTotalJam(input.jam_mulai, input.jam_selesai),
    evidence_file_id: input.evidence_file_id ?? "",
    status: "tercatat",
    created_at: now,
    updated_at: now,
  };
  const saved = await db.insert("overtime", row);
  await writeAudit({ actorEmail: actor.email, aksi: "buat", entitas: "overtime", entitasId: saved.id, detail: { tanggal: saved.tanggal, jenis: saved.jenis } });
  return { row: saved, warnings };
}

export async function updateOvertime(
  actor: UserRow,
  id: string,
  input: OvertimeInput,
): Promise<{ row: OvertimeRow } & SoftWarnings> {
  const existing = await getOvertime(id);
  if (!existing) throw new AppError("TIDAK_DITEMUKAN", "Catatan lembur tidak ditemukan", 404);
  if (actor.role !== "admin" && existing.user_id !== actor.id) {
    throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  }
  if (input.tanggal > todayWIB()) {
    throw new AppError("TANGGAL_DEPAN", "Tanggal lembur tidak boleh melewati hari ini.", 422);
  }
  await assertPeriodeTerbuka(existing.tanggal); // periode lama
  await assertPeriodeTerbuka(input.tanggal); // periode baru
  await assertBatasLembur({
    userId: existing.user_id,
    tanggal: input.tanggal,
    jenis: input.jenis,
    jamMulai: input.jam_mulai,
    jamSelesai: input.jam_selesai,
    excludeId: id,
  });
  const warnings = await buildWarnings({ ...actor, id: existing.user_id }, input, id);

  const patch: Partial<OvertimeRow> = {
    tanggal: input.tanggal,
    jenis: input.jenis,
    holiday_id: input.holiday_id ?? "",
    replaced_user_id: input.replaced_user_id ?? "",
    keterangan: input.keterangan,
    jam_mulai: input.jam_mulai,
    jam_selesai: input.jam_selesai,
    total_jam: hitungTotalJam(input.jam_mulai, input.jam_selesai),
    evidence_file_id: input.evidence_file_id || existing.evidence_file_id,
    updated_at: nowWIB(),
  };
  const saved = await db.updateById("overtime", id, patch);
  await writeAudit({ actorEmail: actor.email, aksi: "ubah", entitas: "overtime", entitasId: id, detail: patch });
  return { row: saved!, warnings };
}

export async function deleteOvertime(actor: UserRow, id: string): Promise<void> {
  const existing = await getOvertime(id);
  if (!existing) throw new AppError("TIDAK_DITEMUKAN", "Catatan lembur tidak ditemukan", 404);
  if (actor.role !== "admin" && existing.user_id !== actor.id) {
    throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  }
  await assertPeriodeTerbuka(existing.tanggal);
  await db.deleteById("overtime", id);
  await writeAudit({ actorEmail: actor.email, aksi: "hapus", entitas: "overtime", entitasId: id });
}

/** Admin: semua lembur dengan filter (bulan/perusahaan/lokasi/jenis). */
export async function listAllOvertime(filter: {
  month?: string;
  companyId?: string;
  lokasi?: string;
  jenis?: string;
}): Promise<OvertimeRow[]> {
  const users = await db.all("users");
  const byId = new Map(users.map((u) => [u.id, u]));
  let rows = await db.all("overtime");
  if (filter.month) rows = rows.filter((o) => o.tanggal.slice(0, 7) === filter.month);
  if (filter.jenis) rows = rows.filter((o) => o.jenis === filter.jenis);
  if (filter.companyId) rows = rows.filter((o) => byId.get(o.user_id)?.company_id === filter.companyId);
  if (filter.lokasi) rows = rows.filter((o) => byId.get(o.user_id)?.lokasi_kerja === filter.lokasi);
  return rows.sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}
