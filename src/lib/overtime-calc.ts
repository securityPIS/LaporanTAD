// Perhitungan total jam lembur (FR-LBR-06):
// - mendukung lintas tengah malam (22:00–06:00 = 8 jam)
// - presisi 2 desimal, TIDAK PERNAH dibulatkan ke satuan jam/setengah jam apa pun.

/** Selisih menit antara dua "HH:mm"; bila selesai ≤ mulai, dianggap lewat tengah malam. */
export function selisihMenit(mulai: string, selesai: string): number {
  const [sh, sm] = mulai.split(":").map(Number);
  const [eh, em] = selesai.split(":").map(Number);
  let d = eh * 60 + em - (sh * 60 + sm);
  if (d <= 0) d += 1440;
  return d;
}

/** Total jam desimal presisi 2 (mis. 22:00–06:00 → 8, 17:37–20:00 → 2.38). */
export function hitungTotalJam(mulai: string, selesai: string): number {
  const menit = selisihMenit(mulai, selesai);
  return Math.round((menit / 60) * 100) / 100;
}

/** Format jam desimal → "H:MM" untuk tampilan (8 → "8:00", 3.5 → "3:30"). */
export function fmtJamHHMM(n: number): string {
  const t = Math.round(n * 60);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/** Awal minggu (Senin) untuk sebuah tanggal ISO — dipakai akumulasi mingguan. */
export function seninMingguIni(tanggalISO: string): string {
  const [y, m, d] = tanggalISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay(); // 0=Min..6=Sab
  const diff = day === 0 ? 6 : day - 1; // mundur ke Senin
  dt.setUTCDate(dt.getUTCDate() - diff);
  return dt.toISOString().slice(0, 10);
}

/** Tanggal ISO adalah Sabtu/Minggu? */
export function isAkhirPekan(tanggalISO: string): boolean {
  const [y, m, d] = tanggalISO.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 || day === 6;
}
