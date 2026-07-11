import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { hitungSaldo, listAllLeaves } from "@/repositories/leaves";
import { db } from "@/lib/db";

// GET /api/admin/leaves — semua cuti + info pekerja + sisa saldo (FR-CTI-09).
export const GET = route(async (req) => {
  await requireAdmin();
  const rows = await listAllLeaves({ month: qp(req, "month"), companyId: qp(req, "company"), lokasi: qp(req, "lokasi") });
  const users = new Map((await db.all("users")).map((u) => [u.id, u]));
  const types = new Map((await db.all("leave_types")).map((t) => [t.id, t.nama]));
  const tahun = new Date().getFullYear();
  const saldoCache = new Map<string, number>();
  const items = [];
  for (const l of rows) {
    const u = users.get(l.user_id);
    if (!saldoCache.has(l.user_id)) {
      saldoCache.set(l.user_id, (await hitungSaldo(l.user_id, tahun)).sisa);
    }
    items.push({
      ...l,
      nama: u?.nama_lengkap ?? "",
      nopek: u?.nopek ?? "",
      jenis: types.get(l.leave_type_id) ?? "",
      sisa_saldo: saldoCache.get(l.user_id),
    });
  }
  return ok({ items });
});
