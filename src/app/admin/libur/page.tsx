"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card, INPUT, SELECT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { fmtTgl } from "@/lib/date";

interface Holiday { id: string; tanggal: string; nama: string; tahun: number; sumber: string }

export default function LiburPage() {
  const { showToast } = useApp();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, reload } = useData<{ items: Holiday[] }>(`/api/admin/holidays?year=${year}`);
  const [tanggal, setTanggal] = useState("");
  const [nama, setNama] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!tanggal || !nama.trim()) return showToast("Tanggal & nama wajib diisi", "err");
    try {
      await apiSend("/api/admin/holidays", "POST", { tanggal, nama });
      setTanggal(""); setNama("");
      showToast("Libur ditambahkan");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }
  async function sync() {
    setBusy(true);
    try {
      const res = await apiSend<{ synced: number }>("/api/admin/holidays", "POST", { sync: true, year });
      showToast(res.synced > 0 ? `${res.synced} libur disinkronkan` : "Sumber publik tidak dapat dijangkau");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }
  async function del(id: string) {
    try {
      await apiSend(`/api/admin/holidays/${id}`, "DELETE");
      showToast("Libur dihapus");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader
        title="Libur Nasional"
        subtitle={`${data?.items.length ?? 0} hari libur tahun ${year}`}
        action={
          <button onClick={sync} disabled={busy} className="flex h-10 items-center gap-2 rounded-[11px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-text disabled:opacity-50">
            <Icon name="download" size={16} /> {busy ? "Menyinkron…" : "Sinkron dari sumber publik"}
          </button>
        }
      />

      <Card className="mt-5 p-4">
        <div className="flex flex-wrap gap-2">
          <input type="date" className={SELECT} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          <input className={`${INPUT} flex-1`} placeholder="Nama libur" value={nama} onChange={(e) => setNama(e.target.value)} />
          <button onClick={add} className="flex h-[42px] items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-extrabold text-white"><Icon name="plus" size={16} /> Tambah</button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[12.5px] font-semibold text-muted">Tahun:</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={SELECT}>
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Tanggal</th>
                <th className={TH}>Nama</th>
                <th className={TH}>Sumber</th>
                <th className={`${TH} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((h) => (
                <tr key={h.id} className="border-b border-border">
                  <td className={`${TD} font-mono`}>{fmtTgl(h.tanggal)}</td>
                  <td className="px-4 py-3 text-[13px] font-bold">{h.nama}</td>
                  <td className={TD}><span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10.5px] font-bold">{h.sumber}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(h.id)} aria-label="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-libur ml-auto"><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
