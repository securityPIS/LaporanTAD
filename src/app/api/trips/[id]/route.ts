import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { deleteTrip, getTripDetail, updateTrip } from "@/repositories/trips";
import { AppError } from "@/lib/errors";
import { tripSchema } from "@/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  const detail = await getTripDetail(id);
  if (!detail) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
  if (u.role !== "admin" && detail.trip.user_id !== u.id) {
    throw new AppError("TIDAK_BERHAK", "Bukan catatan Anda", 403);
  }
  return ok({ trip: detail.view, costs: detail.costs, docs: detail.docs });
});

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
