import { db } from "@/lib/db";
import { cached, invalidate } from "@/lib/cache";
import type { UserRow } from "@/lib/db/tables";
import { env } from "@/lib/env";

const TAG = "users";

async function allUsers(): Promise<UserRow[]> {
  return cached(TAG, 60_000, () => db.all("users"));
}

export function invalidateUsers() {
  invalidate(TAG);
}

/** Terapkan promosi admin dari env ADMIN_EMAILS (tanpa mengubah data tersimpan). */
function withAdminElevation(u: UserRow): UserRow {
  if (env.adminEmails.includes(u.email.toLowerCase()) && u.role !== "admin") {
    return { ...u, role: "admin" };
  }
  return u;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const e = email.toLowerCase();
  const u = (await allUsers()).find((r) => r.email.toLowerCase() === e);
  return u ? withAdminElevation(u) : null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const u = (await allUsers()).find((r) => r.id === id);
  return u ? withAdminElevation(u) : null;
}

export async function nopekTaken(nopek: string, exceptId?: string): Promise<boolean> {
  const n = nopek.trim().toLowerCase();
  return (await allUsers()).some(
    (r) => r.nopek.trim().toLowerCase() === n && r.id !== exceptId,
  );
}

export async function createUser(row: UserRow): Promise<UserRow> {
  const saved = await db.insert("users", row);
  invalidateUsers();
  return saved;
}

export async function updateUser(id: string, patch: Partial<UserRow>): Promise<UserRow | null> {
  const saved = await db.updateById("users", id, patch);
  invalidateUsers();
  return saved;
}

export async function listUsers(filter?: Partial<Pick<UserRow, "status" | "role">>): Promise<UserRow[]> {
  let rows = await allUsers();
  if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
  if (filter?.role) rows = rows.filter((r) => r.role === filter.role);
  return rows.map(withAdminElevation);
}

export async function listPending(): Promise<UserRow[]> {
  return listUsers({ status: "pending" });
}

/** Rekan pekerja shift aktif satu lokasi & satu bagian (untuk Lembur Cuti). */
export async function listRekanShift(user: UserRow): Promise<UserRow[]> {
  return (await allUsers()).filter(
    (r) =>
      r.id !== user.id &&
      r.status === "active" &&
      r.tipe_kerja === "shift" &&
      r.lokasi_kerja === user.lokasi_kerja &&
      r.bagian === user.bagian,
  );
}

/** Proyeksi direktori: TANPA kontak darurat (FR-PKJ-03). */
export interface DirectoryEntry {
  id: string;
  nama_lengkap: string;
  nopek: string;
  company_id: string;
  lokasi_kerja: string;
  divisi: string;
  bagian: string;
  tipe_kerja: UserRow["tipe_kerja"];
  nama_shift: string;
  no_telp: string;
  foto_url: string;
}

export function toDirectoryEntry(u: UserRow): DirectoryEntry {
  return {
    id: u.id,
    nama_lengkap: u.nama_lengkap,
    nopek: u.nopek,
    company_id: u.company_id,
    lokasi_kerja: u.lokasi_kerja,
    divisi: u.divisi,
    bagian: u.bagian,
    tipe_kerja: u.tipe_kerja,
    nama_shift: u.nama_shift,
    no_telp: u.no_telp,
    foto_url: u.foto_url,
  };
}
