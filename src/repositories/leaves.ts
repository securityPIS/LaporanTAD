import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import { nowWIB } from "@/lib/wib";
import { AppError } from "@/lib/errors";
import { assertPeriodeTerbuka } from "@/lib/period-lock";
import { writeAudit } from "@/lib/audit";
import { hitungHariCuti } from "@/lib/leave-calc";
import { getNumberSetting } from "@/lib/settings";
import type { LeaveInput } from "@/schemas";
import type { LeaveRow, LeaveTypeRow, UserRow } from "@/lib/db/tables";

export async function listLeaveTypes(): Promise<LeaveTypeRow[]> {
  return (await db.all("leave_types")).filter((t) => t.active);
}

async function holidaySet(tahun: number): Promise<Set<string>> {
  const rows = await db.findMany("holidays", (h) => h.tahun === tahun);
  return new Set(rows.map((h) => h.tanggal));
}

export interface SaldoCuti {
  tahun: number;
  kuota: number;
  penyesuaian: number;
  terpakai: number;
  sisa: number;
}

/** Saldo = kuota + penyesuaian − terpakai (hanya jenis potong_saldo). */
export async function hitungSaldo(userId: string, tahun: number): Promise<SaldoCuti> {
  const [bal, kuotaDefault, types, leaves] = await Promise.all([
    db.findOne("leave_balances", (b) => b.user_id === userId && b.tahun === tahun),
    getNumberSetting("default_kuota_cuti"),
    db.all("leave_types"),
    db.findMany("leaves", (l) => l.user_id === userId && l.tanggal_mulai.slice(0, 4) === String(tahun)),
  ]);
  const kuota = bal?.kuota ?? kuotaDefault;
  const penyesuaian = bal?.penyesuaian ?? 0;
  const potongIds = new Set(types.filter((t) => t.potong_saldo).map((t) => t.id));
  const terpakai = leaves
    .filter((l) => potongIds.has(l.leave_type_id))
    .reduce((a, l) => a + l.jumlah_hari, 0);
  return { tahun, kuota, penyesuaian, terpakai, sisa: kuota + penyesuaian - terpakai };
}

export async function listLeavesByUser(userId: string): Promise<LeaveRow[]> {
  const rows = await db.findMany("leaves", (l) => l.user_id === userId);
  return rows.sort((a, b) => (a.tanggal_mulai < b.tanggal_mulai ? 1 : -1));
}

export async function getLeave(id: string): Promise<LeaveRow | null> {
  return (await db.findOne("leaves", (l) => l.id === id)) ?? null;
}

async function resolveHari(actor: UserRow, input: LeaveInput): Promise<number> {
  const tahun = Number(input.tanggal_mulai.slice(0, 4));
  const auto = hitungHariCuti(input.tanggal_mulai, input.tanggal_selesai, actor.tipe_kerja, await holidaySet(tahun));
  // Koreksi manual hanya boleh menurunkan (FR-CTI-03/05).
  if (input.jumlah_hari != null && input.jumlah_hari > 0 && input.jumlah_hari <= auto) {
    return input.jumlah_hari;
  }
  return auto;
}

export async function createLeave(actor: UserRow, input: LeaveInput): Promise<LeaveRow> {
  await assertPeriodeTerbuka(input.tanggal_mulai);
  const type = await db.findOne("leave_types", (t) => t.id === input.leave_type_id);
  if (!type) throw new AppError("VALIDASI_GAGAL", "Jenis cuti tidak dikenal", 422);
  if (type.wajib_lampiran && !input.lampiran_file_id) {
    throw new AppError("WAJIB_LAMPIRAN", `Jenis cuti "${type.nama}" wajib melampirkan berkas.`, 422);
  }
  const hari = await resolveHari(actor, input);
  const tahun = Number(input.tanggal_mulai.slice(0, 4));
  if (type.potong_saldo) {
    const saldo = await hitungSaldo(actor.id, tahun);
    if (hari > saldo.sisa) {
      throw new AppError("SALDO_KURANG", `Saldo cuti tidak mencukupi. Sisa ${saldo.sisa} hari, diminta ${hari} hari.`, 422);
    }
  }
  const now = nowWIB();
  const row: LeaveRow = {
    id: newId(),
    user_id: actor.id,
    leave_type_id: input.leave_type_id,
    tanggal_mulai: input.tanggal_mulai,
    tanggal_selesai: input.tanggal_selesai,
    jumlah_hari: hari,
    keterangan: input.keterangan ?? "",
    lampiran_file_id: input.lampiran_file_id ?? "",
    status: "tercatat",
    created_at: now,
    updated_at: now,
  };
  const saved = await db.insert("leaves", row);
  await writeAudit({ actorEmail: actor.email, aksi: "buat", entitas: "leaves", entitasId: saved.id, detail: { jenis: type.nama, hari } });
  return saved;
}

export async function updateLeave(actor: UserRow, id: string, input: LeaveInput): Promise<LeaveRow> {
  const existing = await getLeave(id);
  if (!existing) throw new AppError("TIDAK_DITEMUKAN", "Catatan cuti tidak ditemukan", 404);
  const ownerId = existing.user_id;
  if (actor.role !== "admin" && ownerId !== actor.id) throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  await assertPeriodeTerbuka(existing.tanggal_mulai);
  await assertPeriodeTerbuka(input.tanggal_mulai);
  const type = await db.findOne("leave_types", (t) => t.id === input.leave_type_id);
  if (!type) throw new AppError("VALIDASI_GAGAL", "Jenis cuti tidak dikenal", 422);
  if (type.wajib_lampiran && !(input.lampiran_file_id || existing.lampiran_file_id)) {
    throw new AppError("WAJIB_LAMPIRAN", `Jenis cuti "${type.nama}" wajib melampirkan berkas.`, 422);
  }
  const owner = actor.id === ownerId ? actor : (await db.findOne("users", (u) => u.id === ownerId))!;
  const hari = await resolveHari(owner, input);
  const tahun = Number(input.tanggal_mulai.slice(0, 4));
  if (type.potong_saldo) {
    const saldo = await hitungSaldo(ownerId, tahun);
    const kembalikan = existing.leave_type_id === type.id ? existing.jumlah_hari : 0;
    const sisaEfektif = saldo.sisa + kembalikan;
    if (hari > sisaEfektif) {
      throw new AppError("SALDO_KURANG", `Saldo cuti tidak mencukupi. Sisa ${sisaEfektif} hari, diminta ${hari} hari.`, 422);
    }
  }
  const patch: Partial<LeaveRow> = {
    leave_type_id: input.leave_type_id,
    tanggal_mulai: input.tanggal_mulai,
    tanggal_selesai: input.tanggal_selesai,
    jumlah_hari: hari,
    keterangan: input.keterangan ?? "",
    lampiran_file_id: input.lampiran_file_id || existing.lampiran_file_id,
    updated_at: nowWIB(),
  };
  const saved = await db.updateById("leaves", id, patch);
  await writeAudit({ actorEmail: actor.email, aksi: "ubah", entitas: "leaves", entitasId: id, detail: patch });
  return saved!;
}

export async function deleteLeave(actor: UserRow, id: string): Promise<void> {
  const existing = await getLeave(id);
  if (!existing) throw new AppError("TIDAK_DITEMUKAN", "Catatan cuti tidak ditemukan", 404);
  if (actor.role !== "admin" && existing.user_id !== actor.id) throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  await assertPeriodeTerbuka(existing.tanggal_mulai);
  await db.deleteById("leaves", id);
  await writeAudit({ actorEmail: actor.email, aksi: "hapus", entitas: "leaves", entitasId: id });
}

export async function listAllLeaves(filter: { month?: string; companyId?: string; lokasi?: string }): Promise<LeaveRow[]> {
  const users = await db.all("users");
  const byId = new Map(users.map((u) => [u.id, u]));
  let rows = await db.all("leaves");
  if (filter.month) rows = rows.filter((l) => l.tanggal_mulai.slice(0, 7) === filter.month);
  if (filter.companyId) rows = rows.filter((l) => byId.get(l.user_id)?.company_id === filter.companyId);
  if (filter.lokasi) rows = rows.filter((l) => byId.get(l.user_id)?.lokasi_kerja === filter.lokasi);
  return rows.sort((a, b) => (a.tanggal_mulai < b.tanggal_mulai ? 1 : -1));
}
