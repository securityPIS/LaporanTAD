"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/client";
import { Icon, type IconName } from "@/components/shared/Icons";

interface Item { href: string; label: string; icon: IconName; badge?: boolean }
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Transaksi",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/rekap", label: "Rekap Lembur", icon: "barChart" },
      { href: "/admin/cuti", label: "Rekap Cuti", icon: "calendar" },
      { href: "/admin/dinas", label: "Rekap Dinas", icon: "plane" },
    ],
  },
  {
    title: "Master Data",
    items: [
      { href: "/admin/registrasi", label: "Verifikasi", icon: "users", badge: true },
      { href: "/admin/pekerja", label: "Master Pekerja", icon: "usersMulti" },
      { href: "/admin/perusahaan", label: "Perusahaan", icon: "badge" },
      { href: "/admin/opsi", label: "Master Opsi", icon: "filter" },
      { href: "/admin/libur", label: "Libur Nasional", icon: "calendarDots" },
      { href: "/admin/template", label: "Template Dokumen", icon: "doc" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { href: "/admin/kunci-periode", label: "Kunci Periode", icon: "lock" },
      { href: "/admin/ekspor", label: "Ekspor", icon: "download" },
      { href: "/admin/audit", label: "Log Audit", icon: "search" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data } = useData<{ pending: number }>("/api/admin/dashboard");
  const pending = data?.pending ?? 0;

  return (
    <aside className="bg-bg px-[clamp(10px,3vw,22px)] pb-1 pt-2 wide:sticky wide:top-[76px] wide:z-30 wide:flex wide:h-[calc(100vh-76px)] wide:flex-none wide:flex-col wide:items-center wide:px-0 wide:pb-4 wide:pl-[clamp(10px,3vw,22px)] wide:pr-1 wide:pt-0">
      <div className="flex gap-[7px] overflow-x-auto rounded-2xl bg-surface p-[8px] shadow wide:h-full wide:w-[68px] wide:flex-col wide:gap-[5px] wide:overflow-visible wide:rounded-3xl wide:px-[10px] wide:py-4 wide:shadow-lg">
        {GROUPS.map((group, gi) => (
          <div key={group.title} className="flex gap-[7px] wide:contents">
            {gi > 0 && (
              <div className="hidden wide:my-[6px] wide:block wide:h-px wide:w-8 wide:self-center wide:bg-border-strong" />
            )}
            {group.items.map((a) => {
              const active = pathname === a.href;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  aria-label={a.label}
                  className={cn(
                    "group relative flex items-center gap-2 whitespace-nowrap rounded-2xl px-[15px] py-[9px] text-[13px] font-bold transition-all wide:h-[44px] wide:w-[44px] wide:flex-none wide:justify-center wide:gap-0 wide:px-0 wide:py-0",
                    active
                      ? "bg-accent text-white shadow"
                      : "bg-surface-2 text-muted shadow-inset hover:text-text wide:bg-transparent wide:shadow-none wide:hover:bg-surface-2 wide:hover:shadow-sm",
                  )}
                >
                  <Icon name={a.icon} size={18} strokeWidth={2.1} />
                  <span className="wide:hidden">{a.label}</span>
                  <span className="hidden rail-tip wide:block">{a.label}</span>
                  {a.badge && pending > 0 && (
                    <span className="ml-auto rounded-full bg-libur px-[7px] py-[1px] text-[10px] font-extrabold text-white wide:absolute wide:right-[2px] wide:top-[2px] wide:ml-0 wide:px-[5px] wide:py-0 wide:leading-[15px] wide:shadow-sm">
                      {pending}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
