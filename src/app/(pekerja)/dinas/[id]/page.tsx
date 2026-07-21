"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { useData, apiSend } from "@/lib/client";
import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Icon } from "@/components/shared/Icons";
import { PhaseBadge } from "@/components/shared/TripStatus";
import { fmtRange, fmtTgl } from "@/lib/date";
import { fmtRupiah } from "@/lib/rupiah";
import { splitIds } from "@/lib/files";
import { Skeleton } from "@/components/shared/Skeleton";
import { cn } from "@/lib/cn";
import type { TripView } from "@/lib/trip-view";
import type { DocumentRow, TripCostRow } from "@/lib/db/tables";

interface DetailResp {
  trip: TripView;
  costs: TripCostRow[];
  docs: DocumentRow[];
}

const STEPS = ["Rencana & SPD", "Sedang dinas", "Deklarasi & tutup"];

export default function DinasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openModal, showToast } = useApp();
  const { data, loading, reload } = useData<DetailResp>(`/api/trips/${id}`);
  const t = data?.trip;
  const costs = data?.costs ?? [];
  const docs = data?.docs ?? [];

  const spdDoc = docs.find((d) => d.jenis_dok === "spd" && d.file_id);
  const dekDoc = docs.find((d) => d.jenis_dok === "deklarasi_dinas" && d.file_id);

  async function handleDelete() {
    if (!t) return;
    if (!confirm("Hapus catatan dinas ini beserta rincian biayanya?")) return;
    try {
      await apiSend(`/api/trips/${t.id}`, "DELETE");
      showToast("Dinas dihapus");
      router.push("/dinas");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
  }

  function openSpd() {
    if (!t) return;
    openModal("gen", { jenis: "spd", sumberId: t.id, lockJenis: true, label: `${t.tujuan} · ${fmtRange(t.tanggal_mulai, t.tanggal_selesai)}` }, reload);
  }
  function openEditDinas() {
    if (!t) return;
    openModal(
      "dinas",
      {
        tripId: t.id,
        defaults: {
          tujuan: t.tujuan,
          tanggal_mulai: t.tanggal_mulai,
          tanggal_selesai: t.tanggal_selesai,
          keperluan: t.keperluan,
          transportasi: t.transportasi,
          keterangan: t.keterangan,
          lampiran_file_id: t.lampiran_file_id,
          surat_perintah_file_id: t.surat_perintah_file_id,
          sifat: t.sifat || undefined,
          golongan: t.golongan,
          biaya_ditanggung: t.biaya_ditanggung,
        },
      },
      reload,
    );
  }
  function openDeklarasiForm() {
    if (!t) return;
    openModal(
      "deklarasi",
      {
        tripId: t.id,
        planMulai: t.tanggal_mulai,
        planSelesai: t.tanggal_selesai,
        defaults: {
          realisasi_mulai: t.tanggal_realisasi_mulai,
          realisasi_selesai: t.tanggal_realisasi_selesai,
          catatan: t.deklarasi_catatan,
          sifat: t.sifat || undefined,
          kendaraan_pribadi: t.deklarasi_kendaraan_pribadi,
          biaya: costs.map((c) => {
            // Data lama tanpa vol/tarif: pulihkan sebagai vol 1 × tarif = jumlah.
            const tarif = c.tarif || c.jumlah;
            const vol = c.vol || 1;
            return {
              komponen: c.komponen,
              keterangan: c.keterangan,
              vol: String(vol),
              tarif: tarif ? String(tarif) : "",
              bukti_file_id: c.bukti_file_id,
            };
          }),
        },
      },
      reload,
    );
  }
  function openDeklarasiGenerate() {
    if (!t) return;
    openModal("gen", { jenis: "deklarasi_dinas", sumberId: t.id, lockJenis: true, label: `${t.tujuan} · ${fmtRupiah(t.total_biaya)}` }, reload);
  }

  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-24 pt-4">
        <Link href="/dinas" className="mb-1 flex items-center gap-1 text-[13px] font-bold text-muted">
          <Icon name="chevronLeft" size={16} /> Dinas
        </Link>

        {loading && !t && <Skeleton rows={3} />}

        {t && (
          <>
            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <div className="text-[21px] font-extrabold tracking-[-.4px]">Dinas ke {t.tujuan}</div>
                <div className="mt-[2px] text-[12.5px] font-semibold text-faint">
                  {fmtRange(t.tanggal_mulai, t.tanggal_selesai)} · {t.keperluan}
                </div>
              </div>
              <PhaseBadge phase={t.phase} label={t.phase_label} tone={t.phase_tone} />
            </div>

            <Stepper langkah={t.langkah} selesai={t.phase === "selesai"} />

            {/* Modul SPD */}
            <Module
              code="SPD"
              title="Surat Perintah Dinas"
              tag="Sebelum berangkat"
              iconBg="bg-accent-weak text-accent-ink"
              badge={t.spd_state === "terbit" ? { text: "Terbit", tone: "lembur" } : { text: "Perlu dibuat", tone: "cuti" }}
            >
              <KV k="Tujuan" v={t.tujuan} />
              <KV k="Rencana tanggal" v={fmtRange(t.tanggal_mulai, t.tanggal_selesai)} />
              {t.transportasi && <KV k="Transportasi" v={t.transportasi} />}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[12px] font-semibold text-faint">Surat Perintah</span>
                {splitIds(t.surat_perintah_file_id).length > 0 ? (
                  splitIds(t.surat_perintah_file_id).map((fid, k) => (
                    <a key={fid} href={`/api/files/${fid}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11.5px] font-bold text-lembur">
                      <Icon name="docCheck" size={13} /> Berkas {k + 1}
                    </a>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-cuti">
                    <Icon name="upload" size={13} /> Belum dilampirkan
                  </span>
                )}
              </div>
              {splitIds(t.lampiran_file_id).length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[12px] font-semibold text-faint">Lampiran lain</span>
                  {splitIds(t.lampiran_file_id).map((fid, k) => (
                    <a key={fid} href={`/api/files/${fid}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11.5px] font-bold text-accent">
                      <Icon name="doc" size={13} /> Berkas {k + 1}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {t.spd_state === "terbit" ? (
                  <>
                    {spdDoc && (
                      <a href={`/api/files/${spdDoc.file_id}`} target="_blank" rel="noreferrer" className={BTN_PRIMARY}>
                        <Icon name="download" size={14} /> Unduh PDF
                      </a>
                    )}
                    <button onClick={openSpd} className={BTN_GHOST}>Buat ulang</button>
                    <button onClick={openEditDinas} className={BTN_GHOST}>Ubah data</button>
                  </>
                ) : (
                  <>
                    <button onClick={openSpd} className={BTN_PRIMARY}>
                      <Icon name="doc" size={14} /> Buat SPD
                    </button>
                    <button onClick={openEditDinas} className={BTN_GHOST}>Ubah data</button>
                  </>
                )}
              </div>
            </Module>

            {/* Modul Deklarasi */}
            <Module
              code="Deklarasi"
              title="Deklarasi Dinas"
              tag="Rincian biaya · setelah pulang"
              iconBg="bg-cuti-weak text-cuti"
              locked={t.deklarasi_state === "terkunci"}
              badge={
                t.deklarasi_state === "terbit"
                  ? { text: "Terbit", tone: "lembur" }
                  : t.deklarasi_state === "terkunci"
                    ? { text: "Terkunci", tone: "faint" }
                    : { text: "Menunggu", tone: "cuti" }
              }
            >
              {t.deklarasi_state === "terkunci" ? (
                <div className="flex items-center gap-2 text-[12px] font-semibold text-faint">
                  <Icon name="lock" size={14} /> Terbitkan SPD dulu, isi Deklarasi sepulang dinas.
                </div>
              ) : t.deklarasi_terisi ? (
                <>
                  <KV k="Realisasi" v={fmtRange(t.tanggal_realisasi_mulai || t.tanggal_mulai, t.tanggal_realisasi_selesai || t.tanggal_selesai)} />
                  <div className="mt-2 flex flex-col gap-1.5">
                    {costs.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2 border-b border-dashed border-border py-1 last:border-none">
                        <div className="min-w-0">
                          <div className="truncate text-[12.5px] font-bold">{c.komponen}</div>
                          {c.tarif > 0 && c.vol > 0 ? (
                            <div className="truncate text-[10.5px] text-faint">{c.vol} × {fmtRupiah(c.tarif)}{c.keterangan ? ` · ${c.keterangan}` : ""}</div>
                          ) : (
                            c.keterangan && <div className="truncate text-[10.5px] text-faint">{c.keterangan}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {splitIds(c.bukti_file_id).map((fid, k) => (
                            <a key={fid} href={`/api/files/${fid}`} target="_blank" rel="noreferrer" aria-label={`Bukti ${k + 1}`} className="text-lembur">
                              <Icon name="docCheck" size={13} />
                            </a>
                          ))}
                          <span className="text-[12.5px] font-extrabold tabular-nums">{fmtRupiah(c.jumlah)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-dinas-weak px-3 py-2">
                    <span className="text-[11.5px] font-bold text-dinas">Total</span>
                    <span className="text-[15px] font-extrabold tabular-nums text-dinas">{fmtRupiah(t.total_biaya)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {t.deklarasi_state === "terbit" ? (
                      <>
                        {dekDoc && (
                          <a href={`/api/files/${dekDoc.file_id}`} target="_blank" rel="noreferrer" className={BTN_PRIMARY}>
                            <Icon name="download" size={14} /> Unduh PDF
                          </a>
                        )}
                        <button onClick={openDeklarasiForm} className={BTN_GHOST}>Edit rincian</button>
                      </>
                    ) : (
                      <>
                        <button onClick={openDeklarasiGenerate} className={BTN_CUTI}>
                          <Icon name="check" size={14} /> Generate PDF
                        </button>
                        <button onClick={openDeklarasiForm} className={BTN_GHOST}>Edit rincian</button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[12px] text-muted">Isi realisasi tanggal & rincian biaya sepulang dinas untuk menutup perjalanan ini.</div>
                  <button onClick={openDeklarasiForm} className={cn(BTN_CUTI, "mt-3")}>
                    <Icon name="plus" size={14} strokeWidth={2.6} /> Isi Deklarasi
                  </button>
                </>
              )}
            </Module>

            <button onClick={handleDelete} className="mt-5 flex items-center gap-1.5 text-[12.5px] font-bold text-libur">
              <Icon name="trash" size={14} /> Hapus dinas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const BTN_PRIMARY = "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent text-[12.5px] font-extrabold text-white";
const BTN_CUTI = "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-cuti text-[12.5px] font-extrabold text-white";
const BTN_GHOST = "flex h-10 flex-none items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-4 text-[12.5px] font-bold text-muted";

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-border py-1.5 last:border-none">
      <span className="text-[12px] font-semibold text-faint">{k}</span>
      <span className="text-right text-[12px] font-bold">{v}</span>
    </div>
  );
}

function Module({
  code,
  title,
  tag,
  iconBg,
  badge,
  locked,
  children,
}: {
  code: string;
  title: string;
  tag: string;
  iconBg: string;
  badge: { text: string; tone: "lembur" | "cuti" | "faint" };
  locked?: boolean;
  children: React.ReactNode;
}) {
  const toneClass =
    badge.tone === "lembur" ? "bg-lembur-weak text-lembur" : badge.tone === "cuti" ? "bg-cuti-weak text-cuti" : "bg-surface-3 text-faint";
  return (
    <div className={cn("mt-3 rounded-2xl border border-border bg-surface p-[14px] shadow-sm", locked && "opacity-75")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-9 w-9 flex-none items-center justify-center rounded-xl", iconBg)}>
            <Icon name="doc" size={17} />
          </span>
          <div>
            <div className="text-[14px] font-extrabold">{title}</div>
            <div className="text-[10.5px] font-semibold text-faint">{tag}</div>
          </div>
        </div>
        <span className={cn("inline-flex items-center rounded-full px-[9px] py-1 text-[10px] font-extrabold", toneClass)}>{badge.text}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Stepper({ langkah, selesai }: { langkah: number; selesai: boolean }) {
  function state(idx: number): "done" | "now" | "next" {
    if (selesai) return "done";
    if (idx < langkah) return "done";
    if (idx === langkah) return "now";
    return "next";
  }
  return (
    <div className="mt-4 flex items-start px-1">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const s = state(idx);
        return (
          <div key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-[60px] flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12px] font-extrabold",
                  s === "done" && "border-lembur bg-lembur text-white",
                  s === "now" && "border-dinas bg-dinas text-white shadow-[0_0_0_4px_var(--dinas-weak)]",
                  s === "next" && "border-border-strong bg-surface text-faint",
                )}
              >
                {s === "done" ? <Icon name="check" size={15} strokeWidth={2.8} /> : idx}
              </div>
              <div className="mt-1.5 text-center text-[9.5px] font-bold leading-tight text-muted">{label}</div>
            </div>
            {idx < STEPS.length && <div className={cn("mt-4 h-[3px] flex-1 rounded", idx < langkah || selesai ? "bg-lembur" : "bg-border-strong")} />}
          </div>
        );
      })}
    </div>
  );
}
