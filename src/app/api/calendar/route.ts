import { ok, qp, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { calendarEvents } from "@/repositories/calendar";
import { todayWIB } from "@/lib/wib";

// GET /api/calendar?month=YYYY-MM — kejadian kalender sesuai visibilitas.
export const GET = route(async (req) => {
  const u = await requireActive();
  const month = qp(req, "month") ?? todayWIB().slice(0, 7);
  return ok({ month, events: await calendarEvents(u, month) });
});
