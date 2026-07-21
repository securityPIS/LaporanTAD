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
import { alasanBuktiKurang, alasanKomponenDilarang, buktiWajibUntuk, komponenTersedia, type SifatDinas } from "@/lib/dinas-rules";

interface CostDraft {
  komponen: string;
  keterangan: string;
  vol: string; // Vol/Hari — string agar input kosong tak jadi 0
  tarif: string; // Nilai Rupiah satuan
  bukti_file_id: string; // id berkas bukti (bisa >1, dipisah koma)
}

// Komponen biaya sesuai Ketentuan Dinas (Lampiran ketentuan & manfaat).
// tarif = Nilai Rupiah satuan (0 = sesuai realisasi/invoice), satuan = unit Vol/Hari.
// arah = komponen transport antar-kota (bukan Transport Lokal): dipisah
// Pergi/Pulang & wajib berbukti (tiket, atau bukti jarak bila kendaraan pribadi).
type Arah = "Pergi" | "Pulang";
interface KetentuanBiaya {
  nama: string;
  tarif: number;
  satuan: string;
  hint: string;
  arah?: boolean;
}
const KETENTUAN: KetentuanBiaya[] = [
  { nama: "Uang Harian", tarif: 150_000, satuan: "hari", hint: "Rp 150.000 / hari" },
  { nama: "Akomodasi Penginapan", tarif: 0, satuan: "malam", hint: "≤ Rp 600.000 / malam · realisasi + invoice" },
  { nama: "Transport Lokal", tarif: 50_000, satuan: "hari", hint: "Rp 50.000 / hari · sesuai undangan" },
  { nama: "Transportasi Umum", tarif: 0, satuan: "tiket", hint: "Ekonomi / LCC · realisasi + tiket", arah: true },
  { nama: "Transport Bandara", tarif: 150_000, satuan: "kali", hint: "Rp 150.000 · umum PP stasiun/terminal Rp 225.000", arah: true },
  { nama: "Kendaraan Pribadi", tarif: 2_000, satuan: "km", hint: "Rp 2.000 / km · ≤ 200 km sekali jalan · wajib bukti jarak", arah: true },
  { nama: "Lain-lain", tarif: 0, satuan: "", hint: "Sesuai realisasi" },
];

// Pilihan cepat (chip): komponen transport dipecah menjadi Pergi & Pulang.
interface ChipKetentuan { key: string; nama: string; ket: KetentuanBiaya; arah?: Arah }
const CHIPS: ChipKetentuan[] = KETENTUAN.flatMap((k) =>
  k.arah
    ? [
        { key: `${k.nama}-pergi`, nama: `${k.nama} (Pergi)`, ket: k, arah: "Pergi" as Arah },
        { key: `${k.nama}-pulang`, nama: `${k.nama} (Pulang)`, ket: k, arah: "Pulang" as Arah },
      ]
    : [{ key: k.nama, nama: k.nama, ket: k }],
);
const KOMPONEN_UMUM = CHIPS.map((c) => c.nama);

/** Ketentuan sebuah komponen, mengabaikan sufiks arah "(Pergi)"/"(Pulang)". */
function ketentuanFor(komponen: string): KetentuanBiaya | undefined {
  const base = komponen.replace(/\s*\((?:pergi|pulang)\)\s*$/i, "").trim();
  return KETENTUAN.find((k) => k.nama === base) ?? KETENTUAN.find((k) => k.nama === komponen);
}

function blankRow(nama = "", tarif = 0): CostDraft {
  return { komponen: nama, keterangan: "", vol: "1", tarif: tarif ? String(tarif) : "", bukti_file_id: "" };
}
function rowFromKetentuan(k: KetentuanBiaya, arah?: Arah): CostDraft {
  const nama = arah ? `${k.nama} (${arah})` : k.nama;
  return { komponen: nama, keterangan: "", vol: "1", tarif: k.tarif ? String(k.tarif) : "", bukti_file_id: "" };
}
function rowJumlah(r: CostDraft): number {
  return Math.round((Number(r.vol) || 0) * (Number(r.tarif) || 0));
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
    sifat?: SifatDinas;
    kendaraan_pribadi?: boolean;
    biaya?: CostDraft[];
  };

  const [mulai, setMulai] = useState(initial.realisasi_mulai || planMulai);
  const [selesai, setSelesai] = useState(initial.realisasi_selesai || planSelesai);
  const [catatan, setCatatan] = useState(initial.catatan || "");
  const [sifat, setSifat] = useState<SifatDinas>(initial.sifat || "non_residensial");
  const [kendaraanPribadi, setKendaraanPribadi] = useState<boolean>(initial.kendaraan_pribadi ?? false);
  const [rows, setRows] = useState<CostDraft[]>(
    initial.biaya && initial.biaya.length > 0
      ? initial.biaya
      : [rowFromKetentuan(KETENTUAN[0]), blankRow("Akomodasi Penginapan"), rowFromKetentuan(KETENTUAN[2])],
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const aturan = { sifat, kendaraanPribadi };
  const total = rows.reduce((s, r) => s + rowJumlah(r), 0);
  const selesaiBeda = selesai && planSelesai && selesai !== planSelesai;

  function patchRow(i: number, patch: Partial<CostDraft>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, blankRow()]);
  }
  function addKetentuan(k: KetentuanBiaya, arah?: Arah) {
    setRows((rs) => [...rs, rowFromKetentuan(k, arah)]);
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length <= 1 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  async function save() {
    setErr(null);
    if (!mulai || !selesai) return setErr("Tanggal berangkat & kembali wajib diisi.");
    if (selesai < mulai) return setErr("Tanggal kembali tidak boleh sebelum berangkat.");
    const biaya = rows
      .filter((r) => r.komponen.trim() && r.tarif !== "")
      .map((r) => ({
        komponen: r.komponen.trim(),
        keterangan: r.keterangan.trim(),
        vol: Number(r.vol) || 1,
        tarif: Math.round(Number(r.tarif) || 0),
        bukti_file_id: r.bukti_file_id,
      }));
    if (biaya.length === 0) return setErr("Isi minimal satu komponen biaya beserta tarifnya.");
    if (biaya.some((b) => b.tarif < 0)) return setErr("Tarif biaya tidak boleh negatif.");
    if (biaya.some((b) => b.vol <= 0)) return setErr("Vol/Hari harus lebih dari 0.");
    // Tegakkan aturan klaim (residensial / kendaraan pribadi).
    const terlarang = biaya.find((b) => alasanKomponenDilarang(b.komponen, aturan));
    if (terlarang) {
      return setErr(`"${terlarang.komponen}" — ${alasanKomponenDilarang(terlarang.komponen, aturan)}`);
    }
    // Transport antar-kota (tiket / kendaraan pribadi) wajib berbukti.
    const kurangBukti = biaya.find((b) => alasanBuktiKurang(b.komponen, b.bukti_file_id));
    if (kurangBukti) {
      return setErr(`"${kurangBukti.komponen}" — ${alasanBuktiKurang(kurangBukti.komponen, kurangBukti.bukti_file_id)}`);
    }
    setBusy(true);
    try {
      await apiSend(`/api/trips/${tripId}/deklarasi`, "PATCH", {
        tanggal_realisasi_mulai: mulai,
        tanggal_realisasi_selesai: selesai,
        catatan,
        sifat,
        kendaraan_pribadi: kendaraanPribadi,
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

      {/* Sifat dinas & moda — menentukan komponen biaya yang boleh diklaim. */}
      <div>
        <label className={LBL}>Sifat dinas</label>
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
        {sifat === "residensial" && (
          <p className="mt-1.5 text-[11px] font-semibold text-cuti">
            Akomodasi & Transport Lokal tidak dapat diklaim (sudah difasilitasi).
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
        <input
          type="checkbox"
          checked={kendaraanPribadi}
          onChange={(e) => setKendaraanPribadi(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none accent-[var(--dinas)]"
        />
        <span>
          <span className="block text-[12.5px] font-bold text-text">Pergi/pulang pakai kendaraan pribadi</span>
          <span className="block text-[10.5px] text-faint">
            {kendaraanPribadi
              ? "Tiket transportasi umum & transport bandara/stasiun tidak dapat diklaim."
              : "Centang bila memakai kendaraan pribadi (klaim per-km, bukan tiket)."}
          </span>
        </span>
      </label>

      <div>
        <label className={LBL}>Catatan (opsional)</label>
        <textarea className={AREA} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Mis. menginap 1 malam lebih lama karena…" />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={cn(LBL, "mb-0")}>Rincian biaya</label>
          <span className="text-[11px] font-semibold text-faint">Jumlah = Vol × Tarif</span>
        </div>
        <p className="mb-2 text-[10.5px] text-faint">
          Tiket & transport (selain Transport Lokal) diisi terpisah <b>Pergi</b> & <b>Pulang</b>, dan wajib
          melampirkan bukti tiket — atau bukti jarak pergi &amp; pulang bila memakai kendaraan pribadi.
        </p>

        <div className="flex flex-col gap-3">
          {rows.map((r, i) => {
            const ket = ketentuanFor(r.komponen);
            const larangan = alasanKomponenDilarang(r.komponen, aturan);
            const buktiKurang = !larangan ? alasanBuktiKurang(r.komponen, r.bukti_file_id) : null;
            const wajibBukti = buktiWajibUntuk(r.komponen);
            const invalid = Boolean(larangan) || Boolean(buktiKurang);
            return (
            <div key={i} className={cn("rounded-2xl border bg-surface-2 p-3", invalid ? "border-libur" : "border-border")}>
              <div className="flex items-center gap-2">
                <input
                  className={cn(INP, "h-[42px] flex-1", invalid && "border-libur")}
                  value={r.komponen}
                  list="komponen-umum"
                  onChange={(e) => patchRow(i, { komponen: e.target.value })}
                  placeholder="Komponen biaya"
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
              {larangan ? (
                <p className="mt-1.5 flex items-start gap-1 text-[10.5px] font-bold text-libur">
                  <Icon name="lock" size={12} /> {larangan}
                </p>
              ) : ket ? (
                <p className="mt-1.5 text-[10.5px] font-semibold text-faint">Ketentuan: {ket.hint}</p>
              ) : null}
              <div className="mt-2 flex gap-2">
                <div className="w-[92px] flex-none">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    className={cn(INP, "h-[42px] text-right tabular-nums")}
                    value={r.vol}
                    onChange={(e) => patchRow(i, { vol: e.target.value })}
                    placeholder="Vol"
                    aria-label="Vol/Hari"
                  />
                  <span className="mt-0.5 block text-center text-[9.5px] font-semibold text-faint">Vol{ket?.satuan ? ` (${ket.satuan})` : "/Hari"}</span>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-faint">Rp</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className={cn(INP, "h-[42px] pl-9 text-right tabular-nums")}
                      value={r.tarif}
                      onChange={(e) => patchRow(i, { tarif: e.target.value })}
                      placeholder="0"
                      aria-label="Nilai Rupiah (tarif satuan)"
                    />
                  </div>
                  <span className="mt-0.5 block text-center text-[9.5px] font-semibold text-faint">Tarif satuan</span>
                </div>
                <div className="w-[104px] flex-none">
                  <div className={cn(INP, "flex h-[42px] items-center justify-end tabular-nums text-[12.5px] font-extrabold")}>
                    {fmtRupiah(rowJumlah(r))}
                  </div>
                  <span className="mt-0.5 block text-center text-[9.5px] font-semibold text-faint">Jumlah</span>
                </div>
              </div>
              <input
                className={cn(INP, "mt-2 h-[38px] w-full text-[12px]")}
                value={r.keterangan}
                onChange={(e) => patchRow(i, { keterangan: e.target.value })}
                placeholder="Keterangan (opsional)"
              />
              <BuktiUpload
                value={r.bukti_file_id}
                onChange={(ids) => patchRow(i, { bukti_file_id: ids })}
                required={Boolean(wajibBukti)}
                label={wajibBukti === "jarak" ? "Lampirkan bukti jarak" : wajibBukti === "tiket" ? "Lampirkan tiket" : undefined}
              />
              {buktiKurang && (
                <p className="mt-1 flex items-start gap-1 text-[10.5px] font-bold text-libur">
                  <Icon name="upload" size={12} /> {buktiKurang}
                </p>
              )}
            </div>
            );
          })}
        </div>
        <datalist id="komponen-umum">
          {KOMPONEN_UMUM.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {CHIPS.map((c) => {
            const boleh = komponenTersedia(c.nama, aturan);
            return (
              <button
                key={c.key}
                type="button"
                disabled={!boleh}
                title={boleh ? undefined : (alasanKomponenDilarang(c.nama, aturan) ?? undefined)}
                onClick={() => addKetentuan(c.ket, c.arah)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                  boleh
                    ? "border-border bg-surface text-muted hover:border-dinas hover:text-dinas"
                    : "cursor-not-allowed border-dashed border-border bg-surface-2 text-faint line-through opacity-60",
                )}
              >
                + {c.nama}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-accent"
        >
          <Icon name="plus" size={15} strokeWidth={2.6} /> Komponen biaya lain
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
  required,
  label,
}: {
  value: string;
  onChange: (fileIds: string) => void;
  required?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const ids = splitIds(value);
  const has = ids.length > 0;
  const perlu = Boolean(required) && !has; // wajib namun belum ada berkas

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
          has ? "border-lembur text-lembur" : perlu ? "border-cuti text-cuti" : "border-border-strong text-faint",
        )}
      >
        <Icon name={has ? "check" : "upload"} size={14} />
        {busy
          ? "Mengunggah…"
          : has
            ? `${ids.length} bukti · tambah`
            : `${label ?? "Lampirkan bukti"}${required ? " *" : ""}`}
      </button>
      {has && (
        <button type="button" onClick={() => onChange("")} aria-label="Hapus bukti" className="flex-none text-faint">
          <Icon name="trash" size={14} />
        </button>
      )}
    </div>
  );
}
