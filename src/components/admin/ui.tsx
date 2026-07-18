"use client";

import { Icon, type IconName } from "@/components/shared/Icons";

export const TH = "whitespace-nowrap px-4 py-[13px] text-[11px] font-bold uppercase tracking-[.4px] text-muted text-left";
export const TD = "whitespace-nowrap px-4 py-3 text-[13px] text-muted";
export const SELECT =
  "h-[42px] cursor-pointer rounded-xl bg-surface-2 px-[14px] text-[13.5px] font-semibold text-text shadow-inset outline-none focus:ring-2 focus:ring-accent";
export const INPUT =
  "h-[42px] w-full rounded-xl bg-surface-2 px-[14px] text-[13.5px] text-text shadow-inset outline-none focus:ring-2 focus:ring-accent";
export const BTN =
  "clay-press flex h-10 items-center gap-2 rounded-xl bg-surface px-4 text-[13px] font-bold text-text shadow transition-all";
export const BTN_PRIMARY =
  "clay-press flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-[13px] font-extrabold text-white shadow transition-all";

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-2xl font-extrabold tracking-[-.5px]">{title}</div>
        {subtitle && <div className="mt-[3px] text-[13px] font-semibold text-faint">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-surface shadow ${className ?? ""}`}>{children}</div>;
}

export function IconBtn({ icon, onClick, tone = "muted", label }: { icon: IconName; onClick: () => void; tone?: "muted" | "libur" | "accent"; label: string }) {
  const color = tone === "libur" ? "var(--libur)" : tone === "accent" ? "var(--accent)" : "var(--muted)";
  return (
    <button onClick={onClick} aria-label={label} className="clay-press flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-surface-2 shadow-sm transition-all" style={{ color }}>
      <Icon name={icon} size={15} strokeWidth={2.1} />
    </button>
  );
}
