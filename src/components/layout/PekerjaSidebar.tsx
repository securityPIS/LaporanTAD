"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/shared/Icons";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/beranda", label: "Beranda", icon: "home" },
  { href: "/lembur", label: "Lembur", icon: "clock" },
  { href: "/cuti", label: "Cuti", icon: "calendar" },
  { href: "/dinas", label: "Dinas", icon: "globe" },
  { href: "/kalender", label: "Kalender", icon: "calendarDots" },
  { href: "/dokumen", label: "Dokumen", icon: "doc" },
  { href: "/pekerja", label: "Direktori", icon: "usersMulti" },
  { href: "/profil", label: "Profil", icon: "badge" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

/** Sidebar navigasi pekerja — hanya tampil di desktop (mobile pakai BottomNav). */
export function PekerjaSidebar() {
  const pathname = usePathname();
  const { me } = useApp();

  return (
    <aside className="hidden wide:sticky wide:top-14 wide:flex wide:h-[calc(100vh-56px)] wide:w-[236px] wide:flex-none wide:flex-col wide:border-r wide:border-border wide:bg-surface wide:px-3 wide:py-4">
      <div className="px-[10px] pb-[6px] pt-1 text-[11px] font-bold uppercase tracking-[.6px] text-faint">
        Menu Pekerja
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-[11px] rounded-[11px] px-3 py-[10px] text-[13.5px] font-bold transition-colors",
                active ? "bg-accent-weak text-accent" : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <Icon name={n.icon} size={18} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>

      {me && (
        <div className="mt-auto flex items-center gap-[10px] border-t border-border px-2 py-[14px]">
          <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-accent-weak text-[12px] font-extrabold text-accent">
            {initials(me.nama_lengkap)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-bold">{me.nama_lengkap}</div>
            <div className="text-[10.5px] text-faint">{me.role === "admin" ? "Admin" : "Pekerja"}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
