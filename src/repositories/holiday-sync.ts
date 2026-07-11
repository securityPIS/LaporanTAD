import { upsertHoliday } from "./masters";

interface PublicHoliday {
  holiday_date: string;
  holiday_name: string;
  is_national_holiday: boolean;
}

/**
 * Sinkron libur nasional dari sumber publik (api-harilibur). Dipakai tombol
 * sync manual admin; di produksi cron GAS melakukan hal serupa setahun sekali.
 * Bila sumber tak dapat dijangkau, kembalikan 0 (data manual tetap dipertahankan).
 */
export async function syncHolidaysFromPublic(actorEmail: string, year: number): Promise<number> {
  let list: PublicHoliday[] = [];
  try {
    const res = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) list = (await res.json()) as PublicHoliday[];
  } catch {
    return 0;
  }
  let n = 0;
  for (const h of list) {
    if (!h.is_national_holiday) continue;
    // Normalisasi tanggal ke YYYY-MM-DD.
    const iso = h.holiday_date.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue;
    await upsertHoliday(actorEmail, iso, h.holiday_name, "api");
    n++;
  }
  return n;
}
