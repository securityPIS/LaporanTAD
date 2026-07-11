"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon, type IconName } from "@/components/shared/Icons";

const MENU: { href: string; label: string; desc: string; icon: IconName; bg: string; fg: string }[] = [
  { href: "/dinas", label: "Dinas", desc: "Catatan perjalanan dinas", icon: "globe", bg: "var(--dinas-weak)", fg: "var(--dinas)" },
  { href: "/pekerja", label: "Data Pekerja", desc: "Direktori rekan kerja", icon: "usersMulti", bg: "var(--lembur-weak)", fg: "var(--lembur)" },
  { href: "/dokumen", label: "Dokumen", desc: "Unduh & buat surat resmi", icon: "doc", bg: "var(--accent-weak)", fg: "var(--accent)" },
  { href: "/profil", label: "Profil Saya", desc: "Data diri & tanda tangan", icon: "users", bg: "var(--cuti-weak)", fg: "var(--cuti)" },
];

export default function LainnyaPage() {
  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-[6px] pt-5">
        <div className="text-[22px] font-extrabold tracking-[-.4px]">Lainnya</div>
        <div className="mt-[2px] text-[12.5px] font-semibold text-faint">Menu tambahan</div>
      </div>

      <div className="flex flex-col gap-[10px] px-[18px] pb-24 pt-[12px]">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-[14px] py-[14px] shadow-sm">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl" style={{ background: m.bg, color: m.fg }}>
              <Icon name={m.icon} size={21} />
            </span>
            <div className="flex-1">
              <div className="text-[14px] font-extrabold">{m.label}</div>
              <div className="text-[11.5px] text-faint">{m.desc}</div>
            </div>
            <Icon name="chevronRight" size={18} className="text-faint" />
          </Link>
        ))}

        <button
          onClick={() => signOut({ redirectTo: "/login" })}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-[14px] text-[13.5px] font-bold text-libur"
        >
          <Icon name="close" size={16} /> Keluar
        </button>
      </div>
    </div>
  );
}
