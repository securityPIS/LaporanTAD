"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { apiSend, apiUpload } from "@/lib/client";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { Icon } from "@/components/shared/Icons";
import { fmtRupiah } from "@/lib/rupiah";
import { joinIds, splitIds } from "@/lib/files";

interface CostDraft {
  komponen: string;
  keterangan: string;
  jumlah: string; // string agar input kosong tak jadi 0
  bukti_file_id: string; // id berkas bukti (bisa >1, dipisah koma)
}

// Komponen biaya yang lazim — dipakai sebagai tombol cepat & baris awal.
const KOMPONEN_UMUM = ["Transportasi", "Penginapan", "Uang harian", "Taksi/lokal", "Konsumsi", "Lain-lain"];

function blankRow(komponen = ""): CostDraft {
  return { komponen, keterangan: "", jumlah: "", bukti_file_id: "" };
}

export function DeklarasiModal() {
  const { modal, closeModal, showToast } = useApp();
  const p = modal.payload ?? {};
  const tripId = String(p.tripId ?? "");
  const planMulai = String(p.planMulai ?? "");
  const planSelesai = String(p.planSelesai ?? "");
  const initial = (p.defaults ?? {}) as {
    realisasi_mulai?: string;
    realisasi_selesai?: string;
    catatan?: string;
    biaya?: CostDraft[];
  };

  const [mulai, setMulai] = useState(initial.realisasi_mulai || planMulai);
  const [selesai, setSelesai] = useState(initial.realisasi_selesai || planSelesai);
  const [catatan, setCatatan] = useState(initial.catatan || "");
  const [rows, setRows] = useState<CostDraft[]>(
    initial.biaya && initial.biaya.length > 0
      ? initial.biaya
      : [blankRow("Transportasi"), blankRow("Penginapan"), blankRow("Uang harian")],
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const total = rows.reduce((s, r) => s + (Number(r.jumlah) || 0), 0);
  const selesaiBeda = selesai && planSelesai && selesai !== planSelesai;

  function patchRow(i: number, patch: Partial<CostDraft>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, blankRow()]);
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length <= 1 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  async function save() {
    setErr(null);
    if (!mulai || !selesai) return setErr("Tanggal berangkat & kembali wajib diisi.");
    if (selesai < mulai) return setErr("Tanggal kembali tidak boleh sebelum berangkat.");
    const biaya = rows
      .filter((r) => r.komponen.trim() && r.jumlah !== "")
      .map((r) => ({
        komponen: r.komponen.trim(),
        keterangan: r.keterangan.trim(),
        jumlah: Math.round(Number(r.jumlah) || 0),
        bukti_file_id: r.bukti_file_id,
      }));
    if (biaya.length === 0) return setErr("Isi minimal satu komponen biaya beserta jumlahnya.");
    if (biaya.some((b) => b.jumlah < 0)) return setErr("Jumlah biaya tidak boleh negatif.");
    setBusy(true);
    try {
      await apiSend(`/api/trips/${tripId}/deklarasi`, "PATCH", {
        tanggal_realisasi_mulai: mulai,
        tanggal_realisasi_selesai: selesai,
        catatan,
        biaya,
      });
      modal.onDone?.();
      closeModal();
      showToast("Deklarasi tersimpan — siap digenerate");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title="Isi Deklarasi Dinas"
      subtitle="Realisasi perjalanan & rincian biaya"
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>Batal</button>
          <button onClick={save} disabled={busy} className={cn(BTN_PRIMARY, busy && "opacity-60")}>
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={LBL}>Berangkat (aktual)</label>
          <input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} className={INP} />
        </div>
        <div className="flex-1">
          <label className={LBL}>Kembali (aktual)</label>
          <input type="date" value={selesai} min={mulai} onChange={(e) => setSelesai(e.target.value)} className={INP} />
        </div>
      </div>
      {selesaiBeda && (
        <div className="rounded-xl bg-cuti-weak px-3 py-2 text-[11.5px] font-semibold text-cuti">
          Tanggal realisasi berbeda dari rencana SPD — akan dicatat pada Deklarasi.
        </div>
      )}

      <div>
        <label className={LBL}>Catatan (opsional)</label>
        <textarea className={AREA} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Mis. menginap 1 malam lebih lama karena…" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={cn(LBL, "mb-0")}>Rincian biaya</label>
          <span className="text-[11px] font-semibold text-faint">Lampirkan bukti tiap komponen</span>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface-2 p-3">
              <div className="flex items-center gap-2">
                <input
                  className={cn(INP, "h-[42px] flex-1")}
                  value={r.komponen}
                  list="komponen-umum"
                  onChange={(e) => patchRow(i, { komponen: e.target.value })}
                  placeholder="Komponen"
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  aria-label="Hapus komponen"
                  className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl border border-border bg-surface text-faint"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className={cn(INP, "h-[42px] flex-1")}
                  value={r.keterangan}
                  onChange={(e) => patchRow(i, { keterangan: e.target.value })}
                  placeholder="Keterangan (opsional)"
                />
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-faint">Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className={cn(INP, "h-[42px] pl-9 text-right tabular-nums")}
                    value={r.jumlah}
                    onChange={(e) => patchRow(i, { jumlah: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <BuktiUpload value={r.bukti_file_id} onChange={(ids) => patchRow(i, { bukti_file_id: ids })} />
            </div>
          ))}
        </div>
        <datalist id="komponen-umum">
          {KOMPONEN_UMUM.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 flex items-center gap-1.5 text-[12.5px] font-extrabold text-accent"
        >
          <Icon name="plus" size={15} strokeWidth={2.6} /> Tambah komponen biaya
        </button>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-dinas-weak px-4 py-3">
          <span className="text-[12.5px] font-bold text-dinas">Total deklarasi</span>
          <span className="text-[17px] font-extrabold tabular-nums text-dinas">{fmtRupiah(total)}</span>
        </div>
      </div>

      {err && <div className="rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{err}</div>}
    </Sheet>
  );
}

// Tombol unggah bukti ringkas per komponen — bisa lebih dari satu berkas
// (id disimpan dipisah koma), kompresi gambar client-side.
function BuktiUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (fileIds: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const ids = splitIds(value);
  const has = ids.length > 0;

  async function handle(files: FileList) {
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        let toUpload: File | Blob = file;
        if (file.type.startsWith("image/")) {
          toUpload = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2000, useWebWorker: true });
        }
        const form = new FormData();
        form.append("file", toUpload, file.name);
        form.append("kind", "dinas");
        const res = await apiUpload<{ file_id: string; name: string }>("/api/upload", form);
        uploaded.push(res.file_id);
      }
      onChange(joinIds([...ids, ...uploaded]));
    } catch {
      /* diamkan — pengguna bisa coba lagi */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) handle(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed px-3 py-2 text-[11.5px] font-bold",
          has ? "border-lembur text-lembur" : "border-border-strong text-faint",
        )}
      >
        <Icon name={has ? "check" : "upload"} size={14} />
        {busy ? "Mengunggah…" : has ? `${ids.length} bukti · tambah` : "Lampirkan bukti"}
      </button>
      {has && (
        <button type="button" onClick={() => onChange("")} aria-label="Hapus bukti" className="flex-none text-faint">
          <Icon name="trash" size={14} />
        </button>
      )}
    </div>
  );
}
