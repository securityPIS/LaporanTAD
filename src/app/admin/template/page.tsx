"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card, INPUT, SELECT, TD, TH } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";
import { TemplateGuide } from "@/components/admin/TemplateGuide";

interface Tpl { id: string; nama: string; jenis: string; gdoc_id: string; keterangan: string; active: boolean }
const JENIS = [
  { key: "spkl", label: "SPKL (Lembur)" },
  { key: "spd", label: "SPD (Dinas)" },
  { key: "deklarasi_dinas", label: "Deklarasi Dinas" },
  { key: "surat_cuti", label: "Surat Cuti" },
];

export default function TemplatePage() {
  const { showToast } = useApp();
  const { data, reload } = useData<{ items: Tpl[] }>("/api/admin/templates");
  const [form, setForm] = useState({ nama: "", jenis: "spkl", gdoc_id: "" });

  async function add() {
    if (!form.nama.trim()) return showToast("Nama template wajib diisi", "err");
    try {
      await apiSend("/api/admin/templates", "POST", form);
      setForm({ nama: "", jenis: "spkl", gdoc_id: "" });
      showToast("Template ditambahkan");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }
  async function del(id: string) {
    if (!confirm("Hapus template ini?")) return;
    try {
      await apiSend(`/api/admin/templates/${id}`, "DELETE");
      showToast("Template dihapus");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Template Dokumen" subtitle="Google Docs ber-placeholder {{nama}}, {{nopek}}, {{ttd}}, …" />

      <TemplateGuide />

      <Card className="mt-5 p-4">
        <div className="grid grid-cols-1 gap-2 wide:grid-cols-3">
          <input className={INPUT} placeholder="Nama template" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <select className={SELECT} value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
            {JENIS.map((j) => <option key={j.key} value={j.key}>{j.label}</option>)}
          </select>
          <input className={INPUT} placeholder="ID Google Docs (opsional di dev)" value={form.gdoc_id} onChange={(e) => setForm({ ...form, gdoc_id: e.target.value })} />
        </div>
        <button onClick={add} className="mt-3 flex h-10 items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-extrabold text-white"><Icon name="plus" size={16} /> Tambah</button>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>Nama</th>
                <th className={TH}>Jenis</th>
                <th className={TH}>Google Docs ID</th>
                <th className={`${TH} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((t) => (
                <tr key={t.id} className="border-b border-border">
                  <td className="px-4 py-3 text-[13px] font-bold">{t.nama}</td>
                  <td className={TD}>{JENIS.find((j) => j.key === t.jenis)?.label ?? t.jenis}</td>
                  <td className={`${TD} font-mono text-[11px]`}>{t.gdoc_id || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(t.id)} aria-label="Hapus" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-libur ml-auto"><Icon name="trash" size={14} /></button>
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
