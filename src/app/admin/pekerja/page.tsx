"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card, SELECT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import type { UserRow } from "@/lib/db/tables";

const STATUS_COLOR: Record<string, [string, string]> = {
  active: ["var(--lembur-weak)", "var(--lembur)"],
  pending: ["var(--cuti-weak)", "var(--cuti)"],
  inactive: ["var(--surface-3)", "var(--faint)"],
  rejected: ["var(--libur-weak)", "var(--libur)"],
};

export default function AdminPekerjaPage() {
  const { showToast } = useApp();
  const { data, loading, reload } = useData<{ items: UserRow[] }>("/api/admin/users");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("semua");

  async function patch(id: string, body: Record<string, unknown>, msg: string) {
    try {
      await apiSend(`/api/admin/users/${id}`, "PATCH", body);
      showToast(msg);
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  const rows = (data?.items ?? []).filter((u) => {
    const mq = !q || u.nama_lengkap.toLowerCase().includes(q.toLowerCase()) || u.nopek.toLowerCase().includes(q.toLowerCase());
    const ms = status === "semua" || u.status === status;
    return mq && ms;
  });

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Master Pekerja" subtitle={`${rows.length} pekerja`} />

      <div className="mt-5 flex flex-wrap gap-[10px]">
        <div className="relative min-w-[200px] flex-1">
          <Icon name="search" size={16} className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau nopek…" className="h-[42px] w-full rounded-[11px] border border-border bg-surface pl-[38px] pr-[14px] text-[13.5px] text-text outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={SELECT}>
          <option value="semua">Semua status</option>
          <option value="active">Aktif</option>
          <option value="pending">Pending</option>
          <option value="inactive">Nonaktif</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Pekerja</th>
                <th className={TH}>Lokasi / Bagian</th>
                <th className={TH}>Pola</th>
                <th className={TH}>Role</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-[13px] font-bold">{u.nama_lengkap}</div>
                    <div className="font-mono text-[11px] text-faint">{u.nopek}</div>
                  </td>
                  <td className={TD}>{u.lokasi_kerja}<div className="text-[11px] text-faint">{u.divisi}/{u.bagian}</div></td>
                  <td className={TD}>{u.tipe_kerja === "shift" ? `Shift ${u.nama_shift}` : "Non-shift"}</td>
                  <td className={TD}>
                    <select value={u.role} onChange={(e) => patch(u.id, { role: e.target.value }, "Role diperbarui")} className="rounded-md border border-border bg-surface px-2 py-1 text-[12px] font-semibold">
                      <option value="pekerja">Pekerja</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className={TD}>
                    <span className="rounded-md px-2 py-[3px] text-[10.5px] font-extrabold" style={{ background: STATUS_COLOR[u.status]?.[0], color: STATUS_COLOR[u.status]?.[1] }}>
                      {u.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          const k = prompt("Kuota cuti tahun ini (hari):");
                          if (k != null && k !== "") patch(u.id, { kuota_cuti: Number(k) }, "Kuota diperbarui");
                        }}
                        className="rounded-[9px] border border-border bg-surface-2 px-2.5 py-1.5 text-[11.5px] font-bold text-muted"
                      >
                        Kuota
                      </button>
                      {u.status === "active" ? (
                        <button onClick={() => patch(u.id, { status: "inactive" }, "Dinonaktifkan")} className="rounded-[9px] border border-border bg-surface-2 px-2.5 py-1.5 text-[11.5px] font-bold text-libur">Nonaktifkan</button>
                      ) : (
                        <button onClick={() => patch(u.id, { status: "active" }, "Diaktifkan")} className="rounded-[9px] border border-border bg-surface-2 px-2.5 py-1.5 text-[11.5px] font-bold text-lembur">Aktifkan</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-6 text-center text-[13px] text-faint">Memuat…</div>}
        {!loading && rows.length === 0 && <div className="p-10 text-center text-[13px] text-faint">Tidak ada pekerja cocok filter.</div>}
      </Card>
    </div>
  );
}
