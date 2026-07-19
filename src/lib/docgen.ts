// Tahap akhir pembuatan dokumen yang dipakai bersama oleh /api/generate
// (dokumen dari satu catatan) dan /api/generate/spkl (agregasi lembur):
// validasi WAJIB TTD → template aktif → GAS atau fallback simplePdf → simpan
// catatan dokumen. Pemanggil menyiapkan placeholder & (opsional) baris tabel.

import { db } from "./db";
import { isGasConfigured, isDriveConfigured } from "./env";
import { gasGenerate } from "./gas";
import { simplePdf } from "./pdf";
import { storage } from "./storage";
import { todayWIB } from "./wib";
import { AppError } from "./errors";
import { createDocument } from "@/repositories/documents";
import type { DocumentRow, JenisDok, UserRow } from "./db/tables";

export interface FinalizeInput {
  actor: UserRow;
  jenis: Exclude<JenisDok, "-">;
  entitas: string;
  sumberId: string;
  judul: string;
  outName: string;
  placeholders: Record<string, string>;
  /** Baris tabel berulang (SPKL); mengisi placeholder {{@key}} pada baris template. */
  rows?: Array<Record<string, string>>;
  ttd_file_id?: string;
  ttd_data_url?: string;
}

export async function finalizeDocument(input: FinalizeInput): Promise<DocumentRow> {
  const { actor } = input;

  // WAJIB TTD (FR-DOK-06): TTD tersimpan / unggahan baru / gambar.
  const ttdFileId = input.ttd_file_id || actor.ttd_file_id || "";
  if (!ttdFileId && !input.ttd_data_url) {
    throw new AppError("WAJIB_TTD", "Tanda tangan wajib disediakan sebelum membuat dokumen.", 422);
  }
  if (input.ttd_file_id && actor.role !== "admin" && input.ttd_file_id !== actor.ttd_file_id) {
    throw new AppError("TIDAK_BERHAK", "TTD tersimpan hanya dapat dipakai pemiliknya.", 403);
  }

  const template = await db.findOne("doc_templates", (t) => t.jenis === input.jenis && t.active);
  const [tahun, bulan] = todayWIB().split("-");
  const outFolder = `dokumen/generated/${tahun}/${bulan}`;

  let fileId: string;
  let mime = "application/pdf";
  let size = 0;

  if (isGasConfigured() && template?.gdoc_id) {
    const res = await gasGenerate({
      jenis: input.jenis,
      gdoc_id: template.gdoc_id,
      placeholders: input.placeholders,
      rows: input.rows,
      ttd_file_id: ttdFileId || undefined,
      ttd_data_url: input.ttd_data_url || undefined,
      output_folder: outFolder,
      output_name: input.outName,
    });
    fileId = res.file_id;
    mime = res.mime;
    size = res.size;
  } else {
    // Fallback dev/demo: PDF sederhana (tanpa embed gambar TTD).
    const pdf = simplePdf(input.judul, fallbackLines(input, ttdFileId));
    const meta = await storage().put(outFolder, input.outName, "application/pdf", pdf);
    fileId = meta.id;
    size = meta.size;
  }

  return createDocument(actor.email, {
    judul: input.judul,
    kategori: "generated",
    jenis_dok: input.jenis,
    sumber_entitas: input.entitas,
    sumber_id: input.sumberId,
    file_id: fileId,
    mime,
    ukuran: size,
    uploaded_by: actor.email,
    signed_by: actor.email,
  });
}

function fallbackLines(input: FinalizeInput, ttdFileId: string): string[] {
  const lines = Object.entries(input.placeholders).map(([k, v]) => `${labelize(k)}: ${v}`);
  if (input.rows && input.rows.length > 0) {
    lines.push("", "Rincian Lembur:");
    for (const r of input.rows) lines.push(Object.values(r).join("  ·  "));
  }
  lines.push(
    "",
    `Ditandatangani secara digital oleh: ${input.actor.nama_lengkap} (${input.actor.email})`,
    `TTD: ${ttdFileId ? "[gambar TTD tersimpan]" : "[gambar TTD diunggah/digambar]"}`,
  );
  if (!isDriveConfigured()) {
    lines.push("", "(Mode dev — TTD tidak disisipkan; produksi memakai GAS + Google Docs.)");
  }
  return lines;
}

function labelize(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
