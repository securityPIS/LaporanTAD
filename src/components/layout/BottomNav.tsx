"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="z-10 flex h-[66px] flex-none items-stretch border-t border-border bg-surface px-1">
      {TABS.map((t) => {
        const active = t.key === "lainnya" ? LAINNYA.includes(pathname) : pathname === `/${t.key}`;
        return (
          <Link
            key={t.key}
            href={`/${t.key}`}
            className="flex flex-1 flex-col items-center justify-center gap-1 pt-1"
            style={{ color: active ? "var(--accent)" : "var(--faint)" }}
          >
            <Icon name={t.icon} size={21} />
            <span className="text-[10px] font-bold">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
