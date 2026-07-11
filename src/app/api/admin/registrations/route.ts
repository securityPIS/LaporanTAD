import { ok, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { listPending } from "@/repositories/users";

// GET /api/admin/registrations — daftar pendaftar pending (seluruh isian).
export const GET = route(async () => {
  await requireAdmin();
  return ok({ items: await listPending() });
});
