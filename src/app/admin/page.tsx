"use client";

import Link from "next/link";
import { useData } from "@/lib/client";
import { Icon, type IconName } from "@/components/shared/Icons";
import { AdminHeader, Card } from "@/components/admin/ui";
import { fmtLong } from "@/lib/date";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import { todayWIB } from "@/lib/wib";

interface Dash { pending: number; aktif: number; jam_lembur_bulan: number; cuti_hari_ini: number }
interface Pending { id: string; nama_lengkap: string; nopek: string }

const STATS: { key: keyof Dash; label: string; icon: IconName; bg: string; fg: string; fmt?: (n: number) => string }[] = [
  { key: "pending", label: "Pendaftar menunggu", icon: "users", bg: "var(--accent-weak)", fg: "var(--accent)" },
  { key: "aktif", label: "Pekerja aktif", icon: "badge", bg: "var(--lembur-weak)", fg: "var(--lembur)" },
  { key: "jam_lembur_bulan", label: "Jam lembur bulan ini", icon: "clock", bg: "var(--dinas-weak)", fg: "var(--dinas)", fmt: fmtJamHHMM },
  { key: "cuti_hari_ini", label: "Cuti hari ini", icon: "calendar", bg: "var(--cuti-weak)", fg: "var(--cuti)" },
];

export default function AdminDashboardPage() {
  const { data } = useData<Dash>("/api/admin/dashboard");
  const pending = useData<{ items: Pending[] }>("/api/admin/registrations");

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Dashboard" subtitle={`Ringkasan administrasi · ${fmtLong(todayWIB())}`} />

      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
        {STATS.map((s) => {
          const val = data ? data[s.key] : 0;
          return (
            <Card key={s.label} className="p-[18px]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: s.bg, color: s.fg }}>
                <Icon name={s.icon} size={20} />
              </span>
              <div className="mt-[14px] font-mono text-[28px] font-bold tracking-[-1px]">
                {s.fmt ? s.fmt(Number(val)) : val}
              </div>
              <div className="mt-[2px] text-[12.5px] font-semibold text-muted">{s.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4">
        <Card className="p-[18px_20px]">
          <div className="mb-[14px] flex items-center justify-between">
            <span className="text-sm font-extrabold">Pendaftar menunggu verifikasi</span>
            <Link href="/admin/registrasi" className="text-xs font-bold text-accent">Buka antrean →</Link>
          </div>
          <div className="flex flex-col gap-[10px]">
            {(pending.data?.items ?? []).length === 0 && (
              <div className="py-4 text-center text-[12.5px] text-faint">Tidak ada pendaftar menunggu.</div>
            )}
            {(pending.data?.items ?? []).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-[11px]">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-accent-weak text-[13px] font-extrabold text-accent">
                  {p.nama_lengkap.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold">{p.nama_lengkap}</div>
                  <div className="text-[11.5px] text-faint">{p.nopek}</div>
                </div>
                <Link href="/admin/registrasi" className="text-xs font-bold text-accent">Tinjau →</Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
