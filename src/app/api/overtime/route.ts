import { ok, qp, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { createOvertime, listOvertimeByUser } from "@/repositories/overtime";
import { overtimeSchema } from "@/schemas";

// GET /api/overtime?month=YYYY-MM — daftar lembur milik sendiri.
export const GET = route(async (req) => {
  const u = await requireActive();
  const rows = await listOvertimeByUser(u.id, qp(req, "month"));
  return ok({ items: rows });
});

// POST /api/overtime — catat lembur (cek periode, batas jam, tanggal).
export const POST = route(async (req) => {
  const u = await requireActive();
  const input = overtimeSchema.parse(await readJson(req));
  const { row, warnings } = await createOvertime(u, input);
  return ok({ item: row, warnings }, 201);
});
