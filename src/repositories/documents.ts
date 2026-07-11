import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import { nowWIB } from "@/lib/wib";
import { AppError } from "@/lib/errors";
import { writeAudit } from "@/lib/audit";
import type { DocumentRow } from "@/lib/db/tables";

export async function listDocuments(kategori?: DocumentRow["kategori"]): Promise<DocumentRow[]> {
  let rows = await db.all("documents");
  if (kategori) rows = rows.filter((d) => d.kategori === kategori);
  return rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  return (await db.findOne("documents", (d) => d.id === id)) ?? null;
}

export async function createDocument(
  actorEmail: string,
  data: Omit<DocumentRow, "id" | "created_at">,
): Promise<DocumentRow> {
  const row: DocumentRow = { id: newId(), created_at: nowWIB(), ...data };
  const saved = await db.insert("documents", row);
  await writeAudit({
    actorEmail,
    aksi: data.kategori === "generated" ? "generate" : "unggah",
    entitas: "documents",
    entitasId: saved.id,
    detail: { judul: saved.judul, jenis: saved.jenis_dok, signed_by: saved.signed_by },
  });
  return saved;
}

export async function deleteDocument(actorEmail: string, id: string): Promise<void> {
  const ok = await db.deleteById("documents", id);
  if (!ok) throw new AppError("TIDAK_DITEMUKAN", "Dokumen tidak ditemukan", 404);
  await writeAudit({ actorEmail, aksi: "hapus", entitas: "documents", entitasId: id });
}
