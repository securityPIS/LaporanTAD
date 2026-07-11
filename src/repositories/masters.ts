import { db } from "@/lib/db";
import { cached, invalidate } from "@/lib/cache";
import { newId } from "@/lib/id";
import { nowWIB } from "@/lib/wib";
import { writeAudit } from "@/lib/audit";
import { AppError } from "@/lib/errors";
import type {
  CompanyRow,
  DocTemplateRow,
  HolidayRow,
  MasterOptionRow,
} from "@/lib/db/tables";

// ── Companies ────────────────────────────────────────────────────────────
export async function listCompanies(): Promise<CompanyRow[]> {
  return cached("companies", 60_000, () => db.all("companies"));
}
export async function createCompany(actorEmail: string, data: Omit<CompanyRow, "id" | "created_at">): Promise<CompanyRow> {
  const row: CompanyRow = { id: newId(), created_at: nowWIB(), ...data };
  const saved = await db.insert("companies", row);
  invalidate("companies");
  await writeAudit({ actorEmail, aksi: "buat", entitas: "companies", entitasId: saved.id, detail: { nama: saved.nama } });
  return saved;
}
export async function updateCompany(actorEmail: string, id: string, patch: Partial<CompanyRow>): Promise<CompanyRow> {
  const saved = await db.updateById("companies", id, patch);
  if (!saved) throw new AppError("TIDAK_DITEMUKAN", "Perusahaan tidak ditemukan", 404);
  invalidate("companies");
  await writeAudit({ actorEmail, aksi: "ubah", entitas: "companies", entitasId: id, detail: patch });
  return saved;
}
export async function deleteCompany(actorEmail: string, id: string): Promise<void> {
  const ok = await db.deleteById("companies", id);
  if (!ok) throw new AppError("TIDAK_DITEMUKAN", "Perusahaan tidak ditemukan", 404);
  invalidate("companies");
  await writeAudit({ actorEmail, aksi: "hapus", entitas: "companies", entitasId: id });
}

// ── Master options ───────────────────────────────────────────────────────
export async function listOptions(kategori?: MasterOptionRow["kategori"]): Promise<MasterOptionRow[]> {
  const rows = await cached("master_options", 60_000, () => db.all("master_options"));
  const filtered = kategori ? rows.filter((r) => r.kategori === kategori) : rows;
  return filtered.slice().sort((a, b) => a.urutan - b.urutan);
}
export async function createOption(actorEmail: string, data: Omit<MasterOptionRow, "id">): Promise<MasterOptionRow> {
  const row: MasterOptionRow = { id: newId(), ...data };
  const saved = await db.insert("master_options", row);
  invalidate("master_options");
  await writeAudit({ actorEmail, aksi: "buat", entitas: "master_options", entitasId: saved.id, detail: { kategori: data.kategori, nilai: data.nilai } });
  return saved;
}
export async function updateOption(actorEmail: string, id: string, patch: Partial<MasterOptionRow>): Promise<MasterOptionRow> {
  const saved = await db.updateById("master_options", id, patch);
  if (!saved) throw new AppError("TIDAK_DITEMUKAN", "Opsi tidak ditemukan", 404);
  invalidate("master_options");
  await writeAudit({ actorEmail, aksi: "ubah", entitas: "master_options", entitasId: id, detail: patch });
  return saved;
}
export async function deleteOption(actorEmail: string, id: string): Promise<void> {
  const ok = await db.deleteById("master_options", id);
  if (!ok) throw new AppError("TIDAK_DITEMUKAN", "Opsi tidak ditemukan", 404);
  invalidate("master_options");
  await writeAudit({ actorEmail, aksi: "hapus", entitas: "master_options", entitasId: id });
}

// ── Holidays ─────────────────────────────────────────────────────────────
export async function listHolidays(tahun?: number): Promise<HolidayRow[]> {
  const rows = await cached("holidays", 60_000, () => db.all("holidays"));
  const filtered = tahun ? rows.filter((h) => h.tahun === tahun) : rows;
  return filtered.slice().sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1));
}
export async function upsertHoliday(actorEmail: string, tanggal: string, nama: string, sumber: HolidayRow["sumber"] = "manual"): Promise<HolidayRow> {
  const existing = await db.findOne("holidays", (h) => h.tanggal === tanggal);
  if (existing) {
    const saved = await db.updateById("holidays", existing.id, { nama, sumber });
    invalidate("holidays");
    return saved!;
  }
  const row: HolidayRow = { id: newId(), tanggal, nama, tahun: Number(tanggal.slice(0, 4)), sumber };
  const saved = await db.insert("holidays", row);
  invalidate("holidays");
  await writeAudit({ actorEmail, aksi: "buat", entitas: "holidays", entitasId: saved.id, detail: { tanggal, nama } });
  return saved;
}
export async function deleteHoliday(actorEmail: string, id: string): Promise<void> {
  const ok = await db.deleteById("holidays", id);
  if (!ok) throw new AppError("TIDAK_DITEMUKAN", "Libur tidak ditemukan", 404);
  invalidate("holidays");
  await writeAudit({ actorEmail, aksi: "hapus", entitas: "holidays", entitasId: id });
}

// ── Doc templates ────────────────────────────────────────────────────────
export async function listTemplates(): Promise<DocTemplateRow[]> {
  return db.all("doc_templates");
}
export async function createTemplate(actorEmail: string, data: Omit<DocTemplateRow, "id" | "created_at">): Promise<DocTemplateRow> {
  const row: DocTemplateRow = { id: newId(), created_at: nowWIB(), ...data };
  const saved = await db.insert("doc_templates", row);
  await writeAudit({ actorEmail, aksi: "buat", entitas: "doc_templates", entitasId: saved.id, detail: { nama: data.nama } });
  return saved;
}
export async function updateTemplate(actorEmail: string, id: string, patch: Partial<DocTemplateRow>): Promise<DocTemplateRow> {
  const saved = await db.updateById("doc_templates", id, patch);
  if (!saved) throw new AppError("TIDAK_DITEMUKAN", "Template tidak ditemukan", 404);
  await writeAudit({ actorEmail, aksi: "ubah", entitas: "doc_templates", entitasId: id, detail: patch });
  return saved;
}
export async function deleteTemplate(actorEmail: string, id: string): Promise<void> {
  const ok = await db.deleteById("doc_templates", id);
  if (!ok) throw new AppError("TIDAK_DITEMUKAN", "Template tidak ditemukan", 404);
  await writeAudit({ actorEmail, aksi: "hapus", entitas: "doc_templates", entitasId: id });
}
