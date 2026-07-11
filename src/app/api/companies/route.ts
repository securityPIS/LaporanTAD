import { ok, route } from "@/lib/api";
import { getSessionEmail } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { listCompanies } from "@/repositories/masters";

// GET /api/companies — daftar perusahaan aktif (untuk form registrasi & lainnya).
// Dapat diakses pengguna yang sudah login (termasuk pendaftar baru).
export const GET = route(async () => {
  const email = await getSessionEmail();
  if (!email) throw new AppError("TIDAK_LOGIN", "Silakan masuk", 401);
  const items = (await listCompanies()).filter((c) => c.active);
  return ok({ items });
});
