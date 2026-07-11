import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { listAllOvertime } from "@/repositories/overtime";
import { db } from "@/lib/db";

// GET /api/admin/overtime — semua lembur + filter (FR-LBR-11). Disertai info pekerja.
export const GET = route(async (req) => {
  await requireAdmin();
  const rows = await listAllOvertime({
    month: qp(req, "month"),
    companyId: qp(req, "company"),
    lokasi: qp(req, "lokasi"),
    jenis: qp(req, "jenis"),
  });
  const users = new Map((await db.all("users")).map((u) => [u.id, u]));
  const companies = new Map((await db.all("companies")).map((c) => [c.id, c.nama]));
  const items = rows.map((o) => {
    const u = users.get(o.user_id);
    return {
      ...o,
      nama: u?.nama_lengkap ?? "",
      nopek: u?.nopek ?? "",
      perusahaan: u ? companies.get(u.company_id) ?? "" : "",
      lokasi: u?.lokasi_kerja ?? "",
    };
  });
  return ok({ items });
});
