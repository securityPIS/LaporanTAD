import ExcelJS from "exceljs";
import { db } from "./db";
import { listAllOvertime } from "@/repositories/overtime";
import { listAllLeaves, hitungSaldo } from "@/repositories/leaves";
import { listAllTrips } from "@/repositories/trips";
import { fmtJamHHMM } from "./overtime-calc";

export type ExportType = "lembur" | "cuti" | "dinas";
interface Filter {
  month?: string;
  companyId?: string;
  lokasi?: string;
}

interface Table {
  title: string;
  columns: { header: string; key: string; width: number }[];
  rows: Record<string, string | number>[];
}

const JENIS_LABEL: Record<string, string> = {
  reguler: "Reguler",
  libur_nasional: "Libur Nasional",
  kjk: "KJK",
  cuti: "Lembur Cuti",
};

async function buildTable(type: ExportType, filter: Filter): Promise<Table> {
  const users = new Map((await db.all("users")).map((u) => [u.id, u]));
  const companies = new Map((await db.all("companies")).map((c) => [c.id, c.nama]));

  if (type === "lembur") {
    const rows = await listAllOvertime(filter);
    return {
      title: "Rekap Lembur",
      columns: [
        { header: "Nopek", key: "nopek", width: 14 },
        { header: "Nama", key: "nama", width: 24 },
        { header: "Perusahaan", key: "perusahaan", width: 22 },
        { header: "Lokasi", key: "lokasi", width: 22 },
        { header: "Tanggal", key: "tanggal", width: 12 },
        { header: "Jenis", key: "jenis", width: 16 },
        { header: "Jam Mulai", key: "jam_mulai", width: 10 },
        { header: "Jam Selesai", key: "jam_selesai", width: 10 },
        { header: "Total Jam", key: "total_jam", width: 10 },
        { header: "Keterangan", key: "keterangan", width: 40 },
        { header: "Evidence", key: "evidence", width: 30 },
      ],
      rows: rows.map((o) => {
        const u = users.get(o.user_id);
        return {
          nopek: u?.nopek ?? "",
          nama: u?.nama_lengkap ?? "",
          perusahaan: u ? companies.get(u.company_id) ?? "" : "",
          lokasi: u?.lokasi_kerja ?? "",
          tanggal: o.tanggal,
          jenis: JENIS_LABEL[o.jenis] ?? o.jenis,
          jam_mulai: o.jam_mulai,
          jam_selesai: o.jam_selesai,
          total_jam: fmtJamHHMM(o.total_jam),
          keterangan: o.keterangan,
          evidence: o.evidence_file_id ? `/api/files/${o.evidence_file_id}` : "",
        };
      }),
    };
  }

  if (type === "cuti") {
    const rows = await listAllLeaves(filter);
    const types = new Map((await db.all("leave_types")).map((t) => [t.id, t.nama]));
    const tahun = filter.month ? Number(filter.month.slice(0, 4)) : new Date().getFullYear();
    const saldoCache = new Map<string, number>();
    const out: Record<string, string | number>[] = [];
    for (const l of rows) {
      const u = users.get(l.user_id);
      if (!saldoCache.has(l.user_id)) saldoCache.set(l.user_id, (await hitungSaldo(l.user_id, tahun)).sisa);
      out.push({
        nopek: u?.nopek ?? "",
        nama: u?.nama_lengkap ?? "",
        perusahaan: u ? companies.get(u.company_id) ?? "" : "",
        jenis: types.get(l.leave_type_id) ?? "",
        tanggal_mulai: l.tanggal_mulai,
        tanggal_selesai: l.tanggal_selesai,
        jumlah_hari: l.jumlah_hari,
        sisa_saldo: saldoCache.get(l.user_id) ?? 0,
        keterangan: l.keterangan,
      });
    }
    return {
      title: "Rekap Cuti",
      columns: [
        { header: "Nopek", key: "nopek", width: 14 },
        { header: "Nama", key: "nama", width: 24 },
        { header: "Perusahaan", key: "perusahaan", width: 22 },
        { header: "Jenis", key: "jenis", width: 16 },
        { header: "Mulai", key: "tanggal_mulai", width: 12 },
        { header: "Selesai", key: "tanggal_selesai", width: 12 },
        { header: "Jumlah Hari", key: "jumlah_hari", width: 12 },
        { header: "Sisa Saldo", key: "sisa_saldo", width: 12 },
        { header: "Keterangan", key: "keterangan", width: 40 },
      ],
      rows: out,
    };
  }

  const rows = await listAllTrips(filter);
  return {
    title: "Rekap Dinas",
    columns: [
      { header: "Nopek", key: "nopek", width: 14 },
      { header: "Nama", key: "nama", width: 24 },
      { header: "Perusahaan", key: "perusahaan", width: 22 },
      { header: "Tujuan", key: "tujuan", width: 22 },
      { header: "Mulai", key: "tanggal_mulai", width: 12 },
      { header: "Selesai", key: "tanggal_selesai", width: 12 },
      { header: "Keperluan", key: "keperluan", width: 40 },
      { header: "Transportasi", key: "transportasi", width: 16 },
    ],
    rows: rows.map((t) => {
      const u = users.get(t.user_id);
      return {
        nopek: u?.nopek ?? "",
        nama: u?.nama_lengkap ?? "",
        perusahaan: u ? companies.get(u.company_id) ?? "" : "",
        tujuan: t.tujuan,
        tanggal_mulai: t.tanggal_mulai,
        tanggal_selesai: t.tanggal_selesai,
        keperluan: t.keperluan,
        transportasi: t.transportasi,
      };
    }),
  };
}

export async function buildXlsx(type: ExportType, filter: Filter): Promise<Buffer> {
  const table = await buildTable(type, filter);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(table.title);
  ws.columns = table.columns;
  ws.getRow(1).font = { bold: true };
  table.rows.forEach((r) => ws.addRow(r));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function buildCsv(type: ExportType, filter: Filter): Promise<string> {
  const table = await buildTable(type, filter);
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = table.columns.map((c) => esc(c.header)).join(",");
  const body = table.rows.map((r) => table.columns.map((c) => esc(r[c.key] ?? "")).join(",")).join("\n");
  return head + "\n" + body;
}
