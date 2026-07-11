import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { listAllTrips } from "@/repositories/trips";
import { db } from "@/lib/db";

// GET /api/admin/trips — semua dinas + filter (FR-DNS-03).
export const GET = route(async (req) => {
  await requireAdmin();
  const rows = await listAllTrips({ month: qp(req, "month"), companyId: qp(req, "company"), lokasi: qp(req, "lokasi") });
  const users = new Map((await db.all("users")).map((u) => [u.id, u]));
  const items = rows.map((t) => {
    const u = users.get(t.user_id);
    return { ...t, nama: u?.nama_lengkap ?? "", nopek: u?.nopek ?? "", lokasi: u?.lokasi_kerja ?? "" };
  });
  return ok({ items });
});
