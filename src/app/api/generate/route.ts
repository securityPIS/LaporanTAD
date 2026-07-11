import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { generateSchema } from "@/schemas";
import { db } from "@/lib/db";
import { isGasConfigured, isDriveConfigured } from "@/lib/env";
import { gasGenerate } from "@/lib/gas";
import { simplePdf } from "@/lib/pdf";
import { storage } from "@/lib/storage";
import { createDocument } from "@/repositories/documents";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import { fmtTgl } from "@/lib/date";
import { todayWIB } from "@/lib/wib";
import type { JenisDok } from "@/lib/db/tables";

const JUDUL: Record<Exclude<JenisDok, "-">, string> = {
  spkl: "Surat Perintah Kerja Lembur (SPKL)",
  spd: "Surat Perintah Dinas (SPD)",
  deklarasi_dinas: "Deklarasi Dinas — Rincian Biaya",
  surat_cuti: "Surat Cuti",
};

// POST /api/generate — buat dokumen dari catatan (WAJIB TTD). FR-DOK-05/06/08.
export const POST = route(async (req) => {
  const actor = await requireActive();
  const input = generateSchema.parse(await readJson(req));

  // Resolusi catatan sumber + kepemilikan.
  let ownerId = "";
  let entitas = "";
  const placeholders: Record<string, string> = {};

  if (input.jenis === "spkl") {
    const o = await db.findOne("overtime", (x) => x.id === input.sumber_id);
    if (!o) throw new AppError("TIDAK_DITEMUKAN", "Catatan lembur tidak ditemukan", 404);
    ownerId = o.user_id;
    entitas = "overtime";
    Object.assign(placeholders, {
      tanggal: fmtTgl(o.tanggal),
      jam: `${o.jam_mulai}–${o.jam_selesai}`,
      total_jam: `${fmtJamHHMM(o.total_jam)} jam`,
      keterangan: o.keterangan,
      jenis: o.jenis,
    });
  } else if (input.jenis === "spd" || input.jenis === "deklarasi_dinas") {
    const t = await db.findOne("trips", (x) => x.id === input.sumber_id);
    if (!t) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
    ownerId = t.user_id;
    entitas = "trips";
    Object.assign(placeholders, {
      tujuan: t.tujuan,
      tanggal_mulai: fmtTgl(t.tanggal_mulai),
      tanggal_selesai: fmtTgl(t.tanggal_selesai),
      keperluan: t.keperluan,
      transportasi: t.transportasi,
    });
  } else {
    const l = await db.findOne("leaves", (x) => x.id === input.sumber_id);
    if (!l) throw new AppError("TIDAK_DITEMUKAN", "Catatan cuti tidak ditemukan", 404);
    ownerId = l.user_id;
    entitas = "leaves";
    const type = await db.findOne("leave_types", (x) => x.id === l.leave_type_id);
    Object.assign(placeholders, {
      jenis_cuti: type?.nama ?? "",
      tanggal_mulai: fmtTgl(l.tanggal_mulai),
      tanggal_selesai: fmtTgl(l.tanggal_selesai),
      jumlah_hari: String(l.jumlah_hari),
      keterangan: l.keterangan,
    });
  }

  if (actor.role !== "admin" && actor.id !== ownerId) {
    throw new AppError("TIDAK_BERHAK", "Hanya pemilik catatan atau admin yang dapat generate.", 403);
  }
  const owner = actor.id === ownerId ? actor : (await db.findOne("users", (u) => u.id === ownerId))!;
  placeholders.nama = owner.nama_lengkap;
  placeholders.nopek = owner.nopek;

  // WAJIB TTD (FR-DOK-06): file tersimpan / unggahan baru / TTD tersimpan penanda tangan.
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
  const outName = `${input.jenis}_${owner.nopek}_${input.sumber_id}.pdf`;
  const judul = `${JUDUL[input.jenis]} — ${owner.nama_lengkap}`;

  let fileId: string;
  let mime = "application/pdf";
  let size = 0;

  if (isGasConfigured() && template?.gdoc_id) {
    const res = await gasGenerate({
      jenis: input.jenis,
      gdoc_id: template.gdoc_id,
      placeholders,
      ttd_file_id: ttdFileId || undefined,
      ttd_data_url: input.ttd_data_url || undefined,
      output_folder: outFolder,
      output_name: outName,
    });
    fileId = res.file_id;
    mime = res.mime;
    size = res.size;
  } else {
    // Fallback dev/demo: PDF sederhana (tanpa embed gambar TTD).
    const lines = [
      ...Object.entries(placeholders).map(([k, v]) => `${labelize(k)}: ${v}`),
      "",
      `Ditandatangani secara digital oleh: ${actor.nama_lengkap} (${actor.email})`,
      `TTD: ${ttdFileId ? "[gambar TTD tersimpan]" : "[gambar TTD diunggah/digambar]"}`,
    ];
    if (!isDriveConfigured()) lines.push("", "(Mode dev — TTD tidak disisipkan; produksi memakai GAS + Google Docs.)");
    const pdf = simplePdf(judul, lines);
    const meta = await storage().put(outFolder, outName, "application/pdf", pdf);
    fileId = meta.id;
    size = meta.size;
  }

  const doc = await createDocument(actor.email, {
    judul,
    kategori: "generated",
    jenis_dok: input.jenis,
    sumber_entitas: entitas,
    sumber_id: input.sumber_id,
    file_id: fileId,
    mime,
    ukuran: size,
    uploaded_by: actor.email,
    signed_by: actor.email,
  });

  return ok({ document: doc, download: `/api/files/${fileId}` }, 201);
});

function labelize(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
