import { isSheetsConfigured } from "@/lib/env";
import { cached, invalidate } from "@/lib/cache";
import type { DbDriver } from "./driver";
import { getMemoryDriver } from "./memory-driver";
import { SheetsDriver } from "./sheets-driver";
import { buildSeed } from "@/lib/seed-data";
import type { TableMap, TableName } from "./tables";

const g = globalThis as unknown as {
  __ltadDriver?: DbDriver;
  __ltadSeeded?: Promise<void>;
};

/** Pilih driver: Sheets bila kredensial ada, jika tidak in-memory (dev/demo). */
function driver(): DbDriver {
  if (!g.__ltadDriver) {
    g.__ltadDriver = isSheetsConfigured() ? new SheetsDriver() : getMemoryDriver();
  }
  return g.__ltadDriver;
}

/** Dalam mode memory, isi data awal sekali bila tabel `users` masih kosong. */
async function ensureSeeded(): Promise<void> {
  if (isSheetsConfigured()) return; // produksi diseed via `npm run seed`
  if (!g.__ltadSeeded) {
    g.__ltadSeeded = (async () => {
      const d = driver();
      const existing = await d.all("users");
      if (existing.length > 0) return;
      const seed = buildSeed();
      for (const table of Object.keys(seed) as TableName[]) {
        await d.replaceAll(table, seed[table] as never[]);
      }
    })();
  }
  return g.__ltadSeeded;
}

/**
 * TTL cache baca per tabel (ARSITEKTUR §10: cache in-memory ber-TTL).
 * Satu `all()` = satu request HTTP penuh ke Sheets API, jadi SEMUA tabel
 * di-cache di lapisan ini — master lebih lama, transaksional singkat agar
 * data pengguna tetap terasa segar. Setiap tulisan meng-invalidasi tabelnya.
 */
const CACHE_TTL: Record<TableName, number> = {
  users: 60_000,
  companies: 60_000,
  master_options: 60_000,
  holidays: 60_000,
  leave_types: 60_000,
  doc_templates: 60_000,
  settings: 60_000,
  period_locks: 30_000,
  overtime: 15_000,
  leaves: 15_000,
  leave_balances: 15_000,
  trips: 15_000,
  documents: 15_000,
  audit_log: 15_000,
};

const cacheKey = (table: TableName) => `tbl:${table}`;

export function invalidateTable(table: TableName): void {
  invalidate(cacheKey(table));
}

export const db = {
  async all<T extends TableName>(table: T): Promise<TableMap[T][]> {
    await ensureSeeded();
    const rows = await cached(cacheKey(table), CACHE_TTL[table], () => driver().all(table));
    // Salinan array: pemanggil boleh sort/filter in-place tanpa merusak cache.
    return rows.slice();
  },
  async insert<T extends TableName>(table: T, row: TableMap[T]): Promise<TableMap[T]> {
    await ensureSeeded();
    const saved = await driver().insert(table, row);
    invalidateTable(table);
    return saved;
  },
  async updateById<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<TableMap[T]>,
  ): Promise<TableMap[T] | null> {
    await ensureSeeded();
    const saved = await driver().updateById(table, id, patch);
    invalidateTable(table);
    return saved;
  },
  async deleteById<T extends TableName>(table: T, id: string): Promise<boolean> {
    await ensureSeeded();
    const ok = await driver().deleteById(table, id);
    invalidateTable(table);
    return ok;
  },
  async replaceAll<T extends TableName>(table: T, rows: TableMap[T][]): Promise<void> {
    await driver().replaceAll(table, rows);
    invalidateTable(table);
  },
  /** Cari satu baris berdasarkan predikat. */
  async findOne<T extends TableName>(
    table: T,
    pred: (r: TableMap[T]) => boolean,
  ): Promise<TableMap[T] | undefined> {
    const rows = await this.all(table);
    return rows.find(pred);
  },
  async findMany<T extends TableName>(
    table: T,
    pred: (r: TableMap[T]) => boolean,
  ): Promise<TableMap[T][]> {
    const rows = await this.all(table);
    return rows.filter(pred);
  },
};

export { isSheetsConfigured };
