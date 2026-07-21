"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { apiSend } from "@/lib/client";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { EvidenceUpload } from "./EvidenceUpload";

export function DinasModal() {
  const { modal, closeModal, showToast } = useApp();
  const p = modal.payload ?? {};
  // Mode ubah: dipanggil dari halaman detail dinas dengan data yang sudah ada.
  const editId = String(p.tripId ?? "");
  const isEdit = editId.length > 0;
  const d = (p.defaults ?? {}) as {
    tujuan?: string;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    keperluan?: string;
    transportasi?: string;
    keterangan?: string;
    lampiran_file_id?: string;
    sifat?: "residensial" | "non_residensial";
    golongan?: string;
    biaya_ditanggung?: string;
    surat_perintah_file_id?: string;
  };

  const [tujuan, setTujuan] = useState(d.tujuan ?? "");
  const [mulai, setMulai] = useState(d.tanggal_mulai ?? "");
  const [selesai, setSelesai] = useState(d.tanggal_selesai ?? "");
  const [keperluan, setKeperluan] = useState(d.keperluan ?? "");
  const [transportasi, setTransportasi] = useState(d.transportasi ?? "");
  const [keterangan, setKeterangan] = useState(d.keterangan ?? "");
  const [lampiran, setLampiran] = useState(d.lampiran_file_id ?? "");
  const [suratPerintah, setSuratPerintah] = useState(d.surat_perintah_file_id ?? "");
  const [sifat, setSifat] = useState<"residensial" | "non_residensial">(d.sifat ?? "non_residensial");
  const [golongan, setGolongan] = useState(d.golongan ?? "");
  const [biayaDitanggung, setBiayaDitanggung] = useState(d.biaya_ditanggung ?? "Perusahaan");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (!tujuan.trim()) return setErr("Tujuan wajib diisi.");
    if (!mulai || !selesai) return setErr("Tanggal mulai & selesai wajib diisi.");
    if (!keperluan.trim()) return setErr("Keperluan wajib diisi.");
    if (!suratPerintah.trim()) return setErr("Dokumen Surat Perintah wajib dilampirkan untuk SPD.");
    setBusy(true);
    try {
      const body = {
        tujuan, tanggal_mulai: mulai, tanggal_selesai: selesai, keperluan, transportasi, keterangan,
        lampiran_file_id: lampiran, surat_perintah_file_id: suratPerintah,
        sifat, golongan, biaya_ditanggung: biayaDitanggung,
      };
      if (isEdit) await apiSend(`/api/trips/${editId}`, "PATCH", body);
      else await apiSend("/api/trips", "POST", body);
      modal.onDone?.();
      closeModal();
      showToast(isEdit ? "Dinas diperbarui" : "Dinas tersimpan");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title={isEdit ? "Ubah Data Dinas" : "Rencanakan Dinas"}
      subtitle="Data untuk SPD — sebelum berangkat"
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>Batal</button>
          <button onClick={save} disabled={busy} className={cn(BTN_PRIMARY, busy && "opacity-60")}>
            {busy ? "Menyimpan…" : isEdit ? "Simpan perubahan" : "Simpan"}
          </button>
        </>
      }
    >
      <div>
        <label className={LBL}>Tujuan (kota/tempat)</label>
        <input className={INP} value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Contoh: Surabaya" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={LBL}>Mulai</label>
          <input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} className={INP} />
        </div>
        <div className="flex-1">
          <label className={LBL}>Selesai</label>
          <input type="date" value={selesai} onChange={(e) => setSelesai(e.target.value)} className={INP} />
        </div>
      </div>
      <div>
        <label className={LBL}>Keperluan</label>
        <textarea className={AREA} value={keperluan} onChange={(e) => setKeperluan(e.target.value)} placeholder="Koordinasi vendor, dsb." />
      </div>
      <div>
        <label className={LBL}>Moda transportasi (opsional)</label>
        <input className={INP} value={transportasi} onChange={(e) => setTransportasi(e.target.value)} placeholder="Pesawat / Kereta / Mobil" />
      </div>

      <div>
        <label className={LBL}>Dinas bersifat</label>
        <div className="flex gap-2">
          {([
            { v: "non_residensial", t: "Non-Residensial", d: "Biaya sendiri" },
            { v: "residensial", t: "Residensial", d: "Difasilitasi penyelenggara" },
          ] as const).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setSifat(o.v)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-left",
                sifat === o.v ? "border-dinas bg-dinas-weak" : "border-border bg-surface-2",
              )}
            >
              <div className={cn("text-[12.5px] font-extrabold", sifat === o.v ? "text-dinas" : "text-text")}>{o.t}</div>
              <div className="text-[10.5px] text-faint">{o.d}</div>
            </button>
          ))}
        </div>
        <p className="mt-1 text-[10.5px] text-faint">Tampil di SPD & menentukan komponen biaya yang boleh diklaim saat Deklarasi.</p>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={LBL}>Golongan (opsional)</label>
          <input className={INP} value={golongan} onChange={(e) => setGolongan(e.target.value)} placeholder="Mis. 4B / -" />
        </div>
        <div className="flex-1">
          <label className={LBL}>Biaya ditanggung oleh</label>
          <input className={INP} value={biayaDitanggung} onChange={(e) => setBiayaDitanggung(e.target.value)} placeholder="Perusahaan" />
        </div>
      </div>

      <EvidenceUpload
        kind="dinas"
        label="Surat Perintah (dokumen penugasan)"
        required
        value={suratPerintah}
        onChange={(id) => setSuratPerintah(id)}
        multiple
      />
      <p className="-mt-1 text-[10.5px] text-faint">Wajib disubmit pada SPD — foto/scan surat perintah dinas yang menugaskan perjalanan ini.</p>

      <div>
        <label className={LBL}>Keterangan (opsional)</label>
        <textarea className={AREA} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
      </div>
      <EvidenceUpload kind="dinas" label="Lampiran lain (opsional)" value={lampiran} onChange={(id) => setLampiran(id)} multiple />
      {err && <div className="rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{err}</div>}
    </Sheet>
  );
}
