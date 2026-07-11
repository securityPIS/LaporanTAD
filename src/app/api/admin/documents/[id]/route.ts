import { ok, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { deleteDocument, getDocument } from "@/repositories/documents";
import { storage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) throw new AppError("TIDAK_DITEMUKAN", "Dokumen tidak ditemukan", 404);
  if (doc.file_id) await storage().delete(doc.file_id);
  await deleteDocument(admin.email, id);
  return ok({ ok: true });
});
