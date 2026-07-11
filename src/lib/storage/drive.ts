import { Readable } from "stream";
import { driveClient } from "@/lib/google/auth";
import { env } from "@/lib/env";
import type { FileMeta, StoredFile, StorageDriver } from "./types";

/**
 * Penyimpanan Google Drive (produksi). Berkas privat — hanya service account +
 * pemilik. Struktur folder mengikuti ARSITEKTUR §5. Folder dibuat bila belum ada.
 */
export class DriveStorage implements StorageDriver {
  private folderCache = new Map<string, string>();

  private async ensureFolderPath(segments: string[]): Promise<string> {
    let parent = env.driveRootFolderId!;
    const drive = driveClient();
    let pathKey = "";
    for (const seg of segments) {
      pathKey += "/" + seg;
      if (this.folderCache.has(pathKey)) {
        parent = this.folderCache.get(pathKey)!;
        continue;
      }
      const q = `name='${seg.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and '${parent}' in parents and trashed=false`;
      const res = await drive.files.list({ q, fields: "files(id)" });
      let id = res.data.files?.[0]?.id;
      if (!id) {
        const created = await drive.files.create({
          requestBody: { name: seg, mimeType: "application/vnd.google-apps.folder", parents: [parent] },
          fields: "id",
        });
        id = created.data.id!;
      }
      this.folderCache.set(pathKey, id);
      parent = id;
    }
    return parent;
  }

  async put(folder: string, name: string, mime: string, bytes: Buffer): Promise<FileMeta> {
    const drive = driveClient();
    const folderId = await this.ensureFolderPath(folder.split("/").filter(Boolean));
    const res = await drive.files.create({
      requestBody: { name, parents: [folderId] },
      media: { mimeType: mime, body: Readable.from(bytes) },
      fields: "id, name, size, mimeType",
    });
    return {
      id: res.data.id!,
      name: res.data.name ?? name,
      mime: res.data.mimeType ?? mime,
      size: Number(res.data.size ?? bytes.length),
    };
  }

  async get(id: string): Promise<StoredFile | null> {
    const drive = driveClient();
    try {
      const meta = await drive.files.get({ fileId: id, fields: "name, mimeType, size" });
      const res = await drive.files.get({ fileId: id, alt: "media" }, { responseType: "arraybuffer" });
      return {
        bytes: Buffer.from(res.data as ArrayBuffer),
        mime: meta.data.mimeType ?? "application/octet-stream",
        name: meta.data.name ?? id,
      };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    const drive = driveClient();
    try {
      await drive.files.delete({ fileId: id });
    } catch {
      /* sudah tidak ada — abaikan */
    }
  }
}
