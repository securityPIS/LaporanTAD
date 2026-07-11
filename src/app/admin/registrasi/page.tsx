"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { AdminHeader, Card } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/EmptyState";
import { waLink } from "@/lib/phone";
import { Icon } from "@/components/shared/Icons";
import type { UserRow } from "@/lib/db/tables";

export default function RegistrasiPage() {
  const { showToast } = useApp();
  const { data, loading, reload } = useData<{ items: UserRow[] }>("/api/admin/registrations");
  const [busy, setBusy] = useState<string | null>(null);
  const items = data?.items ?? [];

  async function approve(id: string) {
    setBusy(id);
    try {
      await apiSend(`/api/admin/registrations/${id}/approve`, "POST");
      showToast("Pendaftar disetujui");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  }
  async function reject(id: string) {
    const alasan = prompt("Alasan penolakan (wajib):");
    if (!alasan) return;
    setBusy(id);
    try {
      await apiSend(`/api/admin/registrations/${id}/reject`, "POST", { alasan });
      showToast("Pendaftar ditolak");
      reload();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ animation: "ltFade .3s ease both" }}>
      <AdminHeader title="Verifikasi Pendaftar" subtitle={`${items.length} menunggu persetujuan`} />

      <div className="mt-5 flex flex-col gap-3">
        {!loading && items.length === 0 && <EmptyState icon="users" title="Tidak ada pendaftar" hint="Semua registrasi telah diproses." />}
        {items.map((u) => (
          <Card key={u.id} className="p-[16px_18px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-extrabold">{u.nama_lengkap}</div>
                <div className="mt-[2px] font-mono text-[12px] text-faint">{u.email} · {u.nopek}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(u.id)} disabled={busy === u.id} className="h-9 rounded-[9px] bg-lembur px-4 text-[13px] font-bold text-white disabled:opacity-50">
                  Setujui
                </button>
                <button onClick={() => reject(u.id)} disabled={busy === u.id} className="h-9 rounded-[9px] border border-border-strong bg-surface px-4 text-[13px] font-bold text-muted disabled:opacity-50">
                  Tolak
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px] wide:grid-cols-3">
              <Detail label="Lokasi" value={u.lokasi_kerja} />
              <Detail label="Divisi / Bagian" value={`${u.divisi} / ${u.bagian}`} />
              <Detail label="Pola kerja" value={u.tipe_kerja === "shift" ? `Shift ${u.nama_shift}` : "Non-shift"} />
              <Detail label="Telepon" value={<a href={waLink(u.no_telp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-lembur"><Icon name="whatsapp" size={13} /> {u.no_telp}</a>} />
              <Detail label="Kontak darurat" value={`${u.darurat_hubungan} · ${u.darurat_telp}`} />
              <Detail label="Alamat darurat" value={u.darurat_alamat} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-[.4px] text-faint">{label}</div>
      <div className="text-[12.5px] font-semibold text-text">{value}</div>
    </div>
  );
}
