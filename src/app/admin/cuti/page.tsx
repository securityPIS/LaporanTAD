"use client";

import { useState } from "react";
import { useData } from "@/lib/client";
import { AdminHeader, Card, SELECT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { fmtRange } from "@/lib/date";
import { todayWIB } from "@/lib/wib";

interface Row {
  id: string; nama: string; nopek: string; jenis: string; tanggal_mulai: string; tanggal_selesai: string;
  jumlah_hari: number; sisa_saldo: number; keterangan: string;
}

export default function AdminCutiPage() {
  const [month, setMonth] = useState("");
  const { data, loading } = useData<{ items: Row[] }>(`/api/admin/leaves${month ? `?month=${month}` : ""}`);
  const rows = data?.items ?? [];
  const exportUrl = (fmt: string) => `/api/admin/export?type=cuti&format=${fmt}${month ? `&month=${month}` : ""}`;

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader
        title="Rekap Cuti"
        subtitle={`${rows.length} catatan · sisa saldo per pekerja`}
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
                <th className={TH}>Jenis</th>
                <th className={TH}>Rentang</th>
                <th className={`${TH} text-center`}>Hari</th>
                <th className={`${TH} text-center`}>Sisa Saldo</th>
                <th className={TH}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3"><div className="text-[13px] font-bold">{r.nama}</div><div className="font-mono text-[11px] text-faint">{r.nopek}</div></td>
                  <td className={TD}>{r.jenis}</td>
                  <td className={TD}>{fmtRange(r.tanggal_mulai, r.tanggal_selesai)}</td>
                  <td className={`${TD} text-center font-mono`}>{r.jumlah_hari}</td>
                  <td className={`${TD} text-center font-mono font-bold text-accent`}>{r.sisa_saldo}</td>
                  <td className={TD}>{r.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-6 text-center text-[13px] text-faint">Memuat…</div>}
        {!loading && rows.length === 0 && <div className="p-10 text-center text-[13px] text-faint">Belum ada catatan cuti.</div>}
      </Card>
    </div>
  );
}
