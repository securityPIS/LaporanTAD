import { route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { canAccessFile } from "@/repositories/file-access";
import { storage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/files/{id} — stream berkas dengan cek akses (pemilik/admin). FR-DOK-03.
export const GET = route<Ctx>(async (_req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  if (!(await canAccessFile(u, id))) {
    throw new AppError("TIDAK_BERHAK", "Anda tidak berhak mengakses berkas ini.", 403);
  }
  const file = await storage().get(id);
  if (!file) throw new AppError("TIDAK_DITEMUKAN", "Berkas tidak ditemukan.", 404);
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${file.name}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
});
