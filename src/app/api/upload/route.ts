import { NextResponse } from "next/server";
import { route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { extFromMime, standardEvidenceName, storage } from "@/lib/storage";
import { newId } from "@/lib/id";
import { todayWIB } from "@/lib/wib";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (evidence sebelum kompresi — FR-LBR-07)

// POST /api/upload (multipart) — unggah evidence/lampiran ke folder terstandar.
export const POST = route(async (req) => {
  const u = await requireActive();
  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "lembur"); // lembur | cuti | dinas
  if (!(file instanceof File)) throw new AppError("VALIDASI_GAGAL", "Berkas tidak ditemukan", 422);
  if (!ALLOWED.includes(file.type)) {
    throw new AppError("VALIDASI_GAGAL", "Tipe berkas harus JPG, PNG, WEBP, atau PDF.", 422);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX_BYTES) {
    throw new AppError("VALIDASI_GAGAL", "Ukuran berkas melebihi 5 MB.", 413);
  }
  const today = todayWIB();
  const [tahun, bulan] = today.split("-");
  const folderKind = kind === "cuti" ? "cuti" : kind === "dinas" ? "dinas" : "lembur";
  const folder = `evidence/${folderKind}/${tahun}/${bulan}`;
  const id = newId();
  const name = standardEvidenceName(u.nopek, today, id, extFromMime(file.type));
  const meta = await storage().put(folder, name, file.type, bytes);
  return NextResponse.json({ file_id: meta.id, name: meta.name, mime: meta.mime, size: meta.size }, { status: 201 });
});
