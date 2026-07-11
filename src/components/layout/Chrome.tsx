"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/shared/Icons";

const SEG_BASE =
  "cursor-pointer rounded-lg px-[14px] py-[7px] text-[12.5px] font-bold transition-all";

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useApp();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="sticky top-0 z-40 flex h-14 flex-none items-center justify-between gap-3 border-b border-border bg-surface px-[clamp(14px,3vw,28px)]">
        <div className="flex min-w-0 items-center gap-[11px]">
          <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] bg-accent shadow-sm">
            <Icon name="logo" size={17} strokeWidth={2.4} style={{ color: "#fff" }} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold leading-none tracking-[-.2px]">LaporanTAD</div>
            <div className="mt-[2px] text-[10.5px] font-semibold uppercase tracking-[.3px] text-faint">
              Administrasi Pekerja
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          <div className="flex gap-[2px] rounded-[10px] bg-surface-3 p-[3px]">
            <Link
              href="/beranda"
              className={cn(
                SEG_BASE,
                !isAdmin ? "bg-surface text-accent shadow-sm" : "bg-transparent text-muted",
              )}
            >
              Pekerja
            </Link>
            <Link
              href="/admin"
              className={cn(
                SEG_BASE,
                isAdmin ? "bg-surface text-accent shadow-sm" : "bg-transparent text-muted",
              )}
            >
              Admin
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            title="Ganti tema"
            aria-label="Ganti tema"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
