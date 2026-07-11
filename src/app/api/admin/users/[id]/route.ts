import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { findUserById, updateUser } from "@/repositories/users";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { nowWIB } from "@/lib/wib";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const u = await findUserById(id);
  if (!u) throw new AppError("TIDAK_DITEMUKAN", "Pekerja tidak ditemukan", 404);
  return ok({ user: u });
});

const patchSchema = z.object({
  nama_lengkap: z.string().min(3).optional(),
  company_id: z.string().optional(),
  lokasi_kerja: z.string().optional(),
  divisi: z.string().optional(),
  bagian: z.string().optional(),
  tipe_kerja: z.enum(["shift", "nonshift"]).optional(),
  nama_shift: z.string().optional(),
  no_telp: z.string().optional(),
  role: z.enum(["admin", "pekerja"]).optional(),
  status: z.enum(["pending", "active", "rejected", "inactive"]).optional(),
  kuota_cuti: z.number().int().nonnegative().optional(),
});

// PATCH /api/admin/users/{id} — edit data, set role, aktif/nonaktif, atur kuota.
export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const data = patchSchema.parse(await readJson(req));
  const u = await findUserById(id);
  if (!u) throw new AppError("TIDAK_DITEMUKAN", "Pekerja tidak ditemukan", 404);

  const { kuota_cuti, ...userPatch } = data;
  if (Object.keys(userPatch).length > 0) {
    await updateUser(id, { ...userPatch, updated_at: nowWIB() });
  }

  // Kuota cuti tahun berjalan (leave_balances).
  if (kuota_cuti != null) {
    const tahun = new Date().getFullYear();
    const bal = await db.findOne("leave_balances", (b) => b.user_id === id && b.tahun === tahun);
    if (bal) {
      await db.updateById("leave_balances", bal.id, { kuota: kuota_cuti, updated_at: nowWIB() });
    } else {
      await db.insert("leave_balances", {
        id: `lb_${id}_${tahun}`,
        user_id: id,
        tahun,
        kuota: kuota_cuti,
        penyesuaian: 0,
        catatan: "",
        updated_at: nowWIB(),
      });
    }
  }

  await writeAudit({ actorEmail: admin.email, aksi: "ubah-pekerja", entitas: "users", entitasId: id, detail: data });
  const saved = await findUserById(id);
  return ok({ user: saved });
});
