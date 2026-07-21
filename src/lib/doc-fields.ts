// Placeholder identitas penanda tangan — dipakai SEMUA jenis dokumen resmi
// (SPKL, SPD, Deklarasi Dinas, Surat Cuti) agar konsisten & lengkap.
// Fungsi murni; GAS/template tinggal memakai {{nama}}, {{divisi}}, dst.

import { fmtTgl } from "./date";
import type { UserRow } from "./db/tables";

export type OwnerLike = Pick<
  UserRow,
  "nama_lengkap" | "nopek" | "divisi" | "bagian" | "lokasi_kerja"
>;

/** Identitas penanda tangan + tanggal cetak untuk header dokumen. */
export function ownerPlaceholders(owner: OwnerLike, tanggalCetak: string): Record<string, string> {
  return {
    nama: owner.nama_lengkap,
    nopek: owner.nopek,
    divisi: owner.divisi,
    bagian: owner.bagian,
    lokasi_kerja: owner.lokasi_kerja,
    dari: owner.lokasi_kerja, // asal perjalanan = lokasi kerja (alias, dipakai SPD/Deklarasi)
    tanggal_cetak: fmtTgl(tanggalCetak),
  };
}
