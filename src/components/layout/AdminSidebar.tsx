"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/shared/Icons";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/rekap", label: "Rekap Lembur", icon: "barChart" },
  { href: "/admin/pekerja", label: "Master Pekerja", icon: "usersMulti" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="border-b border-border bg-surface wide:sticky wide:top-14 wide:flex wide:h-[calc(100vh-56px)] wide:w-[244px] wide:flex-none wide:flex-col wide:border-b-0 wide:border-r wide:px-3 wide:py-4">
      <div className="hidden wide:block wide:px-3 wide:pb-[14px] wide:pt-1">
        <div className="px-[10px] py-2 text-[11px] font-bold uppercase tracking-[.6px] text-faint">
          Panel Admin
        </div>
      </div>

      <div className="flex gap-[6px] overflow-x-auto px-[14px] py-[10px] wide:flex-col wide:gap-1 wide:overflow-visible wide:p-0">
        {NAV.map((a) => {
          const active = pathname === a.href;
          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-[10px] px-[15px] py-[9px] text-[13px] font-bold wide:w-full wide:gap-[11px] wide:rounded-[11px] wide:px-3 wide:py-[10px] wide:text-left wide:text-[13.5px]",
                active
                  ? "bg-accent text-white wide:bg-accent-weak wide:text-accent"
                  : "bg-surface-3 text-muted wide:bg-transparent wide:text-muted",
              )}
            >
              <Icon name={a.icon} size={18} />
              <span>{a.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto hidden items-center gap-[10px] border-t border-border px-3 py-[14px] wide:flex">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-dinas-weak text-[13px] font-extrabold text-dinas">
          SA
        </div>
        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-bold">Siti Aminah</div>
          <div className="text-[10.5px] text-faint">Admin TAD</div>
        </div>
      </div>
    </aside>
  );
}
