// Util hitung jumlah hari kalender (dipakai form cuti untuk estimasi cepat).
import { parseISO } from "./date";

/** Jumlah hari kalender antara dua tanggal (inklusif). Minimal 1. */
export function hitungHari(mulai: string, selesai: string): number {
  const a = parseISO(mulai);
  const b = parseISO(selesai);
  const d = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return d > 0 ? d : 1;
}
