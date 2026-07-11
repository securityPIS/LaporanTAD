import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { listUsers } from "@/repositories/users";
import type { UserRow } from "@/lib/db/tables";

// GET /api/admin/users — semua pekerja + status (master data pekerja, FR-ADM-02).
export const GET = route(async (req) => {
  await requireAdmin();
  const status = qp(req, "status") as UserRow["status"] | undefined;
  const items = await listUsers(status ? { status } : undefined);
  return ok({ items });
});
