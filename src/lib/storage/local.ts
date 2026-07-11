import { promises as fs } from "fs";
import path from "path";
import { newId } from "@/lib/id";
import type { FileMeta, StoredFile, StorageDriver } from "./types";

/**
 * Penyimpanan lokal untuk dev/demo (aktif bila Drive tak dikonfigurasi).
 * Berkas di `.data/files/{id}` + metadata sidecar `.json`. Bila FS read-only,
 * jatuh ke Map in-memory.
 */
const DIR = path.join(process.cwd(), ".data", "files");
const g = globalThis as unknown as { __ltadFiles?: Map<string, { meta: FileMeta; bytes: Buffer }> };
if (!g.__ltadFiles) g.__ltadFiles = new Map();
const mem = g.__ltadFiles;

export class LocalStorage implements StorageDriver {
  async put(folder: string, name: string, mime: string, bytes: Buffer): Promise<FileMeta> {
    const id = newId();
    const meta: FileMeta = { id, name, mime, size: bytes.length };
    try {
      await fs.mkdir(DIR, { recursive: true });
      await fs.writeFile(path.join(DIR, id), bytes);
      await fs.writeFile(path.join(DIR, id + ".json"), JSON.stringify({ ...meta, folder }));
    } catch {
      mem.set(id, { meta, bytes });
    }
    return meta;
  }

  async get(id: string): Promise<StoredFile | null> {
    const m = mem.get(id);
    if (m) return { bytes: m.bytes, mime: m.meta.mime, name: m.meta.name };
    try {
      const bytes = await fs.readFile(path.join(DIR, id));
      const meta = JSON.parse(await fs.readFile(path.join(DIR, id + ".json"), "utf8")) as FileMeta;
      return { bytes, mime: meta.mime, name: meta.name };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    mem.delete(id);
    try {
      await fs.unlink(path.join(DIR, id));
      await fs.unlink(path.join(DIR, id + ".json"));
    } catch {
      /* abaikan */
    }
  }
}
