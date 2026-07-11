import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { templateSchema } from "@/schemas";
import { createTemplate, listTemplates } from "@/repositories/masters";

export const GET = route(async () => {
  await requireAdmin();
  return ok({ items: await listTemplates() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const data = templateSchema.parse(await readJson(req));
  const row = await createTemplate(admin.email, data);
  return ok({ item: row }, 201);
});
