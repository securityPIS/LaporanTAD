import type { TableMap, TableName } from "./tables";

/** Kolom kunci primer per tabel (mayoritas `id`; `settings` memakai `key`). */
export const PRIMARY_KEY: Record<TableName, string> = {
  users: "id",
  companies: "id",
  master_options: "id",
  overtime: "id",
  leaves: "id",
  leave_types: "id",
  leave_balances: "id",
  trips: "id",
  holidays: "id",
  documents: "id",
  doc_templates: "id",
  period_locks: "id",
  settings: "key",
  audit_log: "id",
};

/**
 * Driver penyimpanan generik. UI/route tidak pernah memakainya langsung —
 * hanya lapisan `repositories/*`. Dua implementasi: Google Sheets (produksi)
 * dan in-memory (dev/demo). Migrasi ke Postgres cukup menambah driver baru.
 */
export interface DbDriver {
  all<T extends TableName>(table: T): Promise<TableMap[T][]>;
  insert<T extends TableName>(table: T, row: TableMap[T]): Promise<TableMap[T]>;
  updateById<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<TableMap[T]>,
  ): Promise<TableMap[T] | null>;
  deleteById<T extends TableName>(table: T, id: string): Promise<boolean>;
  /** Ganti seluruh isi tabel (dipakai skrip seed). */
  replaceAll<T extends TableName>(table: T, rows: TableMap[T][]): Promise<void>;
}
