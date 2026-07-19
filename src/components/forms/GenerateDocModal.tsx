"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/cn";
import { apiGet, apiSend } from "@/lib/client";
import { Sheet, BTN_BATAL, INP, LBL } from "@/components/ui/Sheet";
import { SignaturePad } from "./SignaturePad";
import { fmtRange } from "@/lib/date";

type Jenis = "spkl" | "spd" | "deklarasi_dinas" | "surat_cuti";
const GEN_DEFS: { key: Jenis; code: string; name: string }[] = [
  { key: "spkl", code: "SPKL", name: "Dari catatan lembur" },
  { key: "spd", code: "SPD", name: "Dari catatan dinas" },
  { key: "deklarasi_dinas", code: "Deklarasi", name: "Rincian biaya dinas" },
  { key: "surat_cuti", code: "Surat Cuti", name: "Dari catatan cuti" },
];

interface Opt { id: string; label: string }

function pad(n: number): string { return String(n).padStart(2, "0"); }
function isoOf(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export function GenerateDocModal() {
  const { me, modal, closeModal, showToast } = useApp();
  const p = modal.payload ?? {};
  // Mode terkunci: dipanggil dari halaman detail dinas dengan jenis & sumber
  // sudah ditetapkan (SPD / Deklarasi untuk satu perjalanan tertentu).
  const lockJenis = Boolean(p.lockJenis);
  // Mode SPKL-saja: dipanggil dari halaman lembur — jenis dikunci ke SPKL,
  // pemilih jenis disembunyikan, namun pemilih rentang tanggal tetap tampil.
  const spklOnly = Boolean(p.spklOnly);
  const lockedLabel = String(p.label ?? "");
  const [jenis, setJenis] = useState<Jenis>((p.jenis as Jenis) || "spkl");
  const [sumberId, setSumberId] = useState((p.sumberId as string) || "");
  const [opts, setOpts] = useState<Opt[]>([]);
  // SPKL: rentang tanggal + daftar tanggal lembur (untuk hitung cakupan).
  const now = new Date();
  const [mulai, setMulai] = useState(isoOf(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [selesai, setSelesai] = useState(isoOf(now));
  const [otDates, setOtDates] = useState<string[]>([]);
  const [useStored, setUseStored] = useState(Boolean(me?.ttd_file_id));
  const [ttdData, setTtdData] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hasStored = Boolean(me?.ttd_file_id);
  const ttdReady = (useStored && hasStored) || Boolean(ttdData);
  const spklCount = jenis === "spkl" ? otDates.filter((t) => t >= mulai && t <= selesai).length : 0;

  useEffect(() => {
    if (lockJenis) return; // sumber sudah ditetapkan pemanggil
    const url = jenis === "spkl" ? "/api/overtime" : jenis === "surat_cuti" ? "/api/leaves" : "/api/trips";
    apiGet<{ items: Record<string, string>[] }>(url)
      .then((d) => {
        if (jenis === "spkl") {
          setOtDates(d.items.map((r) => r.tanggal));
          return;
        }
        const mapped: Opt[] = d.items.map((r) => {
          if (jenis === "surat_cuti") return { id: r.id, label: `${fmtRange(r.tanggal_mulai, r.tanggal_selesai)}` };
          return { id: r.id, label: `${r.tujuan} · ${fmtRange(r.tanggal_mulai, r.tanggal_selesai)}` };
        });
        setOpts(mapped);
        setSumberId(mapped[0]?.id ?? "");
      })
      .catch(() => {
        setOpts([]);
        setOtDates([]);
      });
  }, [jenis, lockJenis]);

  async function generate() {
    setErr(null);
    if (!ttdReady) return setErr("Tanda tangan wajib disediakan.");
    const ttd = {
      ttd_file_id: useStored && hasStored ? me?.ttd_file_id : "",
      ttd_data_url: !useStored && ttdData ? ttdData : "",
    };
    setBusy(true);
    try {
      let res: { download: string };
      if (jenis === "spkl") {
        if (mulai > selesai) { setBusy(false); return setErr("Tanggal mulai tidak boleh setelah tanggal selesai."); }
        if (spklCount === 0) { setBusy(false); return setErr("Tidak ada catatan lembur pada rentang tanggal ini."); }
        res = await apiSend<{ download: string }>("/api/generate/spkl", "POST", {
          tanggal_mulai: mulai,
          tanggal_selesai: selesai,
          ...ttd,
        });
      } else {
        if (!sumberId) { setBusy(false); return setErr("Pilih catatan sumber dokumen."); }
        res = await apiSend<{ download: string }>("/api/generate", "POST", { jenis, sumber_id: sumberId, ...ttd });
      }
      modal.onDone?.();
      closeModal();
      showToast("Dokumen tergenerate & bertanda tangan");
      window.open(res.download, "_blank");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title="Buat Dokumen Resmi"
      subtitle="Tanda tangan digital wajib sebelum generate"
      onClose={closeModal}
      footer={
        <>
          <button onClick={closeModal} className={BTN_BATAL}>Batal</button>
          <button
            onClick={generate}
            disabled={busy}
            className={cn(
              "h-12 flex-1 rounded-[13px] border-none text-[14.5px] font-extrabold",
              ttdReady && !busy ? "cursor-pointer bg-accent text-white shadow" : "cursor-not-allowed bg-surface-3 text-faint",
            )}
          >
            {busy ? "Membuat…" : "Generate PDF"}
          </button>
        </>
      }
    >
      {lockJenis ? (
        <div className="rounded-2xl border border-border bg-surface-2 px-[14px] py-3">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-faint">
            {GEN_DEFS.find((g) => g.key === jenis)?.code ?? "Dokumen"}
          </div>
          <div className="mt-[3px] text-[13.5px] font-extrabold">{lockedLabel || "Catatan terpilih"}</div>
        </div>
      ) : (
        <>
          {spklOnly ? (
            <div className="rounded-2xl border border-border bg-surface-2 px-[14px] py-3">
              <div className="text-[10.5px] font-bold uppercase tracking-wide text-faint">SPKL</div>
              <div className="mt-[3px] text-[13.5px] font-extrabold">Surat Perintah Kerja Lembur</div>
              <div className="mt-[2px] text-[11.5px] text-muted">Dari catatan lembur pada rentang tanggal</div>
            </div>
          ) : (
            <div>
              <label className={LBL}>Jenis dokumen</label>
              <div className="grid grid-cols-2 gap-2">
                {GEN_DEFS.map((g) => {
                  const on = jenis === g.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => setJenis(g.key)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border-[1.5px] px-[14px] py-3 text-left",
                        on ? "border-accent bg-accent-weak text-accent-ink" : "border-border bg-surface text-text",
                      )}
                    >
                      <span className="text-[13px] font-extrabold">{g.code}</span>
                      <span className="mt-[2px] text-[10.5px] opacity-80">{g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {jenis === "spkl" ? (
            <div>
              <label className={LBL}>Periode lembur</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={mulai} max={selesai} onChange={(e) => setMulai(e.target.value)} className={INP} />
                <input type="date" value={selesai} min={mulai} onChange={(e) => setSelesai(e.target.value)} className={INP} />
              </div>
              <p className="mt-2 text-[12px] font-semibold text-muted">
                {spklCount > 0
                  ? `${spklCount} catatan lembur pada rentang ini akan disertakan.`
                  : "Tidak ada catatan lembur pada rentang ini."}
              </p>
            </div>
          ) : (
            <div>
              <label className={LBL}>Pilih catatan sumber</label>
              <select value={sumberId} onChange={(e) => setSumberId(e.target.value)} className={INP}>
                {opts.length === 0 && <option value="">— tidak ada catatan —</option>}
                {opts.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      <div>
        <label className={LBL}>Tanda tangan <span className="text-libur">*</span></label>
        {hasStored && (
          <label className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
            <input type="checkbox" checked={useStored} onChange={(e) => setUseStored(e.target.checked)} />
            Gunakan tanda tangan tersimpan di profil
          </label>
        )}
        {!(useStored && hasStored) && <SignaturePad onChange={() => {}} onData={setTtdData} />}
      </div>

      {err && <div className="rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{err}</div>}
    </Sheet>
  );
}
