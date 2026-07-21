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
function isKendaraanPribadi(k: string): boolean {
  return /kendaraan\s*pribadi|pribadi/i.test(k);
}

/**
 * Komponen transport antar-kota (bukan Transport Lokal): tiket transportasi
 * umum, transport ke bandara/terminal/stasiun/pelabuhan, atau kendaraan
 * pribadi. Komponen inilah yang dipisah pergi/pulang & wajib berbukti.
 */
export function isTransportPerjalanan(komponen: string): boolean {
  const k = (komponen || "").trim();
  if (!k) return false;
  if (isTransportLokal(k)) return false;
  return isTransportBandara(k) || isTransportasiUmum(k) || isKendaraanPribadi(k);
}

/**
 * Apakah komponen wajib melampirkan bukti. Transport antar-kota (tiket /
 * transport bandara) wajib bukti tiket; bila kendaraan pribadi, wajib bukti
 * jarak (pergi & pulang). Return null bila tidak wajib.
 */
export function buktiWajibUntuk(komponen: string): "tiket" | "jarak" | null {
  if (!isTransportPerjalanan(komponen)) return null;
  return isKendaraanPribadi(komponen) ? "jarak" : "tiket";
}

/** Alasan bukti komponen kurang lengkap, atau null bila sudah/ tak wajib. */
export function alasanBuktiKurang(komponen: string, buktiFileId: string): string | null {
  const wajib = buktiWajibUntuk(komponen);
  if (!wajib) return null;
  const ada = (buktiFileId || "").split(",").map((s) => s.trim()).filter(Boolean).length > 0;
  if (ada) return null;
  return wajib === "jarak"
    ? "Wajib lampirkan bukti jarak (pergi & pulang) untuk kendaraan pribadi."
    : "Wajib lampirkan bukti tiket.";
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
