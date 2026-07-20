// Aturan klaim biaya Deklarasi Dinas (Ketentuan Dinas). Fungsi murni agar dapat
// dipakai bersama oleh klien (DeklarasiModal), skema (validasi server), dan uji.
//
// Aturan:
//  1. Dinas RESIDENSIAL (akomodasi/lainnya sudah difasilitasi penyelenggara) →
//     tidak boleh klaim Akomodasi Penginapan & Transport Lokal.
//  2. Pergi/pulang memakai KENDARAAN PRIBADI → tidak boleh klaim tiket
//     Transportasi Umum & Transport ke bandara/terminal/stasiun/pelabuhan.

export type SifatDinas = "residensial" | "non_residensial";

export interface AturanDinas {
  sifat?: SifatDinas | "";
  kendaraanPribadi?: boolean;
}

/** Label tampil untuk sifat dinas (dipakai dokumen & UI). */
export function labelSifat(sifat: string | undefined): string {
  if (sifat === "residensial") return "Residensial";
  if (sifat === "non_residensial") return "Non-Residensial";
  return "";
}

// Klasifikasi longgar berbasis kata kunci agar tahan variasi penulisan komponen.
function isAkomodasi(k: string): boolean {
  return /akomodasi|penginapan|hotel/i.test(k);
}
function isTransportLokal(k: string): boolean {
  return /transport\s*lokal/i.test(k);
}
function isTransportBandara(k: string): boolean {
  return /bandara|terminal|stasiun|stasion|pelabuhan/i.test(k);
}
function isTransportasiUmum(k: string): boolean {
  // Tiket moda umum. Dikecualikan bila jelas "kendaraan pribadi".
  if (/kendaraan\s*pribadi|pribadi/i.test(k)) return false;
  return /transportasi\s*umum|tiket|pesawat|kereta|whoosh|bis\b|bus\b|travel/i.test(k);
}

/**
 * Alasan sebuah komponen biaya dilarang menurut aturan aktif, atau null bila
 * boleh diklaim. Pemeriksaan longgar (berbasis kata kunci nama komponen).
 */
export function alasanKomponenDilarang(komponen: string, opt: AturanDinas): string | null {
  const k = (komponen || "").trim();
  if (!k) return null;
  if (opt.sifat === "residensial") {
    if (isAkomodasi(k)) return "Dinas residensial: akomodasi sudah difasilitasi penyelenggara.";
    if (isTransportLokal(k)) return "Dinas residensial: transport lokal sudah difasilitasi penyelenggara.";
  }
  if (opt.kendaraanPribadi) {
    if (isTransportBandara(k)) return "Kendaraan pribadi: transport ke bandara/terminal/stasiun/pelabuhan tidak dapat diklaim.";
    if (isTransportasiUmum(k)) return "Kendaraan pribadi: tiket transportasi umum tidak dapat diklaim.";
  }
  return null;
}

/** Apakah komponen ketentuan (nama kanonik) tersedia untuk diklaim saat ini. */
export function komponenTersedia(nama: string, opt: AturanDinas): boolean {
  return alasanKomponenDilarang(nama, opt) === null;
}
