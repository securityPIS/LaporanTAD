"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/shared/Icons";
import { BULANS, parseISO } from "@/lib/date";
import { calc, fmtJam, jenisMeta } from "@/lib/overtime";
import { ADMIN_OVERTIME } from "@/lib/mock-data";
import type { OvertimeJenis } from "@/lib/types";

const TH = "whitespace-nowrap px-4 py-[13px] text-[11px] font-bold uppercase tracking-[.4px] text-muted";
const TD = "whitespace-nowrap px-4 py-3 text-[13px] text-muted";

export default function RekapPage() {
  const { showToast } = useApp();
  const [query, setQuery] = useState("");
  const [jenis, setJenis] = useState<"semua" | OvertimeJenis>("semua");

  const { rows, total } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = ADMIN_OVERTIME.filter(
      (r) =>
        (jenis === "semua" || r.jenis === jenis) &&
        (q === "" || r.nama.toLowerCase().includes(q) || r.nopek.toLowerCase().includes(q)),
    );
    let tot = 0;
    const mapped = filtered.map((r, i) => {
      const t = calc(r.mulai, r.selesai);
      tot += t;
      const m = jenisMeta(r.jenis);
      const dt = parseISO(r.tanggal);
      return {
        key: `${r.nopek}-${r.tanggal}-${i}`,
        nama: r.nama,
        nopek: r.nopek,
        perusahaan: r.perusahaan,
        lokasi: r.lokasi,
        tanggal: `${dt.getDate()} ${BULANS[dt.getMonth()]}`,
        jenisLabel: m.label,
        jc: m.c,
        jw: m.w,
        waktu: `${r.mulai}–${r.selesai}`,
        total: fmtJam(t),
      };
    });
    return { rows: mapped, total: fmtJam(tot) };
  }, [query, jenis]);

  const selectCls =
    "h-[42px] cursor-pointer rounded-[11px] border border-border bg-surface px-[14px] text-[13.5px] font-semibold text-text outline-none";

  return (
    <div className="animate-ltFade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold tracking-[-.5px]">Rekap Lembur</div>
          <div className="mt-[3px] text-[13px] font-semibold text-faint">
            Seluruh pekerja · {rows.length} catatan
          </div>
        </div>
        <button
          onClick={() => showToast("Rekap XLSX diekspor")}
          className="flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text"
        >
          <Icon name="download" size={16} />
          Ekspor XLSX
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-[10px]">
        <div className="relative min-w-[200px] flex-1">
          <Icon
            name="search"
            size={16}
            className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau nopek…"
            className="h-[42px] w-full rounded-[11px] border border-border bg-surface pl-[38px] pr-[14px] text-[13.5px] text-text outline-none"
          />
        </div>
        <select value={jenis} onChange={(e) => setJenis(e.target.value as typeof jenis)} className={selectCls}>
          <option value="semua">Semua jenis</option>
          <option value="reguler">Reguler</option>
          <option value="libur_nasional">Libur Nasional</option>
          <option value="kjk">KJK</option>
          <option value="cuti">Lembur Cuti</option>
        </select>
        <select className={selectCls} defaultValue="Juli 2026">
          <option>Juli 2026</option>
          <option>Juni 2026</option>
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={`${TH} text-left`}>Pekerja</th>
                <th className={`${TH} text-left`}>Perusahaan</th>
                <th className={`${TH} text-left`}>Lokasi</th>
                <th className={`${TH} text-left`}>Tanggal</th>
                <th className={`${TH} text-left`}>Jenis</th>
                <th className={`${TH} text-center`}>Waktu</th>
                <th className={`${TH} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-[13px] font-bold">{r.nama}</div>
                    <div className="font-mono text-[11px] text-faint">{r.nopek}</div>
                  </td>
                  <td className={TD}>{r.perusahaan}</td>
                  <td className={TD}>{r.lokasi}</td>
                  <td className={TD}>
                    <span className="font-mono text-[12.5px]">{r.tanggal}</span>
                  </td>
                  <td className={TD}>
                    <span
                      className="rounded-md px-2 py-[3px] text-[10.5px] font-extrabold"
                      style={{ background: r.jw, color: r.jc }}
                    >
                      {r.jenisLabel}
                    </span>
                  </td>
                  <td className={`${TD} text-center`}>
                    <span className="font-mono text-[12.5px] text-muted">{r.waktu}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span className="font-mono text-[13.5px] font-bold">{r.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="p-10 text-center text-[13px] text-faint">
            Tidak ada catatan yang cocok dengan filter.
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border bg-surface-2 px-[18px] py-3">
          <span className="text-xs font-semibold text-muted">Menampilkan {rows.length} catatan</span>
          <span className="text-[13px] font-extrabold">
            Total: <span className="font-mono text-accent">{total} jam</span>
          </span>
        </div>
      </div>
    </div>
  );
}
