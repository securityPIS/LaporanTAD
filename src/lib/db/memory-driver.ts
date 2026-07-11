import { promises as fs } from "fs";
import path from "path";
import type { DbDriver } from "./driver";
import { PRIMARY_KEY } from "./driver";
import type { TableMap, TableName } from "./tables";

/**
 * Driver in-memory untuk dev/demo (aktif bila kredensial Google tak ada).
 * Bila filesystem dapat ditulis (dev lokal), data dipersist ke `.data/db.json`
 * agar bertahan antar-restart. Di serverless read-only, murni in-memory.
 */
type Store = { [K in TableName]?: unknown[] };

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

// Persist state pada globalThis agar bertahan antar hot-reload Next dev.
const g = globalThis as unknown as { __ltadMem?: MemoryDriver };

export class MemoryDriver implements DbDriver {
  private store: Store = {};
  private loaded = false;
  private canPersist = true;
  private writeChain: Promise<void> = Promise.resolve();

  private async ensureLoaded() {
    if (this.loaded) return;
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      this.store = JSON.parse(raw);
    } catch {
      this.store = {};
    }
    this.loaded = true;
  }

  private table<T extends TableName>(t: T): TableMap[T][] {
    if (!this.store[t]) this.store[t] = [];
    return this.store[t] as TableMap[T][];
  }

  private persist() {
    if (!this.canPersist) return;
    // Serialisasi penulisan agar tidak saling menimpa.
    this.writeChain = this.writeChain.then(async () => {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(this.store, null, 2), "utf8");
      } catch {
        this.canPersist = false; // filesystem read-only — lanjut in-memory saja
      }
    });
  }

  async all<T extends TableName>(table: T): Promise<TableMap[T][]> {
    await this.ensureLoaded();
    return this.table(table).map((r) => ({ ...r }));
  }

  async insert<T extends TableName>(table: T, row: TableMap[T]): Promise<TableMap[T]> {
    await this.ensureLoaded();
    this.table(table).push({ ...row });
    this.persist();
    return { ...row };
  }

  async updateById<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<TableMap[T]>,
  ): Promise<TableMap[T] | null> {
    await this.ensureLoaded();
    const pk = PRIMARY_KEY[table];
    const rows = this.table(table);
    const idx = rows.findIndex((r) => (r as unknown as Record<string, unknown>)[pk] === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...patch };
    this.persist();
    return { ...rows[idx] };
  }

  async deleteById<T extends TableName>(table: T, id: string): Promise<boolean> {
    await this.ensureLoaded();
    const pk = PRIMARY_KEY[table];
    const rows = this.table(table);
    const idx = rows.findIndex((r) => (r as unknown as Record<string, unknown>)[pk] === id);
    if (idx < 0) return false;
    rows.splice(idx, 1);
    this.persist();
    return true;
  }

  async replaceAll<T extends TableName>(table: T, rows: TableMap[T][]): Promise<void> {
    await this.ensureLoaded();
    this.store[table] = rows.map((r) => ({ ...r }));
    this.persist();
  }
}

export function getMemoryDriver(): MemoryDriver {
  if (!g.__ltadMem) g.__ltadMem = new MemoryDriver();
  return g.__ltadMem;
}
