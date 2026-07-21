import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { generateSchema } from "@/schemas";
import { db } from "@/lib/db";
import { finalizeDocument } from "@/lib/docgen";
import { ownerPlaceholders } from "@/lib/doc-fields";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import { buildDeklarasiHeader, buildDeklarasiRows } from "@/lib/deklarasi";
import { labelSifat } from "@/lib/dinas-rules";
import { listCostsByTrip, markTripSelesai, markTripSpdIssued } from "@/repositories/trips";
import { fmtRange, fmtTgl } from "@/lib/date";
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
  let rows: Array<Record<string, string>> | undefined;
  // Hook status dinas dijalankan setelah dokumen berhasil dibuat.
  let afterGenerate: (() => Promise<void>) | undefined;

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
  } else if (input.jenis === "spd") {
    const t = await db.findOne("trips", (x) => x.id === input.sumber_id);
    if (!t) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
    ownerId = t.user_id;
    entitas = "trips";
    Object.assign(placeholders, {
      tujuan: t.tujuan,
      tanggal_mulai: fmtTgl(t.tanggal_mulai),
      tanggal_selesai: fmtTgl(t.tanggal_selesai),
      durasi: fmtRange(t.tanggal_mulai, t.tanggal_selesai),
      keperluan: t.keperluan,
      transportasi: t.transportasi,
      keterangan: t.keterangan,
      // Field khusus SPD (Surat Perintah Perjalanan Dinas).
      golongan: t.golongan || "-",
      biaya_ditanggung: t.biaya_ditanggung || "Perusahaan",
      sifat: labelSifat(t.sifat),
      jenis_perjalanan: "Dalam Negeri",
    });
    afterGenerate = () => markTripSpdIssued(t.id);
  } else if (input.jenis === "deklarasi_dinas") {
    const t = await db.findOne("trips", (x) => x.id === input.sumber_id);
    if (!t) throw new AppError("TIDAK_DITEMUKAN", "Catatan dinas tidak ditemukan", 404);
    if (t.status === "draft") {
      throw new AppError("VALIDASI_GAGAL", "Terbitkan SPD dulu sebelum membuat Deklarasi.", 422);
    }
    const costs = await listCostsByTrip(t.id);
    if (!t.tanggal_realisasi_mulai || costs.length === 0) {
      throw new AppError("VALIDASI_GAGAL", "Lengkapi realisasi & rincian biaya Deklarasi dulu.", 422);
    }
    ownerId = t.user_id;
    entitas = "trips";
    const owner = actor.id === t.user_id ? actor : (await db.findOne("users", (u) => u.id === t.user_id))!;
    Object.assign(placeholders, buildDeklarasiHeader(owner, t, costs, todayWIB()));
    rows = buildDeklarasiRows(costs);
    afterGenerate = () => markTripSelesai(t.id);
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
      durasi: fmtRange(l.tanggal_mulai, l.tanggal_selesai),
      jumlah_hari: `${l.jumlah_hari} hari`,
      keterangan: l.keterangan,
    });
  }

  if (actor.role !== "admin" && actor.id !== ownerId) {
    throw new AppError("TIDAK_BERHAK", "Hanya pemilik catatan atau admin yang dapat generate.", 403);
  }
  const owner = actor.id === ownerId ? actor : (await db.findOne("users", (u) => u.id === ownerId))!;
  Object.assign(placeholders, ownerPlaceholders(owner, todayWIB()));

  const doc = await finalizeDocument({
    actor,
    jenis: input.jenis,
    entitas,
    sumberId: input.sumber_id,
    judul: `${JUDUL[input.jenis]} — ${owner.nama_lengkap}`,
    outName: `${input.jenis}_${owner.nopek}_${input.sumber_id}.pdf`,
    placeholders,
    rows,
    ttd_file_id: input.ttd_file_id,
    ttd_data_url: input.ttd_data_url,
  });

  await afterGenerate?.();

  return ok({ document: doc, download: `/api/files/${doc.file_id}` }, 201);
});
