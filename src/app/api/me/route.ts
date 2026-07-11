import { ok, readJson, route } from "@/lib/api";
import { getCurrentUser, requireActive } from "@/lib/session";
import { updateUser } from "@/repositories/users";
import { writeAudit } from "@/lib/audit";
import { nowWIB } from "@/lib/wib";
import { normalizePhone } from "@/lib/phone";
import { z } from "zod";

// GET /api/me — profil sendiri (termasuk kontak darurat miliknya).
export const GET = route(async () => {
  const u = await getCurrentUser();
  return ok({ user: u });
});

const profileSchema = z.object({
  nama_lengkap: z.string().min(3).max(100).optional(),
  no_telp: z.string().optional(),
  divisi: z.string().optional(),
  bagian: z.string().optional(),
  nama_shift: z.string().optional(),
  darurat_alamat: z.string().optional(),
  darurat_telp: z.string().optional(),
  darurat_hubungan: z.string().optional(),
});

// PATCH /api/me — ubah data diri (kecuali email, role, status). Tercatat di audit.
export const PATCH = route(async (req) => {
  const u = await requireActive();
  const data = profileSchema.parse(await readJson(req));
  const patch = { ...data, updated_at: nowWIB() };
  if (patch.no_telp) patch.no_telp = normalizePhone(patch.no_telp);
  if (patch.darurat_telp) patch.darurat_telp = normalizePhone(patch.darurat_telp);
  const saved = await updateUser(u.id, patch);
  await writeAudit({ actorEmail: u.email, aksi: "ubah-profil", entitas: "users", entitasId: u.id, detail: patch });
  return ok({ user: saved });
});
