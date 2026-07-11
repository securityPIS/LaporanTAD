import { ok, qp, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { holidaySchema } from "@/schemas";
import { listHolidays, upsertHoliday } from "@/repositories/masters";
import { syncHolidaysFromPublic } from "@/repositories/holiday-sync";

export const GET = route(async (req) => {
  await requireAdmin();
  const year = qp(req, "year");
  return ok({ items: await listHolidays(year ? Number(year) : undefined) });
});

// POST /api/admin/holidays — tambah/koreksi manual, atau { sync: true, year } untuk
// menarik dari sumber publik (tombol sync manual admin, FR-KAL-04).
export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const body = await readJson<{ sync?: boolean; year?: number; tanggal?: string; nama?: string }>(req);
  if (body.sync) {
    const year = body.year ?? new Date().getFullYear();
    const n = await syncHolidaysFromPublic(admin.email, year);
    return ok({ synced: n, year });
  }
  const data = holidaySchema.parse(body);
  const row = await upsertHoliday(admin.email, data.tanggal, data.nama);
  return ok({ item: row }, 201);
});
