"use client";

import { Icon, type IconName } from "@/components/shared/Icons";

export const TH = "whitespace-nowrap px-4 py-[13px] text-[11px] font-bold uppercase tracking-[.4px] text-muted text-left";
export const TD = "whitespace-nowrap px-4 py-3 text-[13px] text-muted";
export const SELECT =
  "h-[42px] cursor-pointer rounded-[11px] border border-border bg-surface px-[14px] text-[13.5px] font-semibold text-text outline-none";
export const INPUT =
  "h-[42px] w-full rounded-[11px] border border-border bg-surface px-[14px] text-[13.5px] text-text outline-none";
export const BTN =
  "flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text";
export const BTN_PRIMARY =
  "flex h-10 items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-extrabold text-white";

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
  return <div className={`rounded-2xl border border-border bg-surface shadow-sm ${className ?? ""}`}>{children}</div>;
}

export function IconBtn({ icon, onClick, tone = "muted", label }: { icon: IconName; onClick: () => void; tone?: "muted" | "libur" | "accent"; label: string }) {
  const color = tone === "libur" ? "var(--libur)" : tone === "accent" ? "var(--accent)" : "var(--muted)";
  return (
    <button onClick={onClick} aria-label={label} className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px] border border-border bg-surface-2" style={{ color }}>
      <Icon name={icon} size={15} />
    </button>
  );
}
