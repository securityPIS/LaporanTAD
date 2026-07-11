"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card, INPUT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";

interface Company { id: string; nama: string; pic_nama: string; pic_telp: string; alamat: string; active: boolean }

export default function PerusahaanPage() {
  const { showToast } = useApp();
  const { data, reload } = useData<{ items: Company[] }>("/api/admin/companies");
  const [form, setForm] = useState({ nama: "", pic_nama: "", pic_telp: "", alamat: "" });

  async function add() {
    if (!form.nama.trim()) return showToast("Nama perusahaan wajib diisi", "err");
    try {
      await apiSend("/api/admin/companies", "POST", form);
      setForm({ nama: "", pic_nama: "", pic_telp: "", alamat: "" });
      showToast("Perusahaan ditambahkan");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }
  async function del(id: string) {
    if (!confirm("Hapus perusahaan ini?")) return;
    try {
      await apiSend(`/api/admin/companies/${id}`, "DELETE");
      showToast("Perusahaan dihapus");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Master Perusahaan" subtitle={`${data?.items.length ?? 0} perusahaan`} />

      <Card className="mt-5 p-4">
        <div className="grid grid-cols-1 gap-2 wide:grid-cols-4">
          <input className={INPUT} placeholder="Nama perusahaan" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <input className={INPUT} placeholder="Nama PIC" value={form.pic_nama} onChange={(e) => setForm({ ...form, pic_nama: e.target.value })} />
          <input className={INPUT} placeholder="Telp PIC" value={form.pic_telp} onChange={(e) => setForm({ ...form, pic_telp: e.target.value })} />
          <input className={INPUT} placeholder="Alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
        </div>
        <button onClick={add} className="mt-3 flex h-10 items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-extrabold text-white">
          <Icon name="plus" size={16} /> Tambah
        </button>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Nama</th>
                <th className={TH}>PIC</th>
                <th className={TH}>Kontak</th>
                <th className={`${TH} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="px-4 py-3 text-[13px] font-bold">{c.nama}</td>
                  <td className={TD}>{c.pic_nama || "—"}</td>
                  <td className={TD}>{c.pic_telp || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(c.id)} aria-label="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-libur ml-auto"><Icon name="trash" size={14} /></button>
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
