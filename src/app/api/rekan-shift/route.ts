import { ok, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { listRekanShift } from "@/repositories/users";

// GET /api/rekan-shift — rekan pekerja shift aktif satu lokasi & bagian
// (untuk dropdown Lembur Cuti — FR-LBR-05).
export const GET = route(async () => {
  const u = await requireActive();
  const rekan = await listRekanShift(u);
  return ok({ items: rekan.map((r) => ({ id: r.id, nama: r.nama_lengkap, nopek: r.nopek, shift: r.nama_shift })) });
});
