import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { updateUser } from "@/repositories/users";
import { storage } from "@/lib/storage";
import { writeAudit } from "@/lib/audit";
import { AppError } from "@/lib/errors";
import { nowWIB } from "@/lib/wib";

// PUT /api/me/ttd — simpan gambar TTD tersimpan (PNG data URL). FR-DOK-07.
export const PUT = route(async (req) => {
  const u = await requireActive();
  const body = await readJson<{ data_url?: string }>(req);
  const dataUrl = body.data_url ?? "";
  const m = dataUrl.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
  if (!m) throw new AppError("VALIDASI_GAGAL", "Data TTD tidak valid (harus PNG/JPEG data URL).", 422);
  const bytes = Buffer.from(m[3], "base64");
  if (u.ttd_file_id) await storage().delete(u.ttd_file_id);
  const meta = await storage().put("dokumen/ttd", `ttd_${u.nopek}.png`, m[1], bytes);
  const saved = await updateUser(u.id, { ttd_file_id: meta.id, updated_at: nowWIB() });
  await writeAudit({ actorEmail: u.email, aksi: "simpan-ttd", entitas: "users", entitasId: u.id });
  return ok({ ttd_file_id: saved!.ttd_file_id });
});

// DELETE /api/me/ttd — hapus TTD tersimpan.
export const DELETE = route(async () => {
  const u = await requireActive();
  if (u.ttd_file_id) await storage().delete(u.ttd_file_id);
  await updateUser(u.id, { ttd_file_id: "", updated_at: nowWIB() });
  await writeAudit({ actorEmail: u.email, aksi: "hapus-ttd", entitas: "users", entitasId: u.id });
  return ok({ ok: true });
});
