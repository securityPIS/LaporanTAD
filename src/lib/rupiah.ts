// Format mata uang Rupiah. Nilai disimpan sebagai bilangan bulat rupiah
// (tanpa desimal sen) — konsisten dengan kolom `jumlah` pada trip_costs.

/** contoh: 2400000 → "Rp 2.400.000" */
export function fmtRupiah(n: number): string {
  const bulat = Math.round(n || 0);
  const tanda = bulat < 0 ? "-" : "";
  const digit = Math.abs(bulat).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${tanda}Rp ${digit}`;
}

/** Versi ringkas untuk kartu sempit: 2400000 → "Rp 2,4 jt", 950000 → "Rp 950 rb". */
export function fmtRupiahShort(n: number): string {
  const v = Math.round(n || 0);
  const abs = Math.abs(v);
  const tanda = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${tanda}Rp ${trim(abs / 1_000_000_000)} M`;
  if (abs >= 1_000_000) return `${tanda}Rp ${trim(abs / 1_000_000)} jt`;
  if (abs >= 1_000) return `${tanda}Rp ${trim(abs / 1_000)} rb`;
  return fmtRupiah(v);
}

/** Satu angka desimal, tanpa ".0" yang tak perlu (2.0 → "2", 2.4 → "2,4"). */
function trim(x: number): string {
  return (Math.round(x * 10) / 10).toString().replace(".", ",");
}
