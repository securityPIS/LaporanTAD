import { ok, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { createTrip, listTripViewsByUser } from "@/repositories/trips";
import { readJson } from "@/lib/api";
import { tripSchema } from "@/schemas";

export const GET = route(async () => {
  const u = await requireActive();
  return ok({ items: await listTripViewsByUser(u.id) });
});

export const POST = route(async (req) => {
  const u = await requireActive();
  const input = tripSchema.parse(await readJson(req));
  const row = await createTrip(u, input);
  return ok({ item: row }, 201);
});
