import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { companySchema } from "@/schemas";
import { createCompany, listCompanies } from "@/repositories/masters";

export const GET = route(async () => {
  await requireAdmin();
  return ok({ items: await listCompanies() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const data = companySchema.parse(await readJson(req));
  const row = await createCompany(admin.email, data);
  return ok({ item: row }, 201);
});
