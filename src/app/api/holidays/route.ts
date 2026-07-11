import { ok, qp, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { listHolidays } from "@/repositories/masters";

// GET /api/holidays?year= — libur nasional (untuk kalender & form lembur).
export const GET = route(async (req) => {
  await requireActive();
  const year = qp(req, "year");
  return ok({ items: await listHolidays(year ? Number(year) : undefined) });
});
