// Logika cuti — diporting dari LaporanTAD.dc.html.
import { parseISO } from "./date";
import type { CutiItem } from "./types";

/** Jumlah hari kalender antara dua tanggal (inklusif). Minimal 1. */
export function hitungHari(mulai: string, selesai: string): number {
  const a = parseISO(mulai);
  const b = parseISO(selesai);
  const d = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return d > 0 ? d : 1;
}

export interface SaldoCuti {
  kuota: number;
  terpakai: number;
  sisa: number;
  deg: string; // sudut untuk conic-gradient donut
}

/** Saldo cuti tahunan: hanya jenis "potong saldo" yang mengurangi. */
export function hitungSaldo(history: CutiItem[], kuota = 12): SaldoCuti {
  const terpakai = history.filter((c) => c.potong).reduce((a, c) => a + c.hari, 0);
  const sisa = kuota - terpakai;
  return { kuota, terpakai, sisa, deg: `${Math.round((terpakai / kuota) * 360)}deg` };
}
