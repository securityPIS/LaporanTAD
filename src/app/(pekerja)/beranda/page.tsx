"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon, type IconName } from "@/components/shared/Icons";
import { BULANS, fmtLong, HARI, parseISO, TODAY_ISO } from "@/lib/date";
import { calc, fmtJam, jenisMeta, monthSummary } from "@/lib/overtime";
import { hitungSaldo } from "@/lib/cuti";
import { CURRENT_USER, SEED_CUTI, SISA_MINGGU } from "@/lib/mock-data";

const MENU: { label: string; icon: IconName; bg: string; fg: string; href: string }[] = [
  { label: "Lembur", icon: "clock", bg: "var(--lembur-weak)", fg: "var(--lembur)", href: "/lembur" },
  { label: "Cuti", icon: "calendar", bg: "var(--cuti-weak)", fg: "var(--cuti)", href: "/cuti" },
  { label: "Kalender", icon: "calendar", bg: "var(--accent-weak)", fg: "var(--accent)", href: "/kalender" },
  { label: "Dokumen", icon: "doc", bg: "var(--dinas-weak)", fg: "var(--dinas)", href: "/dokumen" },
];

export default function BerandaPage() {
  const { overtime } = useApp();
  const bulan = monthSummary(overtime, "2026-07");
  const saldo = hitungSaldo(SEED_CUTI);

  const recent = overtime
    .slice()
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
    .slice(0, 3)
    .map((o) => {
      const m = jenisMeta(o.jenis);
      const dt = parseISO(o.tanggal);
      return {
        id: o.id,
        ket: o.keterangan,
        sub: `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULANS[dt.getMonth()]} · ${m.label}`,
        jam: fmtJam(calc(o.mulai, o.selesai)),
        dot: m.c,
      };
    });

  return (
    <div className={PHONE_SCROLL}>
      {/* Salam */}
      <div className="px-[18px] pb-2 pt-[22px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold text-muted">Selamat sore,</div>
            <div className="mt-[1px] text-[22px] font-extrabold tracking-[-.4px]">{CURRENT_USER.nama}</div>
            <div className="mt-[3px] text-xs font-semibold text-faint">{fmtLong(TODAY_ISO)}</div>
          </div>
          <div className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-2xl bg-accent-weak text-base font-extrabold text-accent">
            {CURRENT_USER.inisial}
          </div>
        </div>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-2 gap-3 px-[18px] pb-1 pt-[14px]">
        <div
          className="relative col-span-2 overflow-hidden rounded-[18px] p-[18px] text-white shadow"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-ink))" }}
        >
          <div className="absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-white/10" />
          <div className="text-xs font-semibold opacity-90">Total lembur Juli 2026</div>
          <div className="mt-[6px] flex items-baseline gap-[6px]">
            <span className="font-mono text-[34px] font-bold tracking-[-1px]">{bulan.total}</span>
            <span className="text-sm font-semibold opacity-90">jam</span>
          </div>
          <div className="mt-1 text-[11.5px] opacity-80">
            dari {bulan.count} catatan · sisa kuota mingguan {SISA_MINGGU} jam
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-[15px]">
          <div className="flex items-center gap-[7px] text-cuti">
            <Icon name="calendar" size={16} />
            <span className="text-xs font-bold">Sisa cuti</span>
          </div>
          <div className="mt-[7px] font-mono text-[26px] font-bold">
            {saldo.sisa} <span className="font-sans text-[13px] text-faint">hari</span>
          </div>
          <div className="mt-[2px] text-[11px] text-faint">dari {saldo.kuota} hari / tahun</div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-[15px]">
          <div className="flex items-center gap-[7px] text-dinas">
            <Icon name="globe" size={16} />
            <span className="text-xs font-bold">Terdekat</span>
          </div>
          <div className="mt-[7px] text-[15px] font-extrabold tracking-[-.2px]">Dinas · Surabaya</div>
          <div className="mt-[2px] text-[11px] text-faint">15–17 Jul 2026</div>
        </div>
      </div>

      {/* Menu cepat */}
      <div className="px-[18px] pb-1 pt-5">
        <div className="mb-3 text-xs font-bold uppercase tracking-[.5px] text-muted">Menu Cepat</div>
        <div className="grid grid-cols-4 gap-[10px]">
          {MENU.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="flex flex-col items-center gap-[7px] rounded-[15px] border border-border bg-surface p-[13px_4px] text-text"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: m.bg, color: m.fg }}
              >
                <Icon name={m.icon} size={20} />
              </span>
              <span className="text-[11px] font-bold">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Aktivitas terakhir */}
      <div className="px-[18px] pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[.5px] text-muted">Aktivitas Terakhir</div>
          <Link href="/lembur" className="text-xs font-bold text-accent">
            Lihat semua
          </Link>
        </div>
        <div className="flex flex-col gap-[9px]">
          {recent.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-[13px] py-3"
            >
              <span className="h-2 w-2 flex-none rounded-full" style={{ background: r.dot }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{r.ket}</div>
                <div className="mt-[1px] text-[11.5px] text-faint">{r.sub}</div>
              </div>
              <div className="font-mono text-[13px] font-semibold text-muted">{r.jam}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
