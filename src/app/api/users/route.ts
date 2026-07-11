import { ok, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { listUsers, toDirectoryEntry } from "@/repositories/users";

// GET /api/users — direktori pekerja aktif TANPA kontak darurat (FR-PKJ-01/03).
export const GET = route(async () => {
  await requireActive();
  const rows = await listUsers({ status: "active" });
  return ok({ items: rows.map(toDirectoryEntry) });
});
