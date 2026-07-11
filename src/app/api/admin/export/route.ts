import { route, qp } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { buildCsv, buildXlsx, type ExportType } from "@/lib/export";

// GET /api/admin/export?type=lembur|cuti|dinas&month=&company=&lokasi=&format=xlsx|csv
export const GET = route(async (req) => {
  await requireAdmin();
  const type = (qp(req, "type") ?? "lembur") as ExportType;
  if (!["lembur", "cuti", "dinas"].includes(type)) throw new AppError("VALIDASI_GAGAL", "Tipe ekspor tidak valid", 422);
  const format = qp(req, "format") ?? "xlsx";
  const filter = { month: qp(req, "month"), companyId: qp(req, "company"), lokasi: qp(req, "lokasi") };
  const month = filter.month ?? "semua";
  const base = `rekap_${type}_${month}`;

  if (format === "csv") {
    const csv = await buildCsv(type, filter);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
      },
    });
  }
  const xlsx = await buildXlsx(type, filter);
  return new Response(new Uint8Array(xlsx), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
    },
  });
});
