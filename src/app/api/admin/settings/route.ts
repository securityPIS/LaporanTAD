import { ok, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { z } from "zod";

export const GET = route(async () => {
  await requireAdmin();
  const rows = await db.all("settings");
  return ok({ items: rows });
});

const patchSchema = z.record(z.string(), z.union([z.string(), z.number()]));

// PATCH /api/admin/settings — ubah nilai settings (batas lembur, kuota default).
export const PATCH = route(async (req) => {
  const admin = await requireAdmin();
  const data = patchSchema.parse(await readJson(req));
  for (const [key, value] of Object.entries(data)) {
    const existing = await db.findOne("settings", (s) => s.key === key);
    if (existing) {
      await db.updateById("settings", key, { value: String(value) });
    } else {
      await db.insert("settings", { key, value: String(value), keterangan: "" });
    }
  }
  await writeAudit({ actorEmail: admin.email, aksi: "ubah-settings", entitas: "settings", entitasId: "-", detail: data });
  return ok({ ok: true });
});
