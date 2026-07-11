import { env, isGasConfigured } from "./env";
import { AppError } from "./errors";

/**
 * Klien Google Apps Script (docgen). Vercel↔GAS memakai shared secret.
 * Payload berisi data dokumen + ttd_file_id; GAS meng-copy template Docs →
 * replace placeholder → sisip TTD → export PDF → simpan Drive → balas file_id.
 */
export interface GasGeneratePayload {
  jenis: "spkl" | "spd" | "deklarasi_dinas" | "surat_cuti";
  gdoc_id: string;
  placeholders: Record<string, string>;
  ttd_file_id?: string;
  ttd_data_url?: string;
  output_folder: string;
  output_name: string;
}

export interface GasGenerateResult {
  file_id: string;
  name: string;
  mime: string;
  size: number;
}

export async function gasGenerate(payload: GasGeneratePayload): Promise<GasGenerateResult> {
  if (!isGasConfigured()) {
    throw new AppError(
      "LAYANAN_BELUM_SIAP",
      "Layanan pembuatan dokumen (GAS) belum dikonfigurasi. Set GAS_WEBAPP_URL & GAS_SHARED_SECRET.",
      503,
    );
  }
  const res = await fetch(env.gasWebappUrl!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: env.gasSharedSecret, action: "generate", ...payload }),
  });
  if (!res.ok) {
    throw new AppError("GAGAL", `GAS docgen gagal (HTTP ${res.status}).`, 502);
  }
  const data = (await res.json()) as GasGenerateResult & { error?: string };
  if (data.error) throw new AppError("GAGAL", `GAS: ${data.error}`, 502);
  return data;
}

export async function gasPing(): Promise<boolean> {
  if (!isGasConfigured()) return false;
  try {
    const url = `${env.gasWebappUrl}?secret=${encodeURIComponent(env.gasSharedSecret!)}&action=ping`;
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}
