import { ok, qp, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { createOvertime, listOvertimeByUser } from "@/repositories/overtime";
import { db } from "@/lib/db";
import { overtimeSchema } from "@/schemas";

// GET /api/overtime?month=YYYY-MM — daftar lembur milik sendiri.
export const GET = route(async (req) => {
  const u = await requireActive();
  const rows = await listOvertimeByUser(u.id, qp(req, "month"));
  const users = new Map((await db.all("users")).map((x) => [x.id, x.nama_lengkap]));
  const items = rows.map((o) => ({
    ...o,
    replaced_nama: o.replaced_user_id ? users.get(o.replaced_user_id) ?? "" : "",
  }));
  return ok({ items });
});

// POST /api/overtime — catat lembur (cek periode, batas jam, tanggal).
export const POST = route(async (req) => {
  const u = await requireActive();
  const input = overtimeSchema.parse(await readJson(req));
  const { row, warnings } = await createOvertime(u, input);
  return ok({ item: row, warnings }, 201);
});
