"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { apiGet, apiSend } from "@/lib/client";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { EvidenceUpload } from "./EvidenceUpload";
import { hitungHari } from "@/lib/cuti";

interface LeaveType { id: string; nama: string; potong_saldo: boolean; wajib_lampiran: boolean }

export function CutiModal() {
  const { modal, closeModal, showToast } = useApp();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [typeId, setTypeId] = useState("");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [lampiran, setLampiran] = useState("");
  const [koreksi, setKoreksi] = useState("");
  const [sisa, setSisa] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ items: LeaveType[] }>("/api/leave-types").then((d) => {
      setTypes(d.items);
      if (d.items[0]) setTypeId(d.items[0].id);
    }).catch(() => {});
    apiGet<{ sisa: number }>("/api/leaves/balance").then((d) => setSisa(d.sisa)).catch(() => {});
  }, []);

  const type = types.find((t) => t.id === typeId);
  const hariOtomatis = mulai && selesai ? hitungHari(mulai, selesai) : 0;
  const hari = koreksi ? Math.min(Number(koreksi), hariOtomatis) : hariOtomatis;

  async function save() {
    setErr(null);
    if (!typeId) return setErr("Jenis cuti wajib dipilih.");
    if (!mulai || !selesai) return setErr("Tanggal mulai & selesai wajib diisi.");
    if (type?.wajib_lampiran && !lampiran) return setErr(`Jenis "${type.nama}" wajib melampirkan berkas.`);
    setBusy(true);
    try {
      await apiSend("/api/leaves", "POST", {
        leave_type_id: typeId,
        tanggal_mulai: mulai,
        tanggal_selesai: selesai,
        jumlah_hari: koreksi ? Number(koreksi) : undefined,
        keterangan,
        lampiran_file_id: lampiran,
      });
      modal.onDone?.();
      closeModal();
      showToast("Cuti tersimpan");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title="Ajukan Cuti"
      subtitle={sisa != null ? `Sisa saldo ${sisa} hari` : "Memuat saldo…"}
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>Batal</button>
          <button onClick={save} disabled={busy} className={cn(BTN_PRIMARY, busy && "opacity-60")}>
            {busy ? "Menyimpan…" : "Ajukan Cuti"}
          </button>
        </>
      }
    >
      <div>
        <label className={LBL}>Jenis cuti</label>
        <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className={INP}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama}
              {t.potong_saldo ? " (potong saldo)" : " (tidak potong)"}
              {t.wajib_lampiran ? " · wajib lampiran" : ""}
            </option>
          ))}
        </select>
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

      <div className="flex items-center justify-between rounded-[14px] border border-cuti bg-cuti-weak px-4 py-[15px]">
        <div>
          <div className="text-[12.5px] font-bold text-cuti">Jumlah hari (otomatis)</div>
          <div className="mt-[1px] text-[11px] text-cuti">dapat dikoreksi ke bawah</div>
        </div>
        <div className="font-mono text-2xl font-bold text-cuti">{hari || "—"}</div>
      </div>

      <div>
        <label className={LBL}>Koreksi jumlah hari (opsional, ≤ otomatis)</label>
        <input
          type="number"
          min={1}
          max={hariOtomatis || undefined}
          value={koreksi}
          onChange={(e) => setKoreksi(e.target.value)}
          placeholder={String(hariOtomatis || "")}
          className={INP}
        />
      </div>

      <div>
        <label className={LBL}>Keterangan</label>
        <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Alasan / keperluan cuti" className={AREA} />
      </div>

      {type?.wajib_lampiran ? (
        <EvidenceUpload kind="cuti" label="Lampiran (surat dokter, dll.)" required value={lampiran} onChange={(id) => setLampiran(id)} />
      ) : (
        <EvidenceUpload kind="cuti" label="Lampiran (opsional)" value={lampiran} onChange={(id) => setLampiran(id)} />
      )}

      {err && <div className="rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{err}</div>}
    </Sheet>
  );
}
