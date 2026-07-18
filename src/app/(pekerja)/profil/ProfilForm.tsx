"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { apiSend } from "@/lib/client";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { SignaturePad } from "@/components/forms/SignaturePad";
import { INP, LBL } from "@/components/ui/Sheet";
import type { UserRow } from "@/lib/db/tables";

export function ProfilForm({ user, hubungan, shift }: { user: UserRow; hubungan: string[]; shift: string[] }) {
  const router = useRouter();
  const { showToast, setMe } = useApp();
  const [form, setForm] = useState({
    nama_lengkap: user.nama_lengkap,
    no_telp: user.no_telp,
    divisi: user.divisi,
    bagian: user.bagian,
    nama_shift: user.nama_shift,
    darurat_alamat: user.darurat_alamat,
    darurat_telp: user.darurat_telp,
    darurat_hubungan: user.darurat_hubungan,
  });
  const [busy, setBusy] = useState(false);
  const [ttdData, setTtdData] = useState<string | null>(null);
  const [hasTtdStored, setHasTtdStored] = useState(Boolean(user.ttd_file_id));

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true);
    try {
      const res = await apiSend<{ user: UserRow }>("/api/me", "PATCH", form);
      setMe(res.user);
      showToast("Profil diperbarui");
      router.refresh();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function saveTtd() {
    if (!ttdData) return showToast("Gambar tanda tangan dulu", "err");
    try {
      await apiSend("/api/me/ttd", "PUT", { data_url: ttdData });
      setHasTtdStored(true);
      showToast("Tanda tangan tersimpan");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  async function deleteTtd() {
    try {
      await apiSend("/api/me/ttd", "DELETE");
      setHasTtdStored(false);
      showToast("Tanda tangan dihapus");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-[6px] pt-5">
        <div className="text-[22px] font-extrabold tracking-[-.4px]">Profil Saya</div>
        <div className="mt-[2px] text-[12.5px] font-semibold text-faint">{user.email} · {user.nopek}</div>
      </div>

      <div className="flex flex-col gap-3 px-[18px] pb-28 pt-[14px]">
        <Field label="Nama lengkap"><input className={INP} value={form.nama_lengkap} onChange={(e) => set("nama_lengkap", e.target.value)} /></Field>
        <Field label="No. telepon"><input className={INP} value={form.no_telp} onChange={(e) => set("no_telp", e.target.value)} /></Field>
        <div className="flex gap-3">
          <Field label="Divisi" className="flex-1"><input className={INP} value={form.divisi} onChange={(e) => set("divisi", e.target.value)} /></Field>
          <Field label="Bagian" className="flex-1"><input className={INP} value={form.bagian} onChange={(e) => set("bagian", e.target.value)} /></Field>
        </div>
        {user.tipe_kerja === "shift" && (
          <Field label="Nama shift">
            <select className={INP} value={form.nama_shift} onChange={(e) => set("nama_shift", e.target.value)}>
              {shift.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}

        <div className="mt-2 text-xs font-bold uppercase tracking-[.5px] text-muted">Kontak Darurat</div>
        <Field label="Alamat lengkap">
          <textarea className="min-h-[64px] w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none" value={form.darurat_alamat} onChange={(e) => set("darurat_alamat", e.target.value)} />
        </Field>
        <div className="flex gap-3">
          <Field label="No. telepon kerabat" className="flex-1"><input className={INP} value={form.darurat_telp} onChange={(e) => set("darurat_telp", e.target.value)} /></Field>
          <Field label="Hubungan" className="flex-1">
            <select className={INP} value={form.darurat_hubungan} onChange={(e) => set("darurat_hubungan", e.target.value)}>
              {hubungan.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </Field>
        </div>

        <button onClick={save} disabled={busy} className="mt-2 h-12 rounded-xl bg-accent text-sm font-extrabold text-white disabled:opacity-50">
          {busy ? "Menyimpan…" : "Simpan Perubahan"}
        </button>

        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="text-[13.5px] font-extrabold">Tanda Tangan Tersimpan</div>
            <span className="rounded-md px-2 py-0.5 text-[10.5px] font-bold" style={{ background: hasTtdStored ? "var(--lembur-weak)" : "var(--surface-3)", color: hasTtdStored ? "var(--lembur)" : "var(--faint)" }}>
              {hasTtdStored ? "Tersimpan" : "Belum ada"}
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-faint">Dipakai ulang saat membuat dokumen resmi (opsional).</p>
          <div className="mt-3">
            <SignaturePad onChange={() => {}} onData={setTtdData} />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={saveTtd} className="h-10 flex-1 rounded-xl bg-accent text-[13px] font-extrabold text-white">Simpan TTD</button>
            {hasTtdStored && (
              <button onClick={deleteTtd} className="h-10 rounded-xl border border-border-strong bg-surface px-4 text-[13px] font-bold text-libur">Hapus</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className={LBL}>{label}</label>
      {children}
    </div>
  );
}
