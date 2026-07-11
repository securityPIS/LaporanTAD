"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/shared/Icons";

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export function TopBar() {
  const pathname = usePathname();
  const { theme, toggleTheme, me } = useApp();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  return (
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
        {me?.role === "admin" && (
          <div className="flex gap-[2px] rounded-[10px] bg-surface-3 p-[3px]">
            <Link
              href="/beranda"
              className={cn(
                "cursor-pointer rounded-lg px-[14px] py-[7px] text-[12.5px] font-bold",
                !isAdmin ? "bg-surface text-accent shadow-sm" : "bg-transparent text-muted",
              )}
            >
              Pekerja
            </Link>
            <Link
              href="/admin"
              className={cn(
                "cursor-pointer rounded-lg px-[14px] py-[7px] text-[12.5px] font-bold",
                isAdmin ? "bg-surface text-accent shadow-sm" : "bg-transparent text-muted",
              )}
            >
              Admin
            </Link>
          </div>
        )}

        <button
          onClick={toggleTheme}
          title="Ganti tema"
          aria-label="Ganti tema"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted"
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
        </button>

        {me && (
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-[38px] items-center gap-2 rounded-[10px] border border-border bg-surface-2 pl-1 pr-2"
            >
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-accent-weak text-[12px] font-extrabold text-accent">
                {initials(me.nama_lengkap)}
              </span>
              <Icon name="chevronDown" size={14} className="text-faint" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-[46px] z-50 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg">
                  <div className="px-3 py-2">
                    <div className="truncate text-[13px] font-bold">{me.nama_lengkap}</div>
                    <div className="truncate text-[11px] text-faint">{me.email}</div>
                    <div className="mt-1 inline-block rounded-md bg-surface-3 px-2 py-0.5 text-[10.5px] font-bold text-muted">
                      {me.role === "admin" ? "Admin" : "Pekerja"}
                    </div>
                  </div>
                  {me.role !== "admin" && (
                    <Link
                      href="/profil"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-[13px] font-semibold text-text hover:bg-surface-2"
                    >
                      Profil Saya
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ redirectTo: "/login" })}
                    className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-libur hover:bg-surface-2"
                  >
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
