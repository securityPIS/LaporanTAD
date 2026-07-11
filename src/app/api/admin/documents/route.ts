import { ok, qp, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { storage } from "@/lib/storage";
import { createDocument, listDocuments } from "@/repositories/documents";
import type { DocumentRow } from "@/lib/db/tables";

export const GET = route(async (req) => {
  await requireAdmin();
  const kategori = (qp(req, "kategori") as DocumentRow["kategori"]) ?? undefined;
  return ok({ items: await listDocuments(kategori) });
});

// POST /api/admin/documents (multipart) — unggah dokumen umum ke dokumen/umum.
export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const form = await req.formData();
  const file = form.get("file");
  const judul = String(form.get("judul") ?? "");
  const kategoriDok = String(form.get("kategori_dok") ?? "Lainnya");
  if (!(file instanceof File)) throw new AppError("VALIDASI_GAGAL", "Berkas tidak ditemukan", 422);
  if (!judul) throw new AppError("VALIDASI_GAGAL", "Judul dokumen wajib diisi", 422);
  const bytes = Buffer.from(await file.arrayBuffer());
  const meta = await storage().put("dokumen/umum", file.name, file.type || "application/octet-stream", bytes);
  const doc = await createDocument(admin.email, {
    judul,
    kategori: "umum",
    jenis_dok: "-",
    sumber_entitas: kategoriDok,
    sumber_id: "",
    file_id: meta.id,
    mime: meta.mime,
    ukuran: meta.size,
    uploaded_by: admin.email,
    signed_by: "",
  });
  return ok({ item: doc }, 201);
});
