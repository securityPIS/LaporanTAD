import { isSheetsConfigured } from "@/lib/env";
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

export const db = {
  async all<T extends TableName>(table: T): Promise<TableMap[T][]> {
    await ensureSeeded();
    return driver().all(table);
  },
  async insert<T extends TableName>(table: T, row: TableMap[T]): Promise<TableMap[T]> {
    await ensureSeeded();
    return driver().insert(table, row);
  },
  async updateById<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<TableMap[T]>,
  ): Promise<TableMap[T] | null> {
    await ensureSeeded();
    return driver().updateById(table, id, patch);
  },
  async deleteById<T extends TableName>(table: T, id: string): Promise<boolean> {
    await ensureSeeded();
    return driver().deleteById(table, id);
  },
  async replaceAll<T extends TableName>(table: T, rows: TableMap[T][]): Promise<void> {
    return driver().replaceAll(table, rows);
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
