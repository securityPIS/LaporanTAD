import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { listAudit } from "@/lib/audit";

// GET /api/admin/audit — log audit dengan filter aktor/entitas/rentang tanggal.
export const GET = route(async (req) => {
  await requireAdmin();
  const items = await listAudit({
    actor: qp(req, "actor"),
    entitas: qp(req, "entitas"),
    from: qp(req, "from"),
    to: qp(req, "to"),
  });
  return ok({ items: items.slice(0, 500) });
});
