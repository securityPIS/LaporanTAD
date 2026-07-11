"use client";

import { useApp } from "@/lib/store";
import { Icon } from "./Icons";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div
      className="fixed left-1/2 bottom-7 z-[90] flex max-w-[90vw] -translate-x-1/2 items-center gap-[9px] rounded-xl bg-text px-5 py-3 text-[13.5px] font-bold text-surface shadow-lg"
      style={{ animation: "ltUp .25s ease both" }}
      role="status"
    >
      <Icon name="check" size={17} strokeWidth={2.6} style={{ color: "var(--lembur)" }} />
      {toast}
    </div>
  );
}
