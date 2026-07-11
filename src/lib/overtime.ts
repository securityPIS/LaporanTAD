// Logika lembur — diporting persis dari LaporanTAD.dc.html.
// PENTING: total jam TIDAK PERNAH dibulatkan (keputusan pemilik produk).
import { BULAN, BULANS, HARI, parseISO } from "./date";
import type { Overtime, OvertimeJenis } from "./types";

/** Format desimal jam -> "H:MM" (mis. 3.5 -> "3:30"). */
export function fmtJam(n: number): string {
  const t = Math.round(n * 60);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/** Selisih jam antara dua waktu "HH:mm"; mendukung lintas tengah malam. */
export function calc(mulai: string, selesai: string): number {
  const [sh, sm] = mulai.split(":").map(Number);
  const [eh, em] = selesai.split(":").map(Number);
  let d = eh * 60 + em - (sh * 60 + sm);
  if (d <= 0) d += 1440;
  return d / 60;
}

export interface JenisMeta {
  label: string;
  c: string; // warna teks (var CSS)
  w: string; // warna latar lemah (var CSS)
}

export function jenisMeta(j: OvertimeJenis): JenisMeta {
  const m: Record<OvertimeJenis, JenisMeta> = {
    reguler: { label: "Reguler", c: "var(--accent)", w: "var(--accent-weak)" },
    libur_nasional: { label: "Libur Nasional", c: "var(--libur)", w: "var(--libur-weak)" },
    kjk: { label: "KJK", c: "var(--dinas)", w: "var(--dinas-weak)" },
    cuti: { label: "Lembur Cuti", c: "var(--cuti)", w: "var(--cuti-weak)" },
  };
  return m[j] ?? m.reguler;
}

export interface OvertimeCardVM {
  id: string;
  hari: string; // "Sab, 11 Jul"
  jenisLabel: string;
  jc: string;
  jw: string;
  ket: string;
  replaced: string;
  jam: string; // "18:00 – 21:00"
  total: string; // "3:00"
}

export interface OvertimeGroupVM {
  key: string; // "2026-07"
  label: string; // "Juli 2026"
  total: string; // total jam grup
  items: OvertimeCardVM[];
}

/** Kelompokkan lembur per bulan (terbaru dulu), lengkap dengan total jam. */
export function groupOvertime(list: Overtime[]): OvertimeGroupVM[] {
  const by: Record<string, Overtime[]> = {};
  list.forEach((o) => {
    const k = o.tanggal.slice(0, 7);
    (by[k] = by[k] || []).push(o);
  });
  return Object.keys(by)
    .sort()
    .reverse()
    .map((k) => {
      const items = by[k].slice().sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
      let tot = 0;
      const mapped: OvertimeCardVM[] = items.map((o) => {
        const t = calc(o.mulai, o.selesai);
        tot += t;
        const m = jenisMeta(o.jenis);
        const dt = parseISO(o.tanggal);
        return {
          id: o.id,
          hari: `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULANS[dt.getMonth()]}`,
          jenisLabel: m.label,
          jc: m.c,
          jw: m.w,
          ket: o.keterangan,
          replaced: o.replaced || "",
          jam: `${o.mulai} – ${o.selesai}`,
          total: fmtJam(t),
        };
      });
      const [y, mm] = k.split("-");
      return { key: k, label: `${BULAN[Number(mm) - 1]} ${y}`, total: fmtJam(tot), items: mapped };
    });
}

/** Total jam untuk satu bulan "YYYY-MM" + jumlah catatannya. */
export function monthSummary(list: Overtime[], ym: string): { total: string; count: number } {
  const items = list.filter((o) => o.tanggal.slice(0, 7) === ym);
  const tot = items.reduce((a, o) => a + calc(o.mulai, o.selesai), 0);
  return { total: fmtJam(tot), count: items.length };
}
