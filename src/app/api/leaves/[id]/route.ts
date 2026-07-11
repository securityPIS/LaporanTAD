import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { deleteLeave, updateLeave } from "@/repositories/leaves";
import { leaveSchema } from "@/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  const input = leaveSchema.parse(await readJson(req));
  const row = await updateLeave(u, id, input);
  return ok({ item: row });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  await deleteLeave(u, id);
  return ok({ ok: true });
});
