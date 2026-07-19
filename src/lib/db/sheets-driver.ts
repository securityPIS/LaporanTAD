import type { sheets_v4 } from "googleapis";
import { sheetsClient } from "@/lib/google/auth";
import { env } from "@/lib/env";
import type { DbDriver } from "./driver";
import { PRIMARY_KEY } from "./driver";
import {
  BOOLEAN_COLUMNS,
  NUMBER_COLUMNS,
  TABLE_COLUMNS,
  type TableMap,
  type TableName,
} from "./tables";

/** Rangkai semua teks error yang mungkin dari googleapis (pesan bisa bersarang). */
function errMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (!e || typeof e !== "object") return "";
  const o = e as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof o.message === "string") parts.push(o.message);
  const resp = o.response as { data?: { error?: { message?: unknown } } } | undefined;
  if (typeof resp?.data?.error?.message === "string") parts.push(resp.data.error.message);
  if (Array.isArray(o.errors)) {
    for (const it of o.errors) {
      const m = (it as { message?: unknown })?.message;
      if (typeof m === "string") parts.push(m);
    }
  }
  return parts.join(" | ");
}

/** Error Google saat tab/rentang tidak ada (mis. tabel baru belum di-setup). */
function isMissingSheetError(e: unknown): boolean {
  const m = errMessage(e);
  // Tanda khas tab tak ada: rentang tak dapat diurai / nama tab tak ditemukan.
  return /unable to parse range|not found|does not exist/i.test(m);
}

/** Error Google saat addSheet untuk tab yang sudah ada. */
function isDuplicateSheetError(e: unknown): boolean {
  return /already exists/i.test(errMessage(e));
}

/**
 * Driver Google Sheets (produksi): 1 tab = 1 tabel. Baris pertama header.
 * Pola append-dominan; update/delete mencari baris berdasarkan kunci primer
 * (bukan nomor baris tetap) untuk aman dari pergeseran — lihat ARSITEKTUR §10.
 */
export class SheetsDriver implements DbDriver {
  private api: sheets_v4.Sheets;
  private spreadsheetId: string;
  private sheetIdCache = new Map<string, number>();

  constructor() {
    this.api = sheetsClient();
    this.spreadsheetId = env.sheetsDatabaseId!;
  }

  private serialize(table: TableName, value: unknown, col: string): string {
    if (value === null || value === undefined) return "";
    if ((BOOLEAN_COLUMNS[table] ?? []).includes(col)) return value ? "TRUE" : "FALSE";
    return String(value);
  }

  private deserialize(table: TableName, raw: string, col: string): unknown {
    if ((BOOLEAN_COLUMNS[table] ?? []).includes(col)) return raw === "TRUE" || raw === "true";
    if ((NUMBER_COLUMNS[table] ?? []).includes(col)) return raw === "" ? 0 : Number(raw);
    return raw ?? "";
  }

  private rowToValues(table: TableName, row: Record<string, unknown>): string[] {
    return TABLE_COLUMNS[table].map((c) => this.serialize(table, row[c], c));
  }

  private valuesToRow<T extends TableName>(table: T, values: string[]): TableMap[T] {
    const cols = TABLE_COLUMNS[table];
    const obj: Record<string, unknown> = {};
    cols.forEach((c, i) => {
      obj[c] = this.deserialize(table, values[i] ?? "", c);
    });
    return obj as unknown as TableMap[T];
  }

  async all<T extends TableName>(table: T): Promise<TableMap[T][]> {
    let res;
    try {
      res = await this.api.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${table}!A2:ZZ`,
      });
    } catch (e) {
      // Tab belum ada (mis. tabel baru sebelum `npm run setup:sheets`) →
      // perlakukan sebagai kosong, jangan patahkan seluruh halaman.
      if (isMissingSheetError(e)) return [];
      throw e;
    }
    const rows = res.data.values ?? [];
    return rows
      .filter((r) => r.some((c) => c !== "" && c != null))
      .map((r) => this.valuesToRow(table, r as string[]));
  }

  async insert<T extends TableName>(table: T, row: TableMap[T]): Promise<TableMap[T]> {
    const values = [this.rowToValues(table, row as unknown as Record<string, unknown>)];
    try {
      await this.appendRow(table, values);
    } catch (e) {
      // Tab belum dibuat → buat berikut header, lalu ulangi (self-heal migrasi).
      if (!isMissingSheetError(e)) throw e;
      await this.ensureSheet(table);
      await this.appendRow(table, values);
    }
    return row;
  }

  private async appendRow(table: TableName, values: string[][]): Promise<void> {
    await this.api.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${table}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
  }

  /** Buat tab (bila belum ada) beserta baris header sesuai TABLE_COLUMNS. */
  private async ensureSheet(table: TableName): Promise<void> {
    try {
      await this.api.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: table } } }] },
      });
    } catch (e) {
      // Sudah ada (dibuat paralel) → abaikan; error lain dilempar.
      if (!isDuplicateSheetError(e)) throw e;
    }
    this.sheetIdCache.clear();
    await this.api.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${table}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [TABLE_COLUMNS[table]] },
    });
  }

  private async rowIndexOf(table: TableName, id: string): Promise<number> {
    const all = await this.all(table);
    const pk = PRIMARY_KEY[table];
    return all.findIndex((r) => (r as unknown as Record<string, unknown>)[pk] === id);
  }

  async updateById<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<TableMap[T]>,
  ): Promise<TableMap[T] | null> {
    const all = await this.all(table);
    const pk = PRIMARY_KEY[table];
    const idx = all.findIndex((r) => (r as unknown as Record<string, unknown>)[pk] === id);
    if (idx < 0) return null;
    const merged = { ...all[idx], ...patch } as TableMap[T];
    const rowNumber = idx + 2; // +1 header, +1 basis-1
    await this.api.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${table}!A${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [this.rowToValues(table, merged as unknown as Record<string, unknown>)] },
    });
    return merged;
  }

  private async sheetId(table: TableName): Promise<number> {
    if (this.sheetIdCache.has(table)) return this.sheetIdCache.get(table)!;
    const meta = await this.api.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
    for (const s of meta.data.sheets ?? []) {
      const title = s.properties?.title;
      const sid = s.properties?.sheetId;
      if (title && sid != null) this.sheetIdCache.set(title, sid);
    }
    return this.sheetIdCache.get(table) ?? 0;
  }

  async deleteById<T extends TableName>(table: T, id: string): Promise<boolean> {
    const idx = await this.rowIndexOf(table, id);
    if (idx < 0) return false;
    const sheetId = await this.sheetId(table);
    await this.api.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: idx + 1, // lewati header
                endIndex: idx + 2,
              },
            },
          },
        ],
      },
    });
    return true;
  }

  async replaceAll<T extends TableName>(table: T, rows: TableMap[T][]): Promise<void> {
    const header = TABLE_COLUMNS[table];
    await this.ensureSheet(table); // buat tab bila belum ada (mis. tabel baru saat seed)
    await this.api.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${table}!A1:ZZ`,
    });
    const values = [header, ...rows.map((r) => this.rowToValues(table, r as unknown as Record<string, unknown>))];
    await this.api.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${table}!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }
}
