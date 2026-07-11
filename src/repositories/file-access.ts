import { db } from "@/lib/db";
import type { UserRow } from "@/lib/db/tables";

/**
 * Cek hak akses berkas: admin boleh semua; pekerja hanya berkas yang menempel
 * pada catatan/dokumen/TTD miliknya (ARSITEKTUR §9 — berkas privat via aplikasi).
 */
export async function canAccessFile(user: UserRow, fileId: string): Promise<boolean> {
  if (user.role === "admin") return true;

  const own =
    (await db.findOne("overtime", (o) => o.user_id === user.id && o.evidence_file_id === fileId)) ||
    (await db.findOne("leaves", (l) => l.user_id === user.id && l.lampiran_file_id === fileId)) ||
    (await db.findOne("trips", (t) => t.user_id === user.id && t.lampiran_file_id === fileId));
  if (own) return true;

  if (user.ttd_file_id === fileId) return true;

  // Dokumen umum boleh diakses semua pekerja aktif; dokumen generated hanya
  // oleh penanda tangan/pengunggah.
  const doc = await db.findOne("documents", (d) => d.file_id === fileId);
  if (doc) {
    if (doc.kategori === "umum") return true;
    return doc.uploaded_by === user.email || doc.signed_by === user.email;
  }
  return false;
}
