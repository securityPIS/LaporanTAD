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
  { href: "/dinas", label: "Dinas", icon: "plane" },
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

/**
 * Sidebar navigasi pekerja — rail mengambang (floating) khusus desktop.
 * Hanya menampilkan ikon; label muncul sebagai tooltip saat hover.
 * (Mobile memakai BottomNav.)
 */
export function PekerjaSidebar() {
  const pathname = usePathname();
  const { me } = useApp();

  return (
    <aside className="hidden wide:sticky wide:top-[76px] wide:z-30 wide:flex wide:h-[calc(100vh-76px)] wide:flex-none wide:flex-col wide:items-center wide:pb-4 wide:pl-[clamp(10px,3vw,22px)] wide:pr-1">
      <nav className="flex h-full w-[68px] flex-col items-center gap-[6px] rounded-3xl bg-surface px-[10px] py-4 shadow-lg">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-label={n.label}
              className={cn(
                "group relative flex h-[46px] w-[46px] flex-none items-center justify-center rounded-2xl transition-all",
                active
                  ? "bg-accent text-white shadow"
                  : "text-muted hover:bg-surface-2 hover:text-text hover:shadow-sm",
              )}
            >
              <Icon name={n.icon} size={20} strokeWidth={2.1} />
              <span className="rail-tip">{n.label}</span>
            </Link>
          );
        })}

        {me && (
          <div className="group relative mt-auto flex h-[46px] w-[46px] flex-none items-center justify-center rounded-2xl bg-accent-weak text-[12.5px] font-extrabold text-accent shadow-inset">
            {initials(me.nama_lengkap)}
            <span className="rail-tip">
              {me.nama_lengkap} · {me.role === "admin" ? "Admin" : "Pekerja"}
            </span>
          </div>
        )}
      </nav>
    </aside>
  );
}
