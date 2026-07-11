/**
 * Skrip seed data awal — dapat diulang (idempoten dalam arti mengganti isi).
 * Menulis ke backend terkonfigurasi: Google Sheets bila kredensial ada,
 * jika tidak ke driver in-memory (untuk uji lokal).
 *
 * Jalankan: `npm run seed` (pastikan env terisi untuk produksi).
 */
import { db } from "../src/lib/db";
import { buildSeed } from "../src/lib/seed-data";
import type { TableName } from "../src/lib/db/tables";

async function main() {
  const seed = buildSeed();
  const tables = Object.keys(seed) as TableName[];
  for (const table of tables) {
    const rows = seed[table] as never[];
    await db.replaceAll(table, rows);
    console.log(`  ✓ ${table}: ${rows.length} baris`);
  }
  console.log("Seed selesai.");
}

main().catch((e) => {
  console.error("Seed gagal:", e);
  process.exit(1);
});
