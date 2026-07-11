import { ok, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { findUserById, updateUser } from "@/repositories/users";
import { writeAudit } from "@/lib/audit";
import { nowWIB } from "@/lib/wib";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/registrations/{id}/approve — status → active (FR-REG-02).
export const POST = route<Ctx>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const u = await findUserById(id);
  if (!u) throw new AppError("TIDAK_DITEMUKAN", "Pendaftar tidak ditemukan", 404);
  const saved = await updateUser(id, {
    status: "active",
    approved_by: admin.email,
    approved_at: nowWIB(),
    alasan_tolak: "",
    updated_at: nowWIB(),
  });
  await writeAudit({ actorEmail: admin.email, aksi: "approve", entitas: "users", entitasId: id, detail: { nama: u.nama_lengkap } });
  return ok({ user: saved });
});
