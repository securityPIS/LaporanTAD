import { ok, qp, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { optionSchema } from "@/schemas";
import { createOption, listOptions } from "@/repositories/masters";
import type { MasterOptionRow } from "@/lib/db/tables";

export const GET = route(async (req) => {
  await requireAdmin();
  const kategori = qp(req, "kategori") as MasterOptionRow["kategori"] | undefined;
  return ok({ items: await listOptions(kategori) });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const data = optionSchema.parse(await readJson(req));
  const row = await createOption(admin.email, data);
  return ok({ item: row }, 201);
});
