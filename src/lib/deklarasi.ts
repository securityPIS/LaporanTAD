// Pembuat data Deklarasi Dinas (rincian biaya sepulang dinas): merangkum
// realisasi perjalanan + komponen biaya menjadi placeholder header + baris
// tabel berulang. Fungsi murni (tanpa I/O) — dipakai /api/generate.

import { fmtRange, fmtTgl, parseISO } from "./date";
import { fmtRupiah } from "./rupiah";
import { totalBiaya } from "./trip-view";
import { ownerPlaceholders, type OwnerLike } from "./doc-fields";
import type { TripCostRow, TripRow } from "./db/tables";

/**
 * Satu baris biaya pada tabel "Rincian Pengeluaran" Deklarasi — dipetakan ke
 * {{@key}} oleh GAS. Kolom mengikuti format dokumen: No · Keterangan (komponen)
 * · Vol/Hari · Nilai Rupiah (tarif satuan) · Mata Uang Lain · Jumlah (Rp).
 */
export interface DeklarasiRow {
  [k: string]: string;
  no: string;
  komponen: string;
  vol: string;
  nilai: string;
  mata_uang: string;
  jumlah: string;
}

/** Lama hari inklusif antara dua tanggal ISO ("YYYY-MM-DD"). */
export function lamaHari(mulai: string, selesai: string): number {
  const a = parseISO(mulai).getTime();
  const b = parseISO(selesai).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

/**
 * Ubah daftar komponen biaya (urut) menjadi baris tabel bernomor.
 * Vol & Nilai Rupiah hanya ditampilkan bila tarif satuan diketahui (> 0);
 * untuk pos lump-sum / data lama tanpa tarif, kedua kolom dibiarkan kosong —
 * sesuai format dokumen (mis. baris "Akomodasi Penginapan").
 */
export function buildDeklarasiRows(costs: TripCostRow[]): DeklarasiRow[] {
  return [...costs]
    .sort((a, b) => a.urutan - b.urutan)
    .map((c, i) => {
      const tarif = Number(c.tarif) || 0;
      const vol = Number(c.vol) || 0;
      return {
        no: String(i + 1),
        komponen: c.komponen,
        vol: tarif > 0 && vol > 0 ? String(vol) : "",
        nilai: tarif > 0 ? fmtRupiah(tarif) : "",
        mata_uang: "",
        jumlah: fmtRupiah(c.jumlah),
      };
    });
}

/** Placeholder header ({{nama}}, {{tujuan}}, {{total_biaya}}, …) untuk template Deklarasi. */
export function buildDeklarasiHeader(
  owner: OwnerLike,
  trip: TripRow,
  costs: TripCostRow[],
  tanggalCetak: string,
): Record<string, string> {
  const rMulai = trip.tanggal_realisasi_mulai || trip.tanggal_mulai;
  const rSelesai = trip.tanggal_realisasi_selesai || trip.tanggal_selesai;
  return {
    ...ownerPlaceholders(owner, tanggalCetak),
    dari: owner.lokasi_kerja, // asal perjalanan = lokasi kerja pemohon
    tujuan: trip.tujuan,
    keperluan: trip.keperluan,
    transportasi: trip.transportasi,
    tanggal_mulai: fmtTgl(trip.tanggal_mulai),
    tanggal_selesai: fmtTgl(trip.tanggal_selesai),
    durasi: fmtRange(trip.tanggal_mulai, trip.tanggal_selesai),
    realisasi_mulai: fmtTgl(rMulai),
    realisasi_selesai: fmtTgl(rSelesai),
    realisasi_durasi: fmtRange(rMulai, rSelesai),
    lama_hari: `${lamaHari(rMulai, rSelesai)} hari`,
    catatan: trip.deklarasi_catatan,
    total_komponen: String(costs.length),
    total_biaya: fmtRupiah(totalBiaya(costs)),
  };
}
