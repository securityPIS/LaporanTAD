"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { apiSend } from "@/lib/client";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { EvidenceUpload } from "./EvidenceUpload";

export function DinasModal() {
  const { modal, closeModal, showToast } = useApp();
  const [tujuan, setTujuan] = useState("");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [transportasi, setTransportasi] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [lampiran, setLampiran] = useState("");
  const [sifat, setSifat] = useState<"residensial" | "non_residensial">("non_residensial");
  const [golongan, setGolongan] = useState("");
  const [biayaDitanggung, setBiayaDitanggung] = useState("Perusahaan");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (!tujuan.trim()) return setErr("Tujuan wajib diisi.");
    if (!mulai || !selesai) return setErr("Tanggal mulai & selesai wajib diisi.");
    if (!keperluan.trim()) return setErr("Keperluan wajib diisi.");
    setBusy(true);
    try {
      await apiSend("/api/trips", "POST", {
        tujuan, tanggal_mulai: mulai, tanggal_selesai: selesai, keperluan, transportasi, keterangan,
        lampiran_file_id: lampiran, sifat, golongan, biaya_ditanggung: biayaDitanggung,
      });
      modal.onDone?.();
      closeModal();
      showToast("Dinas tersimpan");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title="Rencanakan Dinas"
      subtitle="Data untuk SPD — sebelum berangkat"
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

      <div>
        <label className={LBL}>Keterangan (opsional)</label>
        <textarea className={AREA} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
      </div>
      <EvidenceUpload kind="dinas" label="Lampiran (opsional)" value={lampiran} onChange={(id) => setLampiran(id)} multiple />
      {err && <div className="rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{err}</div>}
    </Sheet>
  );
}
