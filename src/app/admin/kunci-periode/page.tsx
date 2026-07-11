"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card, SELECT } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { BULAN } from "@/lib/date";
import { todayWIB } from "@/lib/wib";

interface Lock { id: string; periode: string; locked_by: string; locked_at: string }

function labelPeriode(p: string) {
  const [y, m] = p.split("-");
  return `${BULAN[Number(m) - 1]} ${y}`;
}

export default function KunciPeriodePage() {
  const { showToast } = useApp();
  const { data, reload } = useData<{ items: Lock[] }>("/api/admin/locks");
  const [periode, setPeriode] = useState(todayWIB().slice(0, 7));

  async function lock() {
    try {
      await apiSend("/api/admin/locks", "POST", { periode });
      showToast(`Periode ${labelPeriode(periode)} dikunci`);
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }
  async function unlock(p: string) {
    if (!confirm(`Buka kunci periode ${labelPeriode(p)}?`)) return;
    try {
      await apiSend(`/api/admin/locks?periode=${p}`, "DELETE");
      showToast("Kunci dibuka");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Kunci Periode" subtitle="Bulan terkunci menolak semua tambah/ubah/hapus catatan bertanggal pada bulan itu." />

      <Card className="mt-5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className={SELECT} />
          <button onClick={lock} className="flex h-[42px] items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-extrabold text-white">
            <Icon name="lock" size={16} /> Kunci Periode
          </button>
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-2">
        {(data?.items ?? []).length === 0 && <div className="rounded-2xl border border-border bg-surface p-8 text-center text-[13px] text-faint">Belum ada periode terkunci.</div>}
        {(data?.items ?? []).sort((a, b) => (a.periode < b.periode ? 1 : -1)).map((l) => (
          <Card key={l.id} className="flex items-center gap-3 p-[14px_18px]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-libur-weak text-libur"><Icon name="lock" size={18} /></span>
            <div className="flex-1">
              <div className="text-[14px] font-extrabold">{labelPeriode(l.periode)}</div>
              <div className="text-[11.5px] text-faint">dikunci oleh {l.locked_by}</div>
            </div>
            <button onClick={() => unlock(l.periode)} className="flex h-9 items-center gap-2 rounded-[10px] border border-border-strong bg-surface px-3 text-[12.5px] font-bold text-muted">
              <Icon name="unlock" size={15} /> Buka
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
