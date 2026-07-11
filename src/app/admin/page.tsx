"use client";

import { useApp } from "@/lib/store";
import { Icon, type IconName } from "@/components/shared/Icons";
import { fmtLong, TODAY_ISO } from "@/lib/date";
import { ADMIN_STATS, CUTI_TODAY, PENDING_REGS } from "@/lib/mock-data";

const STAT_ICON: Record<string, IconName> = {
  users: "users",
  badge: "badge",
  clock: "clock",
  cal: "calendar",
};

export default function AdminDashboardPage() {
  const { showToast } = useApp();

  return (
    <div className="animate-ltFade">
      <div className="text-2xl font-extrabold tracking-[-.5px]">Dashboard</div>
      <div className="mt-[3px] text-[13px] font-semibold text-faint">
        Ringkasan administrasi · {fmtLong(TODAY_ISO)}
      </div>

      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
        {ADMIN_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-[18px] shadow-sm">
            <div className="flex items-center justify-between">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: s.bg, color: s.fg }}
              >
                <Icon name={STAT_ICON[s.icon] ?? "clock"} size={20} />
              </span>
              <span className="text-[11px] font-bold" style={{ color: s.trendColor }}>
                {s.trend}
              </span>
            </div>
            <div className="mt-[14px] font-mono text-[28px] font-bold tracking-[-1px]">{s.value}</div>
            <div className="mt-[2px] text-[12.5px] font-semibold text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 wide:grid-cols-[1.4fr_1fr]">
        {/* Antrean verifikasi */}
        <div className="rounded-2xl border border-border bg-surface p-[18px_20px] shadow-sm">
          <div className="mb-[14px] flex items-center justify-between">
            <span className="text-sm font-extrabold">Pendaftar menunggu verifikasi</span>
            <span className="cursor-pointer text-xs font-bold text-accent">Buka antrean →</span>
          </div>
          <div className="flex flex-col gap-[10px]">
            {PENDING_REGS.map((p) => (
              <div
                key={p.nama}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-[11px]"
              >
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-accent-weak text-[13px] font-extrabold text-accent">
                  {p.ini}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold">{p.nama}</div>
                  <div className="text-[11.5px] text-faint">{p.sub}</div>
                </div>
                <div className="flex gap-[6px]">
                  <button
                    onClick={() => showToast("Pendaftar disetujui")}
                    className="h-8 rounded-[9px] border-none bg-lembur px-3 text-xs font-bold text-white"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => showToast("Pendaftar ditolak")}
                    className="h-8 rounded-[9px] border border-border-strong bg-surface px-3 text-xs font-bold text-muted"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuti hari ini */}
        <div className="rounded-2xl border border-border bg-surface p-[18px_20px] shadow-sm">
          <div className="mb-[14px] text-sm font-extrabold">Cuti hari ini</div>
          <div className="flex flex-col gap-[10px]">
            {CUTI_TODAY.map((c) => (
              <div key={c.nama} className="flex items-center gap-[11px]">
                <span className="h-2 w-2 flex-none rounded-full bg-cuti" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold">{c.nama}</div>
                  <div className="text-[11px] text-faint">{c.sub}</div>
                </div>
                <span className="rounded-[20px] bg-surface-3 px-2 py-[3px] text-[11px] font-bold text-muted">
                  {c.jenis}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
