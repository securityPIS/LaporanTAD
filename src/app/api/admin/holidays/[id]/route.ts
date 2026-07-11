import { ok, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { deleteHoliday } from "@/repositories/masters";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  await deleteHoliday(admin.email, id);
  return ok({ ok: true });
});
