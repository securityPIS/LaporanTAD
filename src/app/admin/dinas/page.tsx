"use client";

import { useState } from "react";
import { useData } from "@/lib/client";
import { AdminHeader, Card, SELECT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { fmtRange } from "@/lib/date";
import { fmtRupiah } from "@/lib/rupiah";

interface Row {
  id: string; nama: string; nopek: string; lokasi: string; tujuan: string;
  tanggal_mulai: string; tanggal_selesai: string; keperluan: string; transportasi: string;
  phase_label: string; total_biaya: number;
}

export default function AdminDinasPage() {
  const [month, setMonth] = useState("");
  const { data, loading } = useData<{ items: Row[] }>(`/api/admin/trips${month ? `?month=${month}` : ""}`);
  const rows = data?.items ?? [];
  const exportUrl = (fmt: string) => `/api/admin/export?type=dinas&format=${fmt}${month ? `&month=${month}` : ""}`;

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader
        title="Rekap Dinas"
        subtitle={`${rows.length} catatan`}
        action={
          <div className="flex gap-2">
            <a href={exportUrl("xlsx")} className="flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text"><Icon name="download" size={16} /> XLSX</a>
            <a href={exportUrl("csv")} className="flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text"><Icon name="download" size={16} /> CSV</a>
          </div>
        }
      />
      <div className="mt-5 flex gap-[10px]">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={SELECT} />
        {month && <button onClick={() => setMonth("")} className="text-[12.5px] font-bold text-accent">Semua bulan</button>}
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Pekerja</th>
                <th className={TH}>Tujuan</th>
                <th className={TH}>Rentang</th>
                <th className={TH}>Keperluan</th>
                <th className={TH}>Status</th>
                <th className={TH}>Total Biaya</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3"><div className="text-[13px] font-bold">{r.nama}</div><div className="font-mono text-[11px] text-faint">{r.nopek}</div></td>
                  <td className={TD}>{r.tujuan}</td>
                  <td className={TD}>{fmtRange(r.tanggal_mulai, r.tanggal_selesai)}</td>
                  <td className={TD}>{r.keperluan}</td>
                  <td className={TD}>{r.phase_label}</td>
                  <td className={TD}>{r.total_biaya > 0 ? fmtRupiah(r.total_biaya) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-6 text-center text-[13px] text-faint">Memuat…</div>}
        {!loading && rows.length === 0 && <div className="p-10 text-center text-[13px] text-faint">Belum ada catatan dinas.</div>}
      </Card>
    </div>
  );
}
