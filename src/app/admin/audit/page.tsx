"use client";

import { useState } from "react";
import { useData } from "@/lib/client";
import { AdminHeader, Card, INPUT, SELECT, TD, TH } from "@/components/admin/ui";

interface Log { id: string; timestamp: string; actor_email: string; aksi: string; entitas: string; entitas_id: string; detail_json: string }

const ENTITAS = ["", "users", "overtime", "leaves", "trips", "period_locks", "companies", "master_options", "holidays", "documents", "settings"];

export default function AuditPage() {
  const [actor, setActor] = useState("");
  const [entitas, setEntitas] = useState("");
  const p = new URLSearchParams();
  if (actor) p.set("actor", actor);
  if (entitas) p.set("entitas", entitas);
  const { data, loading } = useData<{ items: Log[] }>(`/api/admin/audit?${p.toString()}`);
  const rows = data?.items ?? [];

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Log Audit" subtitle={`${rows.length} entri · semua mutasi tercatat`} />

      <div className="mt-5 flex flex-wrap gap-[10px]">
        <input className={`${INPUT} max-w-[260px]`} placeholder="Cari aktor (email)…" value={actor} onChange={(e) => setActor(e.target.value)} />
        <select className={SELECT} value={entitas} onChange={(e) => setEntitas(e.target.value)}>
          <option value="">Semua entitas</option>
          {ENTITAS.filter(Boolean).map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Waktu</th>
                <th className={TH}>Aktor</th>
                <th className={TH}>Aksi</th>
                <th className={TH}>Entitas</th>
                <th className={TH}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-border">
                  <td className={`${TD} font-mono text-[11.5px]`}>{l.timestamp.slice(0, 19).replace("T", " ")}</td>
                  <td className={TD}>{l.actor_email}</td>
                  <td className={TD}><span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-bold">{l.aksi}</span></td>
                  <td className={TD}>{l.entitas}</td>
                  <td className="px-4 py-3 text-[11.5px] text-faint max-w-[280px] truncate">{l.detail_json}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-6 text-center text-[13px] text-faint">Memuat…</div>}
        {!loading && rows.length === 0 && <div className="p-10 text-center text-[13px] text-faint">Belum ada entri audit.</div>}
      </Card>
    </div>
  );
}
