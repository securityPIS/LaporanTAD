import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { deleteOvertime, updateOvertime } from "@/repositories/overtime";
import { overtimeSchema } from "@/schemas";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/overtime/{id} — ubah catatan sendiri (cek kunci periode + batas).
export const PATCH = route<Ctx>(async (req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  const input = overtimeSchema.parse(await readJson(req));
  const { row, warnings } = await updateOvertime(u, id, input);
  return ok({ item: row, warnings });
});

// DELETE /api/overtime/{id} — hapus catatan sendiri.
export const DELETE = route<Ctx>(async (_req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  await deleteOvertime(u, id);
  return ok({ ok: true });
});
