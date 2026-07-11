"use client";

import { useState } from "react";
import { useData } from "@/lib/client";
import { AdminHeader, Card, SELECT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { BULANS, parseISO } from "@/lib/date";
import { fmtJamHHMM } from "@/lib/overtime-calc";
import { jenisMeta } from "@/lib/overtime-view";
import { todayWIB } from "@/lib/wib";
import type { OvertimeJenis } from "@/lib/db/tables";

interface Row {
  id: string; nama: string; nopek: string; perusahaan: string; lokasi: string;
  tanggal: string; jenis: OvertimeJenis; jam_mulai: string; jam_selesai: string; total_jam: number;
}

export default function RekapPage() {
  const [month, setMonth] = useState(todayWIB().slice(0, 7));
  const [jenis, setJenis] = useState<"semua" | OvertimeJenis>("semua");
  const [query, setQuery] = useState("");

  const params = new URLSearchParams();
  if (month) params.set("month", month);
  if (jenis !== "semua") params.set("jenis", jenis);
  const { data, loading } = useData<{ items: Row[] }>(`/api/admin/overtime?${params.toString()}`);

  const q = query.trim().toLowerCase();
  const rows = (data?.items ?? []).filter((r) => !q || r.nama.toLowerCase().includes(q) || r.nopek.toLowerCase().includes(q));
  const total = rows.reduce((a, r) => a + r.total_jam, 0);

  const exportUrl = (fmt: string) => {
    const p = new URLSearchParams({ type: "lembur", format: fmt });
    if (month) p.set("month", month);
    return `/api/admin/export?${p.toString()}`;
  };

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader
        title="Rekap Lembur"
        subtitle={`Seluruh pekerja · ${rows.length} catatan`}
        action={
          <div className="flex gap-2">
            <a href={exportUrl("xlsx")} className="flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text">
              <Icon name="download" size={16} /> XLSX
            </a>
            <a href={exportUrl("csv")} className="flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text">
              <Icon name="download" size={16} /> CSV
            </a>
          </div>
        }
      />

      <div className="mt-5 flex flex-wrap gap-[10px]">
        <div className="relative min-w-[200px] flex-1">
          <Icon name="search" size={16} className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau nopek…" className="h-[42px] w-full rounded-[11px] border border-border bg-surface pl-[38px] pr-[14px] text-[13.5px] text-text outline-none" />
        </div>
        <select value={jenis} onChange={(e) => setJenis(e.target.value as typeof jenis)} className={SELECT}>
          <option value="semua">Semua jenis</option>
          <option value="reguler">Reguler</option>
          <option value="libur_nasional">Libur Nasional</option>
          <option value="kjk">KJK</option>
          <option value="cuti">Lembur Cuti</option>
        </select>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={SELECT} />
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Pekerja</th>
                <th className={TH}>Perusahaan</th>
                <th className={TH}>Lokasi</th>
                <th className={TH}>Tanggal</th>
                <th className={TH}>Jenis</th>
                <th className={`${TH} text-center`}>Waktu</th>
                <th className={`${TH} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const m = jenisMeta(r.jenis);
                const dt = parseISO(r.tanggal);
                return (
                  <tr key={r.id} className="border-b border-border">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-[13px] font-bold">{r.nama}</div>
                      <div className="font-mono text-[11px] text-faint">{r.nopek}</div>
                    </td>
                    <td className={TD}>{r.perusahaan}</td>
                    <td className={TD}>{r.lokasi}</td>
                    <td className={TD}><span className="font-mono text-[12.5px]">{dt.getDate()} {BULANS[dt.getMonth()]}</span></td>
                    <td className={TD}><span className="rounded-md px-2 py-[3px] text-[10.5px] font-extrabold" style={{ background: m.w, color: m.c }}>{m.label}</span></td>
                    <td className={`${TD} text-center`}><span className="font-mono text-[12.5px] text-muted">{r.jam_mulai}–{r.jam_selesai}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right"><span className="font-mono text-[13.5px] font-bold">{fmtJamHHMM(r.total_jam)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-6 text-center text-[13px] text-faint">Memuat…</div>}
        {!loading && rows.length === 0 && <div className="p-10 text-center text-[13px] text-faint">Tidak ada catatan cocok filter.</div>}
        <div className="flex items-center justify-between border-t border-border bg-surface-2 px-[18px] py-3">
          <span className="text-xs font-semibold text-muted">Menampilkan {rows.length} catatan</span>
          <span className="text-[13px] font-extrabold">Total: <span className="font-mono text-accent">{fmtJamHHMM(total)} jam</span></span>
        </div>
      </Card>
    </div>
  );
}
