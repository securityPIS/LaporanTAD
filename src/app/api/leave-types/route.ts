import { ok, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { listLeaveTypes } from "@/repositories/leaves";

// GET /api/leave-types — daftar jenis cuti aktif (untuk form).
export const GET = route(async () => {
  await requireActive();
  return ok({ items: await listLeaveTypes() });
});
