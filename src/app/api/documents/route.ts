import { ok, qp, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { listDocuments } from "@/repositories/documents";
import type { DocumentRow } from "@/lib/db/tables";

// GET /api/documents?kategori=umum|generated — dokumen (default umum untuk pekerja).
export const GET = route(async (req) => {
  const u = await requireActive();
  const kategori = (qp(req, "kategori") as DocumentRow["kategori"]) ?? "umum";
  let items = await listDocuments(kategori);
  // Dokumen generated: pekerja hanya melihat miliknya; admin melihat semua.
  if (kategori === "generated" && u.role !== "admin") {
    items = items.filter((d) => d.signed_by === u.email || d.uploaded_by === u.email);
  }
  return ok({ items });
});
