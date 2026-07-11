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
      { href: "/admin/dinas", label: "Rekap Dinas", icon: "globe" },
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
    <aside className="border-b border-border bg-surface wide:sticky wide:top-14 wide:flex wide:h-[calc(100vh-56px)] wide:w-[248px] wide:flex-none wide:flex-col wide:overflow-y-auto wide:border-b-0 wide:border-r wide:px-3 wide:py-4">
      <div className="flex gap-[6px] overflow-x-auto px-[14px] py-[10px] wide:flex-col wide:gap-4 wide:overflow-visible wide:p-0">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex gap-[6px] wide:flex-col wide:gap-1">
            <div className="hidden px-[10px] pt-1 text-[10.5px] font-bold uppercase tracking-[.6px] text-faint wide:block">
              {group.title}
            </div>
            {group.items.map((a) => {
              const active = pathname === a.href;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-[10px] px-[15px] py-[9px] text-[13px] font-bold wide:w-full wide:gap-[11px] wide:rounded-[11px] wide:px-3 wide:py-[9px] wide:text-left wide:text-[13px]",
                    active
                      ? "bg-accent text-white wide:bg-accent-weak wide:text-accent"
                      : "bg-surface-3 text-muted wide:bg-transparent wide:text-muted",
                  )}
                >
                  <Icon name={a.icon} size={17} />
                  <span className="flex-1">{a.label}</span>
                  {a.badge && pending > 0 && (
                    <span className="rounded-full bg-libur px-[7px] py-[1px] text-[10px] font-extrabold text-white">
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
