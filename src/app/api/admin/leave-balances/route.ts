import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { hitungSaldo } from "@/repositories/leaves";
import { listUsers } from "@/repositories/users";

// GET /api/admin/leave-balances?year= — rekap saldo cuti semua pekerja aktif.
export const GET = route(async (req) => {
  await requireAdmin();
  const tahun = Number(qp(req, "year")) || new Date().getFullYear();
  const users = await listUsers({ status: "active" });
  const items = [];
  for (const u of users) {
    if (u.role === "admin") continue;
    const s = await hitungSaldo(u.id, tahun);
    items.push({ user_id: u.id, nama: u.nama_lengkap, nopek: u.nopek, ...s });
  }
  return ok({ items });
});
