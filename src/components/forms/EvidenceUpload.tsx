"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { apiUpload } from "@/lib/client";
import { Icon } from "@/components/shared/Icons";
import { LBL } from "@/components/ui/Sheet";
import { joinIds, splitIds } from "@/lib/files";

interface Props {
  kind: "lembur" | "cuti" | "dinas";
  label: string;
  required?: boolean;
  value: string;
  onChange: (fileIds: string, name: string) => void;
  /** Izinkan lebih dari satu berkas (disimpan sebagai id dipisah koma). */
  multiple?: boolean;
}

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

async function uploadOne(kind: string, file: File): Promise<{ id: string; name: string }> {
  let toUpload: File | Blob = file;
  if (file.type.startsWith("image/")) {
    toUpload = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2000, useWebWorker: true });
  }
  const form = new FormData();
  form.append("file", toUpload, file.name);
  form.append("kind", kind);
  const res = await apiUpload<{ file_id: string; name: string }>("/api/upload", form);
  return { id: res.file_id, name: file.name };
}

// Unggah evidence/lampiran: kompresi gambar client-side (≤ 1,5 MB) lalu POST /api/upload.
export function EvidenceUpload({ kind, label, required, value, onChange, multiple }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Nama berkas hanya diketahui saat sesi unggah; id-nya yang dipersist.
  const [names, setNames] = useState<Record<string, string>>({});
  const ids = splitIds(value);

  async function handleFiles(files: FileList) {
    setErr(null);
    setBusy(true);
    try {
      const picked = multiple ? Array.from(files) : [files[0]];
      const uploaded: { id: string; name: string }[] = [];
      for (const f of picked) if (f) uploaded.push(await uploadOne(kind, f));
      const nextIds = multiple ? [...ids, ...uploaded.map((u) => u.id)] : uploaded.map((u) => u.id);
      setNames((n) => {
        const m = { ...n };
        for (const u of uploaded) m[u.id] = u.name;
        return m;
      });
      onChange(joinIds(nextIds), uploaded[uploaded.length - 1]?.name ?? "");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function removeId(id: string) {
    onChange(joinIds(ids.filter((x) => x !== id)), "");
  }

  const has = ids.length > 0;

  return (
    <div>
      <label className={LBL}>
        {label} {required && <span className="text-libur">*</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) handleFiles(e.target.files);
          e.target.value = ""; // izinkan pilih berkas sama lagi
        }}
      />

      {multiple ? (
        <div className="flex flex-col gap-2">
          {ids.map((id) => (
            <div key={id} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2">
              <Icon name="docCheck" size={15} className="flex-none text-lembur" />
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{names[id] || "Berkas terlampir"}</span>
              <button type="button" onClick={() => removeId(id)} aria-label="Hapus berkas" className="flex-none text-faint">
                <Icon name="close" size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-border-strong bg-surface-2 py-3 text-[12.5px] font-bold text-faint"
          >
            <Icon name={busy ? "upload" : "plus"} size={16} strokeWidth={2.2} />
            {busy ? "Mengunggah…" : has ? "Tambah berkas" : "Unggah foto atau PDF"}
          </button>
          <div className="text-[11px] text-faint">Bisa lebih dari satu · JPG/PNG/PDF · dikompresi otomatis</div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full cursor-pointer rounded-[14px] border-[1.5px] border-dashed p-[18px] text-center"
          style={{ borderColor: has ? "var(--lembur)" : "var(--border-strong)", background: "var(--surface-2)" }}
        >
          <Icon
            name={has ? "check" : "upload"}
            size={24}
            strokeWidth={1.8}
            className="mx-auto mb-[6px]"
            style={{ color: has ? "var(--lembur)" : "var(--faint)" }}
          />
          <div className="text-[12.5px] font-bold">
            {busy ? "Mengunggah…" : has ? names[ids[0]] || "Berkas terunggah" : "Unggah foto atau PDF"}
          </div>
          <div className="mt-[2px] text-[11px] text-faint">JPG/PNG/PDF · maks 5 MB · dikompresi otomatis</div>
        </button>
      )}
      {err && <div className="mt-1.5 text-[11.5px] font-semibold text-libur">{err}</div>}
    </div>
  );
}
