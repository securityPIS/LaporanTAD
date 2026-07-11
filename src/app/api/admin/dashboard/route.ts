import { ok, route } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { todayWIB } from "@/lib/wib";

// GET /api/admin/dashboard — ringkasan (FR-ADM-01).
export const GET = route(async () => {
  await requireAdmin();
  const [users, overtime, leaves] = await Promise.all([
    db.all("users"),
    db.all("overtime"),
    db.all("leaves"),
  ]);
  const today = todayWIB();
  const month = today.slice(0, 7);

  const pendingCount = users.filter((u) => u.status === "pending").length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const jamLemburBulan = overtime
    .filter((o) => o.tanggal.slice(0, 7) === month)
    .reduce((a, o) => a + o.total_jam, 0);
  const cutiHariIni = leaves.filter((l) => l.tanggal_mulai <= today && l.tanggal_selesai >= today).length;

  return ok({
    pending: pendingCount,
    aktif: activeCount,
    jam_lembur_bulan: Math.round(jamLemburBulan * 100) / 100,
    cuti_hari_ini: cutiHariIni,
  });
});
