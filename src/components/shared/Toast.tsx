"use client";

import { useApp } from "@/lib/store";
import { Icon } from "./Icons";

export function Toast() {
  const { toast, toastKind } = useApp();
  if (!toast) return null;
  const isErr = toastKind === "err";
  return (
    <div
      className="fixed left-1/2 bottom-7 z-[90] flex max-w-[90vw] -translate-x-1/2 items-center gap-[9px] rounded-xl bg-text px-5 py-3 text-[13.5px] font-bold text-surface shadow-lg"
      style={{ animation: "ltUp .25s ease both" }}
      role="status"
    >
      <Icon
        name={isErr ? "close" : "check"}
        size={17}
        strokeWidth={2.6}
        style={{ color: isErr ? "var(--libur)" : "var(--lembur)" }}
      />
      {toast}
    </div>
  );
}
