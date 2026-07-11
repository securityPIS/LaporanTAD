import { ok, qp, route } from "@/lib/api";
import { requireActive } from "@/lib/session";
import { hitungSaldo } from "@/repositories/leaves";

// GET /api/leaves/balance?year= — saldo cuti tahun berjalan.
export const GET = route(async (req) => {
  const u = await requireActive();
  const tahun = Number(qp(req, "year")) || new Date().getFullYear();
  const saldo = await hitungSaldo(u.id, tahun);
  return ok(saldo);
});
