"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { apiUpload } from "@/lib/client";
import { Icon } from "@/components/shared/Icons";
import { LBL } from "@/components/ui/Sheet";

interface Props {
  kind: "lembur" | "cuti" | "dinas";
  label: string;
  required?: boolean;
  value: string;
  onChange: (fileId: string, name: string) => void;
}

// Unggah evidence/lampiran: kompresi gambar client-side (≤ 1,5 MB) lalu POST /api/upload.
export function EvidenceUpload({ kind, label, required, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setBusy(true);
    try {
      let toUpload: File | Blob = file;
      if (file.type.startsWith("image/")) {
        toUpload = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2000, useWebWorker: true });
      }
      const form = new FormData();
      form.append("file", toUpload, file.name);
      form.append("kind", kind);
      const res = await apiUpload<{ file_id: string; name: string }>("/api/upload", form);
      setName(file.name);
      onChange(res.file_id, res.name);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const has = Boolean(value);
  return (
    <div>
      <label className={LBL}>
        {label} {required && <span className="text-libur">*</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
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
          {busy ? "Mengunggah…" : has ? name || "Berkas terunggah" : "Unggah foto atau PDF"}
        </div>
        <div className="mt-[2px] text-[11px] text-faint">JPG/PNG/PDF · maks 5 MB · dikompresi otomatis</div>
      </button>
      {err && <div className="mt-1.5 text-[11.5px] font-semibold text-libur">{err}</div>}
    </div>
  );
}
