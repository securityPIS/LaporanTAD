"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { apiGet, apiSend } from "@/lib/client";
import { Sheet, AREA, BTN_BATAL, BTN_PRIMARY, INP, LBL } from "@/components/ui/Sheet";
import { EvidenceUpload } from "./EvidenceUpload";
import { hitungTotalJam, fmtJamHHMM } from "@/lib/overtime-calc";
import { todayWIB } from "@/lib/wib";
import type { OvertimeJenis } from "@/lib/db/tables";
import type { OvertimeCardVM } from "@/lib/overtime-view";

const JENIS_OPTS: { key: OvertimeJenis; label: string }[] = [
  { key: "reguler", label: "Reguler" },
  { key: "kjk", label: "KJK" },
  { key: "libur_nasional", label: "Libur Nasional" },
  { key: "cuti", label: "Lembur Cuti" },
];

interface Holiday { id: string; tanggal: string; nama: string }
interface Rekan { id: string; nama: string; shift: string }

export function LemburModal() {
  const { me, modal, closeModal, showToast } = useApp();
  const editing = modal.payload?.record as OvertimeCardVM | undefined;
  const isShift = me?.tipe_kerja === "shift";
  const today = todayWIB();

  const [tanggal, setTanggal] = useState(editing?.tanggal ?? today);
  const [keterangan, setKeterangan] = useState(editing?.ket ?? "");
  const [mulai, setMulai] = useState(editing?.jamMulai ?? "18:00");
  const [selesai, setSelesai] = useState(editing?.jamSelesai ?? "21:00");
  const [jenis, setJenis] = useState<OvertimeJenis>(editing?.jenis ?? "reguler");
  const [holidayId, setHolidayId] = useState("");
  const [replacedId, setReplacedId] = useState("");
  const [evidence, setEvidence] = useState(editing?.evidence ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [rekan, setRekan] = useState<Rekan[]>([]);

  useEffect(() => {
    if (jenis === "libur_nasional" && holidays.length === 0) {
      apiGet<{ items: Holiday[] }>(`/api/holidays?year=${tanggal.slice(0, 4)}`).then((d) => setHolidays(d.items)).catch(() => {});
    }
    if (jenis === "cuti" && rekan.length === 0) {
      apiGet<{ items: Rekan[] }>("/api/rekan-shift").then((d) => setRekan(d.items)).catch(() => {});
    }
  }, [jenis, tanggal, holidays.length, rekan.length]);

  const total = fmtJamHHMM(hitungTotalJam(mulai, selesai));

  async function save() {
    setErr(null);
    if (!keterangan.trim()) return setErr("Keterangan wajib diisi.");
    if (!evidence) return setErr("Evidence wajib diunggah.");
    if (jenis === "cuti" && !replacedId) return setErr("Pilih rekan yang digantikan.");

    const body = {
      tanggal: jenis === "libur_nasional" && holidayId ? holidays.find((h) => h.id === holidayId)?.tanggal ?? tanggal : tanggal,
      jenis: isShift ? jenis : "reguler",
      holiday_id: jenis === "libur_nasional" ? holidayId : "",
      replaced_user_id: jenis === "cuti" ? replacedId : "",
      keterangan,
      jam_mulai: mulai,
      jam_selesai: selesai,
      evidence_file_id: evidence,
    };
    setBusy(true);
    try {
      const res = editing
        ? await apiSend<{ warnings: string[] }>(`/api/overtime/${editing.id}`, "PATCH", body)
        : await apiSend<{ warnings: string[] }>("/api/overtime", "POST", body);
      modal.onDone?.();
      closeModal();
      showToast(editing ? "Catatan diperbarui" : "Catatan lembur tersimpan");
      (res.warnings ?? []).forEach((w) => showToast(w, "err"));
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title={editing ? "Ubah Lembur" : "Catat Lembur"}
      subtitle={isShift ? `Pekerja shift ${me?.nama_shift}` : "Pekerja non-shift"}
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>Batal</button>
          <button onClick={save} disabled={busy} className={cn(BTN_PRIMARY, busy && "opacity-60")}>
            {busy ? "Menyimpan…" : "Simpan Catatan"}
          </button>
        </>
      }
    >
      {isShift && (
        <div>
          <label className={LBL}>Jenis lembur</label>
          <div className="flex flex-wrap gap-2">
            {JENIS_OPTS.map((j) => {
              const on = jenis === j.key;
              return (
                <button
                  key={j.key}
                  onClick={() => setJenis(j.key)}
                  className={cn(
                    "cursor-pointer rounded-[10px] border px-[13px] py-2 text-[12.5px] font-bold",
                    on ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted",
                  )}
                >
                  {j.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isShift && jenis === "libur_nasional" && (
        <div>
          <label className={LBL}>Pilih libur nasional</label>
          <select value={holidayId} onChange={(e) => setHolidayId(e.target.value)} className={INP}>
            <option value="">— pilih —</option>
            {holidays.map((h) => (
              <option key={h.id} value={h.id}>{h.tanggal} — {h.nama}</option>
            ))}
          </select>
        </div>
      )}

      {isShift && jenis === "cuti" && (
        <div>
          <label className={LBL}>Menggantikan rekan (shift, satu lokasi & bagian)</label>
          <select value={replacedId} onChange={(e) => setReplacedId(e.target.value)} className={INP}>
            <option value="">— pilih rekan —</option>
            {rekan.map((r) => (
              <option key={r.id} value={r.id}>{r.nama} — Shift {r.shift}</option>
            ))}
          </select>
          {rekan.length === 0 && (
            <div className="mt-[6px] text-[11px] font-semibold text-faint">Tidak ada rekan shift satu lokasi & bagian.</div>
          )}
        </div>
      )}

      <div>
        <label className={LBL}>Tanggal</label>
        <input
          type="date"
          value={tanggal}
          max={today}
          disabled={jenis === "libur_nasional" && Boolean(holidayId)}
          onChange={(e) => setTanggal(e.target.value)}
          className={INP}
        />
      </div>

      <div>
        <label className={LBL}>Keterangan</label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Contoh: Penyelesaian laporan bulanan operasional"
          className={AREA}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={LBL}>Jam mulai</label>
          <input type="time" value={mulai} onChange={(e) => setMulai(e.target.value)} className={INP} />
        </div>
        <div className="flex-1">
          <label className={LBL}>Jam selesai</label>
          <input type="time" value={selesai} onChange={(e) => setSelesai(e.target.value)} className={INP} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[14px] border border-accent bg-accent-weak px-4 py-[15px]">
        <div>
          <div className="text-xs font-bold text-accent-ink">Total jam terhitung</div>
          <div className="mt-[1px] text-[11px] text-accent">otomatis · mendukung lintas tengah malam</div>
        </div>
        <div className="font-mono text-[26px] font-bold text-accent-ink">{total}</div>
      </div>

      <EvidenceUpload kind="lembur" label="Evidence" required value={evidence} onChange={(id) => setEvidence(id)} />

      {err && <div className="rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{err}</div>}
    </Sheet>
  );
}
