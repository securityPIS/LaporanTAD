import { db } from "./db";
import { AppError } from "./errors";
import { getBatasLembur } from "./settings";
import { hitungTotalJam, isAkhirPekan, seninMingguIni } from "./overtime-calc";
import type { OvertimeJenis, OvertimeRow } from "./db/tables";

/**
 * Pintu tunggal validasi batas jam lembur (FR-LBR-12), nilai batas dari `settings`:
 *  (a) hari kerja maks 4 jam/hari — KECUALI jenis `kjk` yang boleh melebihi;
 *  (b) akhir pekan / libur nasional maks 12 jam/hari;
 *  (c) akumulasi maks 18 jam/minggu (Senin–Minggu, semua jenis dijumlahkan).
 */
export async function assertBatasLembur(params: {
  userId: string;
  tanggal: string;
  jenis: OvertimeJenis;
  jamMulai: string;
  jamSelesai: string;
  excludeId?: string; // saat edit — abaikan catatan yang sedang diubah
}): Promise<void> {
  const { userId, tanggal, jenis, jamMulai, jamSelesai, excludeId } = params;
  const batas = await getBatasLembur();
  const jamIni = hitungTotalJam(jamMulai, jamSelesai);

  const isLibur = isAkhirPekan(tanggal) || (await isHariLibur(tanggal));

  // (a)/(b) batas harian
  const others = await db.findMany(
    "overtime",
    (o) => o.user_id === userId && o.tanggal === tanggal && o.id !== excludeId,
  );
  const totalHariIni = others.reduce((a, o) => a + o.total_jam, 0) + jamIni;

  if (isLibur) {
    if (totalHariIni > batas.libur) {
      throw new AppError(
        "BATAS_LEMBUR",
        `Total lembur pada hari libur (${fmt(totalHariIni)} jam) melebihi batas ${batas.libur} jam/hari.`,
        422,
      );
    }
  } else if (jenis !== "kjk") {
    // Batas 4 jam hari kerja — KJK dikecualikan. Namun bila ada catatan KJK di
    // hari sama, hanya jam non-KJK yang dihitung terhadap batas.
    const nonKjkLain = others
      .filter((o) => o.jenis !== "kjk")
      .reduce((a, o) => a + o.total_jam, 0);
    const totalNonKjk = nonKjkLain + jamIni;
    if (totalNonKjk > batas.hariKerja) {
      throw new AppError(
        "BATAS_LEMBUR",
        `Total lembur non-KJK pada hari kerja (${fmt(totalNonKjk)} jam) melebihi batas ${batas.hariKerja} jam/hari.`,
        422,
      );
    }
  }

  // (c) akumulasi mingguan — semua jenis dijumlahkan
  const senin = seninMingguIni(tanggal);
  const mingguDepan = addDays(senin, 7);
  const mingguRows = await db.findMany(
    "overtime",
    (o) =>
      o.user_id === userId &&
      o.tanggal >= senin &&
      o.tanggal < mingguDepan &&
      o.id !== excludeId,
  );
  const totalMinggu = mingguRows.reduce((a, o) => a + o.total_jam, 0) + jamIni;
  if (totalMinggu > batas.mingguan) {
    throw new AppError(
      "BATAS_LEMBUR",
      `Akumulasi lembur minggu ini (${fmt(totalMinggu)} jam) melebihi batas ${batas.mingguan} jam/minggu.`,
      422,
    );
  }
}

async function isHariLibur(tanggalISO: string): Promise<boolean> {
  const h = await db.findOne("holidays", (x) => x.tanggal === tanggalISO);
  return Boolean(h);
}

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString().replace(".", ",");
}

/** Peringatan tumpang tindih jam (FR-LBR-10) — non-blocking (dikembalikan sbg pesan). */
export function cekTumpangTindih(
  existing: OvertimeRow[],
  tanggal: string,
  jamMulai: string,
  jamSelesai: string,
  excludeId?: string,
): string | null {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  let s = toMin(jamMulai);
  let e = toMin(jamSelesai);
  if (e <= s) e += 1440;
  for (const o of existing) {
    if (o.tanggal !== tanggal || o.id === excludeId) continue;
    let os = toMin(o.jam_mulai);
    let oe = toMin(o.jam_selesai);
    if (oe <= os) oe += 1440;
    if (s < oe && os < e) return "Rentang jam bertumpuk dengan catatan lembur lain di tanggal ini.";
  }
  return null;
}
