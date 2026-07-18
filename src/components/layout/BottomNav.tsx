"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/shared/Icons";

const TABS: { key: string; label: string; icon: IconName }[] = [
  { key: "beranda", label: "Beranda", icon: "home" },
  { key: "lembur", label: "Lembur", icon: "clock" },
  { key: "cuti", label: "Cuti", icon: "calendar" },
  { key: "kalender", label: "Kalender", icon: "calendarDots" },
  { key: "lainnya", label: "Lainnya", icon: "dashboard" },
];

const LAINNYA = ["/lainnya", "/dinas", "/pekerja", "/dokumen", "/profil"];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="z-10 mx-3 mb-3 flex h-[64px] flex-none items-stretch gap-1 rounded-3xl bg-surface px-[6px] shadow-lg">
      {TABS.map((t) => {
        const active = t.key === "lainnya" ? LAINNYA.includes(pathname) : pathname === `/${t.key}`;
        return (
          <Link
            key={t.key}
            href={`/${t.key}`}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-[3px] rounded-2xl transition-all",
              active ? "bg-accent text-white shadow-sm" : "text-faint",
            )}
          >
            <Icon name={t.icon} size={20} strokeWidth={2.1} />
            <span className="text-[10px] font-bold">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
