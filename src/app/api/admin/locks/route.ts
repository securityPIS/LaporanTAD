import { ok, qp, readJson, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { listLocks, lockPeriode, unlockPeriode } from "@/lib/period-lock";
import { writeAudit } from "@/lib/audit";

const PERIODE = /^\d{4}-\d{2}$/;

export const GET = route(async () => {
  await requireAdmin();
  return ok({ items: await listLocks() });
});

// POST /api/admin/locks { periode: "YYYY-MM" } — kunci bulan.
export const POST = route(async (req) => {
  const admin = await requireAdmin();
  const { periode } = await readJson<{ periode?: string }>(req);
  if (!periode || !PERIODE.test(periode)) throw new AppError("VALIDASI_GAGAL", "Periode harus format YYYY-MM", 422);
  const row = await lockPeriode(periode, admin.email);
  await writeAudit({ actorEmail: admin.email, aksi: "kunci", entitas: "period_locks", entitasId: row.id, detail: { periode } });
  return ok({ item: row }, 201);
});

// DELETE /api/admin/locks?periode=YYYY-MM — buka kunci.
export const DELETE = route(async (req) => {
  const admin = await requireAdmin();
  const periode = qp(req, "periode");
  if (!periode || !PERIODE.test(periode)) throw new AppError("VALIDASI_GAGAL", "Periode harus format YYYY-MM", 422);
  const okDel = await unlockPeriode(periode);
  if (!okDel) throw new AppError("TIDAK_DITEMUKAN", "Periode tidak terkunci", 404);
  await writeAudit({ actorEmail: admin.email, aksi: "buka-kunci", entitas: "period_locks", entitasId: periode, detail: { periode } });
  return ok({ ok: true });
});
