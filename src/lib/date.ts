// Util tanggal berbahasa Indonesia — diporting dari LaporanTAD.dc.html.
// Semua tanggal transaksi memakai format ISO "YYYY-MM-DD".

export const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
export const BULANS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "Hari ini" tetap ditetapkan 11 Jul 2026 agar konsisten dengan data contoh. */
export const TODAY_ISO = "2026-07-11";

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** contoh: "Sab, 11 Jul 2026" */
export function fmtTgl(iso: string): string {
  const dt = parseISO(iso);
  return `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULANS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** contoh: "11 Jul 2026" · "12–14 Feb 2026" · "5 Mar – 2 Apr 2026" */
export function fmtRange(a: string, b: string): string {
  const da = parseISO(a);
  const db = parseISO(b);
  if (a === b) return `${da.getDate()} ${BULANS[da.getMonth()]} ${da.getFullYear()}`;
  if (da.getMonth() === db.getMonth())
    return `${da.getDate()}–${db.getDate()} ${BULANS[da.getMonth()]} ${da.getFullYear()}`;
  return `${da.getDate()} ${BULANS[da.getMonth()]} – ${db.getDate()} ${BULANS[db.getMonth()]} ${db.getFullYear()}`;
}

/** label panjang: "Sabtu-style" -> "Sab, 11 Juli 2026" (bulan penuh). */
export function fmtLong(iso: string): string {
  const dt = parseISO(iso);
  return `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULAN[dt.getMonth()]} ${dt.getFullYear()}`;
}
