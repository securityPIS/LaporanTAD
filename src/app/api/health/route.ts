import { ok, route } from "@/lib/api";
import { db } from "@/lib/db";
import { isDriveConfigured, isGasConfigured, isSheetsConfigured } from "@/lib/env";
import { gasPing } from "@/lib/gas";

// GET /api/health — status koneksi Sheets · Drive · GAS (DoD Fase 0).
export const GET = route(async () => {
  const result = { sheets: "", drive: "", gas: "", mode: "" };

  if (isSheetsConfigured()) {
    try {
      await db.all("settings");
      result.sheets = "OK";
    } catch {
      result.sheets = "GAGAL";
    }
    result.mode = "produksi";
  } else {
    await db.all("settings"); // memicu seed
    result.sheets = "OK (memory)";
    result.mode = "dev";
  }

  result.drive = isDriveConfigured() ? "OK" : "OK (lokal)";
  result.gas = isGasConfigured() ? ((await gasPing()) ? "OK" : "GAGAL") : "N/A (dev)";

  return ok(result);
});
