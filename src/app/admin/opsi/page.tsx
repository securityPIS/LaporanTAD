"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card, INPUT, SELECT } from "@/components/admin/ui";
import { Icon } from "@/components/shared/Icons";

interface Opt { id: string; kategori: string; nilai: string; urutan: number; active: boolean }
const KATEGORI = [
  { key: "lokasi", label: "Lokasi Kerja" },
  { key: "divisi", label: "Divisi" },
  { key: "bagian", label: "Bagian" },
  { key: "shift", label: "Nama Shift" },
  { key: "hubungan_darurat", label: "Hubungan Darurat" },
  { key: "kategori_dokumen", label: "Kategori Dokumen" },
];

export default function OpsiPage() {
  const { showToast } = useApp();
  const [kategori, setKategori] = useState("lokasi");
  const { data, reload } = useData<{ items: Opt[] }>(`/api/admin/options?kategori=${kategori}`);
  const [nilai, setNilai] = useState("");

  async function add() {
    if (!nilai.trim()) return;
    try {
      await apiSend("/api/admin/options", "POST", { kategori, nilai, urutan: (data?.items.length ?? 0) + 1 });
      setNilai("");
      showToast("Opsi ditambahkan");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }
  async function del(id: string) {
    try {
      await apiSend(`/api/admin/options/${id}`, "DELETE");
      showToast("Opsi dihapus");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Master Opsi" subtitle="Kelola pilihan lokasi, divisi, bagian, shift, dll." />

      <div className="mt-5 flex flex-wrap gap-2">
        {KATEGORI.map((k) => (
          <button
            key={k.key}
            onClick={() => setKategori(k.key)}
            className="rounded-[10px] px-3 py-2 text-[12.5px] font-bold"
            style={{ background: kategori === k.key ? "var(--accent)" : "var(--surface-3)", color: kategori === k.key ? "#fff" : "var(--muted)" }}
          >
            {k.label}
          </button>
        ))}
      </div>

      <Card className="mt-4 p-4">
        <div className="flex gap-2">
          <input className={INPUT} placeholder="Nilai baru" value={nilai} onChange={(e) => setNilai(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add} className="flex h-[42px] items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-extrabold text-white"><Icon name="plus" size={16} /> Tambah</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(data?.items ?? []).map((o) => (
            <span key={o.id} className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold">
              {o.nilai}
              <button onClick={() => del(o.id)} aria-label="Hapus" className="text-faint hover:text-libur"><Icon name="close" size={13} /></button>
            </span>
          ))}
          {(data?.items ?? []).length === 0 && <span className="text-[12.5px] text-faint">Belum ada opsi.</span>}
        </div>
      </Card>
    </div>
  );
}
