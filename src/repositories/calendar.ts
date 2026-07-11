import { db } from "@/lib/db";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import type { UserRow } from "@/lib/db/tables";

export type CalType = "libur" | "cuti" | "dinas" | "lembur";
export interface CalEvent {
  iso: string;
  type: CalType;
  label: string;
  own: boolean;
}

function eachDate(mulai: string, selesai: string): string[] {
  const out: string[] = [];
  const [ys, ms, ds] = mulai.split("-").map(Number);
  const [ye, me, de] = selesai.split("-").map(Number);
  const cur = new Date(Date.UTC(ys, ms - 1, ds));
  const end = new Date(Date.UTC(ye, me - 1, de));
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/**
 * Kejadian kalender untuk sebuah bulan. Pekerja melihat: libur nasional +
 * kejadian miliknya + cuti/dinas rekan SATU lokasi & bagian. Admin melihat semua.
 */
export async function calendarEvents(viewer: UserRow, month: string): Promise<CalEvent[]> {
  const isAdmin = viewer.role === "admin";
  const inMonth = (iso: string) => iso.slice(0, 7) === month;
  const events: CalEvent[] = [];

  const users = await db.all("users");
  const byId = new Map(users.map((u) => [u.id, u]));
  const leaveTypes = new Map((await db.all("leave_types")).map((t) => [t.id, t.nama]));

  const visible = (uid: string) => {
    if (isAdmin || uid === viewer.id) return true;
    const u = byId.get(uid);
    return Boolean(u && u.lokasi_kerja === viewer.lokasi_kerja && u.bagian === viewer.bagian);
  };

  for (const h of await db.all("holidays")) {
    if (inMonth(h.tanggal)) events.push({ iso: h.tanggal, type: "libur", label: h.nama, own: false });
  }

  for (const o of await db.all("overtime")) {
    if (!inMonth(o.tanggal)) continue;
    const own = o.user_id === viewer.id;
    if (!own && !isAdmin) continue; // lembur rekan tidak ditampilkan (hanya cuti/dinas)
    const nama = byId.get(o.user_id)?.nama_lengkap ?? "";
    events.push({
      iso: o.tanggal,
      type: "lembur",
      label: `${own ? "Lembur" : nama + " — lembur"} (${fmtJamHHMM(o.total_jam)} jam)`,
      own,
    });
  }

  for (const l of await db.all("leaves")) {
    if (!visible(l.user_id)) continue;
    const own = l.user_id === viewer.id;
    const nama = byId.get(l.user_id)?.nama_lengkap ?? "";
    const jenis = leaveTypes.get(l.leave_type_id) ?? "Cuti";
    for (const iso of eachDate(l.tanggal_mulai, l.tanggal_selesai)) {
      if (inMonth(iso)) events.push({ iso, type: "cuti", label: `${own ? "Anda" : nama} — ${jenis}`, own });
    }
  }

  for (const t of await db.all("trips")) {
    if (!visible(t.user_id)) continue;
    const own = t.user_id === viewer.id;
    const nama = byId.get(t.user_id)?.nama_lengkap ?? "";
    for (const iso of eachDate(t.tanggal_mulai, t.tanggal_selesai)) {
      if (inMonth(iso)) events.push({ iso, type: "dinas", label: `${own ? "Anda" : nama} — Dinas ${t.tujuan}`, own });
    }
  }

  return events.sort((a, b) => (a.iso < b.iso ? -1 : 1));
}
