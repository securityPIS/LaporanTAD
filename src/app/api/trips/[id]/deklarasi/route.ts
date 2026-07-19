import { ok, readJson, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { saveDeklarasi } from "@/repositories/trips";
import { deklarasiSchema } from "@/schemas";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/trips/[id]/deklarasi — simpan realisasi + rincian biaya (fase 2).
// Dokumen Deklarasi digenerate terpisah via /api/generate (jenis deklarasi_dinas).
export const PATCH = route<Ctx>(async (req, { params }) => {
  const u = await requireActive();
  const { id } = await params;
  const input = deklarasiSchema.parse(await readJson(req));
  const view = await saveDeklarasi(u, id, input);
  return ok({ trip: view });
});
