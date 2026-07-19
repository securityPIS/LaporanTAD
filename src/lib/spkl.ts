// Pembuat data SPKL (Surat Perintah Kerja Lembur): merangkum banyak catatan
// lembur pada satu periode menjadi placeholder header + baris tabel berulang.
// Fungsi murni (tanpa I/O) agar mudah diuji — dipakai /api/generate/spkl.

import { fmtRange, fmtTgl } from "./date";
import { fmtJamHHMM } from "./overtime-calc";
import { jenisMeta } from "./overtime-view";
import { ownerPlaceholders, type OwnerLike } from "./doc-fields";
import type { OvertimeRow } from "./db/tables";

/** Satu baris lembur pada tabel SPKL — key polos, dipetakan ke {{@key}} oleh GAS. */
export interface SpklRow {
  [k: string]: string;
  no: string;
  tanggal: string;
  jenis: string;
  jam: string;
  total_jam: string;
  keterangan: string;
}

/** Ubah daftar lembur (urut ASC) menjadi baris tabel bernomor. */
export function buildSpklRows(rows: OvertimeRow[]): SpklRow[] {
  return rows.map((o, i) => ({
    no: String(i + 1),
    tanggal: fmtTgl(o.tanggal),
    jenis: jenisMeta(o.jenis).label,
    jam: `${o.jam_mulai}–${o.jam_selesai}`,
    total_jam: fmtJamHHMM(o.total_jam),
    keterangan: o.keterangan,
  }));
}

/** Total jam seluruh lembur pada periode, presisi 2 desimal. */
export function totalJam(rows: OvertimeRow[]): number {
  return Math.round(rows.reduce((s, o) => s + o.total_jam, 0) * 100) / 100;
}

/** Placeholder header tunggal ({{nama}}, {{periode}}, …) untuk template SPKL. */
export function buildSpklHeader(
  owner: OwnerLike,
  start: string,
  end: string,
  rows: OvertimeRow[],
  tanggalCetak: string,
): Record<string, string> {
  return {
    ...ownerPlaceholders(owner, tanggalCetak),
    periode: fmtRange(start, end),
    tanggal_mulai: fmtTgl(start),
    tanggal_selesai: fmtTgl(end),
    total_catatan: String(rows.length),
    total_jam: `${fmtJamHHMM(totalJam(rows))} jam`,
  };
}
