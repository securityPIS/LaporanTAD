// Waktu WIB (Asia/Jakarta, UTC+7). Seluruh timestamp disimpan ISO-8601 WIB.

const WIB_OFFSET_MIN = 7 * 60;

/** Timestamp sekarang dalam ISO-8601 dengan offset +07:00. */
export function nowWIB(): string {
  return toWIBISO(new Date());
}

/** Konversi Date ke ISO-8601 WIB (mis. "2026-07-11T18:30:00+07:00"). */
export function toWIBISO(d: Date): string {
  const shifted = new Date(d.getTime() + WIB_OFFSET_MIN * 60_000);
  const iso = shifted.toISOString().replace("Z", "+07:00");
  return iso.slice(0, 19) + "+07:00";
}

/** Tanggal hari ini di WIB dalam format "YYYY-MM-DD". */
export function todayWIB(): string {
  const shifted = new Date(Date.now() + WIB_OFFSET_MIN * 60_000);
  return shifted.toISOString().slice(0, 10);
}

/** Periode "YYYY-MM" dari tanggal "YYYY-MM-DD". */
export function periodeOf(tanggalISO: string): string {
  return tanggalISO.slice(0, 7);
}
