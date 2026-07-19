// Bootstrap spreadsheet: buat seluruh tab (sesuai ARSITEKTUR §6) secara otomatis.
// Jalankan sekali pada spreadsheet kosong sebelum `npm run seed`.
//   npm run setup:sheets
import "./_env";
import { sheetsClient } from "../src/lib/google/auth";
import { TABLE_COLUMNS } from "../src/lib/db/tables";
import { isSheetsConfigured } from "../src/lib/env";

async function main() {
  if (!isSheetsConfigured()) {
    console.error(
      "✗ Kredensial Sheets belum lengkap. Isi .env.local: SHEETS_DATABASE_ID, GOOGLE_SA_EMAIL, GOOGLE_SA_PRIVATE_KEY.",
    );
    process.exit(1);
  }

  const api = sheetsClient();
  const ssId = process.env.SHEETS_DATABASE_ID!;
  const tables = Object.keys(TABLE_COLUMNS);

  const meta = await api.spreadsheets.get({ spreadsheetId: ssId });
  const existing = new Set((meta.data.sheets ?? []).map((s) => s.properties?.title ?? ""));

  const toAdd = tables.filter((t) => !existing.has(t));
  if (toAdd.length === 0) {
    console.log(`✓ Semua ${tables.length} tab sudah ada. Lanjut: npm run seed`);
    return;
  }

  await api.spreadsheets.batchUpdate({
    spreadsheetId: ssId,
    requestBody: { requests: toAdd.map((title) => ({ addSheet: { properties: { title } } })) },
  });
  console.log(`✓ Tab dibuat (${toAdd.length}): ${toAdd.join(", ")}`);

  // Hapus tab bawaan "Sheet1"/"Sheet2" bila ada dan bukan salah satu tabel.
  const after = await api.spreadsheets.get({ spreadsheetId: ssId });
  const junk = (after.data.sheets ?? []).filter(
    (s) => s.properties?.title && !tables.includes(s.properties.title),
  );
  if (junk.length && junk.length < (after.data.sheets ?? []).length) {
    await api.spreadsheets.batchUpdate({
      spreadsheetId: ssId,
      requestBody: {
        requests: junk.map((s) => ({ deleteSheet: { sheetId: s.properties!.sheetId! } })),
      },
    });
    console.log(`✓ Tab bawaan dihapus: ${junk.map((s) => s.properties!.title).join(", ")}`);
  }

  console.log("Selesai. Lanjut: npm run seed");
}

main().catch((e) => {
  console.error("✗ Gagal:", (e as Error).message || e);
  process.exit(1);
});
