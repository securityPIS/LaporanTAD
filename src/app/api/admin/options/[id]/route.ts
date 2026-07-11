import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { optionSchema } from "@/schemas";
import { deleteOption, updateOption } from "@/repositories/masters";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const data = optionSchema.partial().parse(await readJson(req));
  const row = await updateOption(admin.email, id, data);
  return ok({ item: row });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  await deleteOption(admin.email, id);
  return ok({ ok: true });
});
