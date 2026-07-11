import { ok, qp, route } from "@/lib/api";
import { getSessionEmail } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { listOptions } from "@/repositories/masters";
import type { MasterOptionRow } from "@/lib/db/tables";

// GET /api/options?kategori= — master opsi (lokasi/divisi/bagian/shift/…) untuk form.
export const GET = route(async (req) => {
  const email = await getSessionEmail();
  if (!email) throw new AppError("TIDAK_LOGIN", "Silakan masuk", 401);
  const kategori = qp(req, "kategori") as MasterOptionRow["kategori"] | undefined;
  const items = (await listOptions(kategori)).filter((o) => o.active);
  return ok({ items });
});
