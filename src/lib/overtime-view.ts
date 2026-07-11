// View-model pengelompokan lembur untuk UI (bekerja pada bentuk OvertimeRow API).
import { BULAN, BULANS, HARI, parseISO } from "./date";
import { fmtJamHHMM } from "./overtime-calc";
import type { OvertimeJenis } from "./db/tables";

export interface OvertimeApiRow {
  id: string;
  tanggal: string;
  jenis: OvertimeJenis;
  keterangan: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jam: number;
  evidence_file_id: string;
  replaced_nama?: string;
}

export interface JenisMeta {
  label: string;
  c: string;
  w: string;
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
  tanggal: string;
  hari: string;
  jenis: OvertimeJenis;
  jenisLabel: string;
  jc: string;
  jw: string;
  ket: string;
  replaced: string;
  jamMulai: string;
  jamSelesai: string;
  jam: string;
  totalNum: number;
  total: string;
  evidence: string;
}

export interface OvertimeGroupVM {
  key: string;
  label: string;
  total: string;
  items: OvertimeCardVM[];
}

export function groupOvertimeRows(list: OvertimeApiRow[]): OvertimeGroupVM[] {
  const by: Record<string, OvertimeApiRow[]> = {};
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
        tot += o.total_jam;
        const m = jenisMeta(o.jenis);
        const dt = parseISO(o.tanggal);
        return {
          id: o.id,
          tanggal: o.tanggal,
          hari: `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULANS[dt.getMonth()]}`,
          jenis: o.jenis,
          jenisLabel: m.label,
          jc: m.c,
          jw: m.w,
          ket: o.keterangan,
          replaced: o.replaced_nama || "",
          jamMulai: o.jam_mulai,
          jamSelesai: o.jam_selesai,
          jam: `${o.jam_mulai} – ${o.jam_selesai}`,
          totalNum: o.total_jam,
          total: fmtJamHHMM(o.total_jam),
          evidence: o.evidence_file_id || "",
        };
      });
      const [y, mm] = k.split("-");
      return { key: k, label: `${BULAN[Number(mm) - 1]} ${y}`, total: fmtJamHHMM(tot), items: mapped };
    });
}
