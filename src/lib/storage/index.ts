import { isDriveConfigured } from "@/lib/env";
import { DriveStorage } from "./drive";
import { LocalStorage } from "./local";
import type { StorageDriver } from "./types";

const g = globalThis as unknown as { __ltadStorage?: StorageDriver };

export function storage(): StorageDriver {
  if (!g.__ltadStorage) {
    g.__ltadStorage = isDriveConfigured() ? new DriveStorage() : new LocalStorage();
  }
  return g.__ltadStorage;
}

export type { FileMeta, StoredFile } from "./types";

/** Nama berkas evidence terstandar: {nopek}_{tanggal}_{id}.{ext} (ARSITEKTUR §5). */
export function standardEvidenceName(nopek: string, tanggal: string, id: string, ext: string): string {
  const safe = nopek.replace(/[^\w-]/g, "");
  return `${safe}_${tanggal}_${id}.${ext}`;
}

export function extFromMime(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "bin";
}
