"use client";

import { useState } from "react";
import { useData } from "@/lib/client";
import { AdminHeader, Card, SELECT } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { todayWIB } from "@/lib/wib";

interface Company { id: string; nama: string }

export default function EksporPage() {
  const companies = useData<{ items: Company[] }>("/api/admin/companies");
  const [type, setType] = useState("lembur");
  const [month, setMonth] = useState(todayWIB().slice(0, 7));
  const [company, setCompany] = useState("");

  function url(format: string) {
    const p = new URLSearchParams({ type, format });
    if (month) p.set("month", month);
    if (company) p.set("company", company);
    return `/api/admin/export?${p.toString()}`;
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Ekspor Rekap" subtitle="Unduh rekap lembur / cuti / dinas per bulan (XLSX atau CSV)." />

      <Card className="mt-5 max-w-[560px] p-5">
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-[6px] block text-xs font-bold text-muted">Jenis rekap</label>
            <div className="flex gap-2">
              {["lembur", "cuti", "dinas"].map((t) => (
                <button key={t} onClick={() => setType(t)} className="flex-1 rounded-[11px] border px-3 py-2.5 text-[13px] font-bold capitalize" style={{ borderColor: type === t ? "var(--accent)" : "var(--border)", background: type === t ? "var(--accent)" : "var(--surface)", color: type === t ? "#fff" : "var(--muted)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-[6px] block text-xs font-bold text-muted">Bulan</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={`${SELECT} w-full`} />
          </div>
          <div>
            <label className="mb-[6px] block text-xs font-bold text-muted">Perusahaan (opsional)</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className={`${SELECT} w-full`}>
              <option value="">Semua perusahaan</option>
              {(companies.data?.items ?? []).map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>
          <div className="mt-2 flex gap-2">
            <a href={url("xlsx")} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[11px] bg-accent text-[13.5px] font-extrabold text-white"><Icon name="download" size={17} /> Unduh XLSX</a>
            <a href={url("csv")} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[11px] border border-border-strong bg-surface text-[13.5px] font-bold text-text"><Icon name="download" size={17} /> Unduh CSV</a>
          </div>
        </div>
      </Card>
    </div>
  );
}
