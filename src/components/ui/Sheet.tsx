"use client";

import { Icon } from "@/components/shared/Icons";

/** Shell modal bottom-sheet: overlay + kartu (header, body scroll, footer). */
export function Sheet({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(10,14,22,.5)] backdrop-blur-[3px]"
      style={{ animation: "ltFade .2s ease both" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lg wide:mb-[3vh] wide:max-h-[88vh] wide:w-[460px] wide:rounded-[22px]"
        style={{ animation: "ltSheet .28s cubic-bezier(.2,.8,.2,1) both" }}
      >
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-border bg-surface px-5 pb-[14px] pt-[18px]">
          <div>
            <div className="text-[17px] font-extrabold tracking-[-.3px]">{title}</div>
            {subtitle && <div className="mt-[1px] text-xs text-faint">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted"
          >
            <Icon name="close" size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-[18px]">{children}</div>

        <div className="flex gap-[10px] border-t border-border bg-surface px-5 py-[14px]">{footer}</div>
      </div>
    </div>
  );
}

// Kelas form dipakai bersama oleh ketiga modal (label, input, textarea).
export const LBL = "mb-[7px] block text-xs font-bold text-muted";
export const INP =
  "h-[46px] w-full rounded-xl border border-border bg-surface-2 px-[14px] text-sm text-text outline-none";
export const AREA =
  "min-h-[66px] w-full resize-y rounded-xl border border-border bg-surface-2 px-[14px] py-[11px] text-sm text-text outline-none";
export const BTN_BATAL =
  "h-12 flex-none cursor-pointer rounded-[13px] border border-border-strong bg-surface px-[18px] text-sm font-bold text-muted";
export const BTN_PRIMARY =
  "h-12 flex-1 cursor-pointer rounded-[13px] border-none bg-accent text-[14.5px] font-extrabold text-white shadow";
