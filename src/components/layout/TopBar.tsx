"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/shared/Icons";
import { AppLogo } from "@/components/shared/AppLogo";

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export function TopBar({ columnFramed = false }: { columnFramed?: boolean }) {
  const pathname = usePathname();
  const { theme, toggleTheme, me } = useApp();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[76px] flex-none bg-bg px-[clamp(10px,3vw,22px)] pb-[10px] pt-[14px]",
        // Pada desktop, saat berada dalam kolom terpusat, hilangkan padding samping
        // agar lebar pill top bar persis sama dengan kotak konten di bawahnya.
        columnFramed && "wide:px-0",
      )}
    >
      <div className="flex h-[52px] items-center justify-between gap-3 rounded-2xl bg-surface px-[clamp(12px,2vw,18px)] shadow">
        <div className="flex min-w-0 items-center gap-[11px]">
          <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-2xl shadow-sm">
            <AppLogo size={34} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold leading-none tracking-[-.2px]">LaporanTAD</div>
            <div className="mt-[3px] text-[10.5px] font-semibold uppercase tracking-[.3px] text-faint">
              Administrasi Pekerja
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          {me?.role === "admin" && (
            <div className="flex gap-[3px] rounded-2xl bg-surface-2 p-[4px] shadow-inset">
              <Link
                href="/beranda"
                className={cn(
                  "cursor-pointer rounded-xl px-[14px] py-[7px] text-[12.5px] font-bold transition-all",
                  !isAdmin ? "bg-surface text-accent shadow-sm" : "bg-transparent text-muted",
                )}
              >
                Pekerja
              </Link>
              <Link
                href="/admin"
                className={cn(
                  "cursor-pointer rounded-xl px-[14px] py-[7px] text-[12.5px] font-bold transition-all",
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
            className="clay-press flex h-[40px] w-[40px] items-center justify-center rounded-2xl bg-surface-2 text-muted shadow-sm transition-all"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
          </button>

          {me && (
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="clay-press flex h-[40px] items-center gap-2 rounded-2xl bg-surface-2 pl-[5px] pr-[9px] shadow-sm transition-all"
              >
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-xl bg-accent text-[12px] font-extrabold text-white shadow-sm">
                  {initials(me.nama_lengkap)}
                </span>
                <Icon name="chevronDown" size={14} className="text-faint" />
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 top-[50px] z-50 w-56 rounded-2xl bg-surface p-2 shadow-lg">
                    <div className="px-3 py-2">
                      <div className="truncate text-[13px] font-bold">{me.nama_lengkap}</div>
                      <div className="truncate text-[11px] text-faint">{me.email}</div>
                      <div className="mt-1 inline-block rounded-lg bg-surface-2 px-2 py-0.5 text-[10.5px] font-bold text-muted shadow-inset">
                        {me.role === "admin" ? "Admin" : "Pekerja"}
                      </div>
                    </div>
                    {me.role !== "admin" && (
                      <Link
                        href="/profil"
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2 text-[13px] font-semibold text-text hover:bg-surface-2"
                      >
                        Profil Saya
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ redirectTo: "/login" })}
                      className="block w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-libur hover:bg-surface-2"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
