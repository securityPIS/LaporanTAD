import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { createLeave, listLeavesByUser } from "@/repositories/leaves";
import { leaveSchema } from "@/schemas";

// GET /api/leaves — daftar cuti milik sendiri.
export const GET = route(async () => {
  const u = await requireActive();
  const rows = await listLeavesByUser(u.id);
  return ok({ items: rows });
});

// POST /api/leaves — catat cuti (validasi saldo & lampiran).
export const POST = route(async (req) => {
  const u = await requireActive();
  const input = leaveSchema.parse(await readJson(req));
  const row = await createLeave(u, input);
  return ok({ item: row }, 201);
});
