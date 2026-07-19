import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { spklSchema } from "@/schemas";
import { finalizeDocument } from "@/lib/docgen";
import { listOvertimeByUserRange } from "@/repositories/overtime";
import { buildSpklHeader, buildSpklRows } from "@/lib/spkl";
import { todayWIB } from "@/lib/wib";

// POST /api/generate/spkl — SPKL agregat: seluruh lembur pekerja pada rentang
// tanggal → satu dokumen bertanda tangan. FR-DOK-05/06 (varian periode).
export const POST = route(async (req) => {
  const actor = await requireActive();
  const input = spklSchema.parse(await readJson(req));

  const rows = await listOvertimeByUserRange(actor.id, input.tanggal_mulai, input.tanggal_selesai);
  if (rows.length === 0) {
    throw new AppError("VALIDASI_GAGAL", "Tidak ada catatan lembur pada rentang tanggal ini.", 422);
  }

  const placeholders = buildSpklHeader(
    actor,
    input.tanggal_mulai,
    input.tanggal_selesai,
    rows,
    todayWIB(),
  );

  const doc = await finalizeDocument({
    actor,
    jenis: "spkl",
    entitas: "overtime",
    sumberId: `${input.tanggal_mulai}..${input.tanggal_selesai}`,
    judul: `Surat Perintah Kerja Lembur (SPKL) — ${actor.nama_lengkap}`,
    outName: `spkl_${actor.nopek}_${input.tanggal_mulai}_${input.tanggal_selesai}.pdf`,
    placeholders,
    rows: buildSpklRows(rows),
    ttd_file_id: input.ttd_file_id,
    ttd_data_url: input.ttd_data_url,
  });

  return ok({ document: doc, download: `/api/files/${doc.file_id}` }, 201);
});
