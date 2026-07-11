// Perhitungan jumlah hari cuti (FR-CTI-05):
// - non-shift: hari kalender dikurangi Sabtu/Minggu & libur nasional
// - shift: hari kalender penuh (jadwal shift tidak diketahui sistem)
// Keduanya dapat dikoreksi manual ke bawah oleh pengguna.

function eachDate(mulai: string, selesai: string): string[] {
  const out: string[] = [];
  const [ys, ms, ds] = mulai.split("-").map(Number);
  const [ye, me, de] = selesai.split("-").map(Number);
  const cur = new Date(Date.UTC(ys, ms - 1, ds));
  const end = new Date(Date.UTC(ye, me - 1, de));
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function hitungHariCuti(
  tanggalMulai: string,
  tanggalSelesai: string,
  tipeKerja: "shift" | "nonshift",
  holidays: Set<string>,
): number {
  const dates = eachDate(tanggalMulai, tanggalSelesai);
  if (tipeKerja === "shift") return dates.length;
  let n = 0;
  for (const iso of dates) {
    const [y, m, d] = iso.split("-").map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const weekend = day === 0 || day === 6;
    if (!weekend && !holidays.has(iso)) n++;
  }
  return Math.max(n, 0);
}
