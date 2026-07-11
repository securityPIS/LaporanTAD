"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/shared/Icons";
import { WORKERS } from "@/lib/mock-data";
import type { WorkerStatus } from "@/lib/types";

const TH = "whitespace-nowrap px-4 py-[13px] text-[11px] font-bold uppercase tracking-[.4px] text-muted";
const TD = "whitespace-nowrap px-4 py-3 text-[13px] text-muted";

const AV_PALETTES: [string, string][] = [
  ["var(--accent-weak)", "var(--accent)"],
  ["var(--lembur-weak)", "var(--lembur)"],
  ["var(--dinas-weak)", "var(--dinas)"],
  ["var(--cuti-weak)", "var(--cuti)"],
];

const ST_META: Record<WorkerStatus, { bg: string; fg: string; label: string }> = {
  active: { bg: "var(--lembur-weak)", fg: "var(--lembur)", label: "Aktif" },
  pending: { bg: "var(--cuti-weak)", fg: "var(--cuti)", label: "Menunggu" },
  inactive: { bg: "var(--surface-3)", fg: "var(--faint)", label: "Nonaktif" },
};

export default function MasterPekerjaPage() {
  const { showToast } = useApp();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKERS.filter(
      (w) => q === "" || w.nama.toLowerCase().includes(q) || w.nopek.toLowerCase().includes(q),
    ).map((w, i) => ({
      ...w,
      ini: w.nama.split(" ").slice(0, 2).map((x) => x[0]).join(""),
      pal: AV_PALETTES[i % AV_PALETTES.length],
      st: ST_META[w.status],
    }));
  }, [query]);

  return (
    <div className="animate-ltFade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold tracking-[-.5px]">Master Data Pekerja</div>
          <div className="mt-[3px] text-[13px] font-semibold text-faint">{rows.length} pekerja terdaftar</div>
        </div>
        <button
          onClick={() => showToast("Form tambah pekerja dibuka")}
          className="flex h-10 items-center gap-2 rounded-[11px] border-none bg-accent px-4 text-[13px] font-bold text-white"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
          Tambah pekerja
        </button>
      </div>

      <div className="relative mt-5 max-w-[340px]">
        <Icon name="search" size={16} className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau nopek…"
          className="h-[42px] w-full rounded-[11px] border border-border bg-surface pl-[38px] pr-[14px] text-[13.5px] text-text outline-none"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={`${TH} text-left`}>Nama</th>
                <th className={`${TH} text-left`}>Perusahaan</th>
                <th className={`${TH} text-left`}>Lokasi</th>
                <th className={`${TH} text-left`}>Divisi / Bagian</th>
                <th className={`${TH} text-left`}>Pola</th>
                <th className={`${TH} text-left`}>Status</th>
                <th className={`${TH} text-right`} />
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.nopek} className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-[11px]">
                      <div
                        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] text-[12.5px] font-extrabold"
                        style={{ background: w.pal[0], color: w.pal[1] }}
                      >
                        {w.ini}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold">{w.nama}</div>
                        <div className="font-mono text-[11px] text-faint">{w.nopek}</div>
                      </div>
                    </div>
                  </td>
                  <td className={TD}>{w.perusahaan}</td>
                  <td className={TD}>{w.lokasi}</td>
                  <td className={TD}>{w.divisi}</td>
                  <td className={TD}>
                    <span className="text-[11px] font-bold text-muted">{w.pola}</span>
                  </td>
                  <td className={TD}>
                    <span
                      className="rounded-[20px] px-[9px] py-[3px] text-[10.5px] font-extrabold"
                      style={{ background: w.st.bg, color: w.st.fg }}
                    >
                      {w.st.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => showToast("Edit data pekerja")}
                      aria-label="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface-2 text-muted"
                    >
                      <Icon name="edit" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
