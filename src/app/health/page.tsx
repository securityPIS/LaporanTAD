import { db } from "@/lib/db";
import { isDriveConfigured, isGasConfigured, isSheetsConfigured } from "@/lib/env";
import { gasPing } from "@/lib/gas";

// Halaman /health — status koneksi Sheets · Drive · GAS (DoD Fase 0).
export const dynamic = "force-dynamic";

export default async function HealthPage() {
  let sheets = "OK (memory)";
  const mode = isSheetsConfigured() ? "produksi" : "dev/demo";
  if (isSheetsConfigured()) {
    try {
      await db.all("settings");
      sheets = "OK";
    } catch {
      sheets = "GAGAL";
    }
  } else {
    await db.all("settings");
  }
  const drive = isDriveConfigured() ? "OK" : "OK (lokal)";
  const gas = isGasConfigured() ? ((await gasPing()) ? "OK" : "GAGAL") : "N/A (dev)";

  const rows: [string, string][] = [
    ["Sheets", sheets],
    ["Drive", drive],
    ["GAS", gas],
    ["Mode", mode],
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono), monospace" }}>
      <div style={{ padding: 28, borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)", minWidth: 280 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>LaporanTAD · Health</div>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "6px 0" }}>
            <span style={{ color: "var(--muted)" }}>{k}</span>
            <strong style={{ color: v.startsWith("OK") ? "var(--lembur)" : v.includes("GAGAL") ? "var(--libur)" : "var(--muted)" }}>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
