import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { findUserById, updateUser } from "@/repositories/users";
import { writeAudit } from "@/lib/audit";
import { nowWIB } from "@/lib/wib";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/registrations/{id}/reject — status → rejected (alasan wajib).
export const POST = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const { alasan } = await readJson<{ alasan?: string }>(req);
  if (!alasan || alasan.trim().length === 0) {
    throw new AppError("VALIDASI_GAGAL", "Alasan penolakan wajib diisi.", 422);
  }
  const u = await findUserById(id);
  if (!u) throw new AppError("TIDAK_DITEMUKAN", "Pendaftar tidak ditemukan", 404);
  const saved = await updateUser(id, {
    status: "rejected",
    alasan_tolak: alasan.trim(),
    updated_at: nowWIB(),
  });
  await writeAudit({ actorEmail: admin.email, aksi: "reject", entitas: "users", entitasId: id, detail: { alasan } });
  return ok({ user: saved });
});
