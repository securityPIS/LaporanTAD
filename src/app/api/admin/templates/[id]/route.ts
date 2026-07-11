import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { templateSchema } from "@/schemas";
import { deleteTemplate, updateTemplate } from "@/repositories/masters";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const data = templateSchema.partial().parse(await readJson(req));
  const row = await updateTemplate(admin.email, id, data);
  return ok({ item: row });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  await deleteTemplate(admin.email, id);
  return ok({ ok: true });
});
