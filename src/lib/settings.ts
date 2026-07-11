import { db } from "./db";
import { cached, invalidate } from "./cache";

const DEFAULTS = {
  default_kuota_cuti: 12,
  batas_lembur_hari_kerja: 4,
  batas_lembur_libur: 12,
  batas_lembur_mingguan: 18,
} as const;

export type SettingKey = keyof typeof DEFAULTS;

async function map(): Promise<Record<string, string>> {
  return cached("settings", 60_000, async () => {
    const rows = await db.all("settings");
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  });
}

/** Angka aturan bisnis dibaca dari tab `settings` (bukan hard-code). */
export async function getNumberSetting(key: SettingKey): Promise<number> {
  const m = await map();
  const raw = m[key];
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : DEFAULTS[key];
}

export async function getBatasLembur() {
  const [hariKerja, libur, mingguan] = await Promise.all([
    getNumberSetting("batas_lembur_hari_kerja"),
    getNumberSetting("batas_lembur_libur"),
    getNumberSetting("batas_lembur_mingguan"),
  ]);
  return { hariKerja, libur, mingguan };
}

export function invalidateSettings() {
  invalidate("settings");
}
