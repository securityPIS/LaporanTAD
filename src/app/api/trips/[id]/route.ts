import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { deleteTrip, updateTrip } from "@/repositories/trips";
import { tripSchema } from "@/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  const input = tripSchema.parse(await readJson(req));
  const row = await updateTrip(u, id, input);
  return ok({ item: row });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  await deleteTrip(u, id);
  return ok({ ok: true });
});
