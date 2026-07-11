"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/client";
import { signOut } from "next-auth/react";
import type { UserRow } from "@/lib/db/tables";

interface Options {
  lokasi: string[];
  divisi: string[];
  bagian: string[];
  shift: string[];
  hubungan: string[];
}
interface Company {
  id: string;
  nama: string;
}

const LBL = "mb-[6px] block text-xs font-bold text-muted";
const INP = "h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-text outline-none";
const DRAFT_KEY = "ltad-register-draft";

type Form = {
  nama_lengkap: string;
  company_id: string;
  nopek: string;
  lokasi_kerja: string;
  divisi: string;
  bagian: string;
  tipe_kerja: "shift" | "nonshift";
  nama_shift: string;
  no_telp: string;
  darurat_alamat: string;
  darurat_telp: string;
  darurat_hubungan: string;
};

export function RegisterForm({
  email,
  prefill,
  companies,
  options,
}: {
  email: string;
  prefill: UserRow | null;
  companies: Company[];
  options: Options;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(() => ({
    nama_lengkap: prefill?.nama_lengkap ?? "",
    company_id: prefill?.company_id ?? "",
    nopek: prefill?.nopek ?? "",
    lokasi_kerja: prefill?.lokasi_kerja ?? "",
    divisi: prefill?.divisi ?? "",
    bagian: prefill?.bagian ?? "",
    tipe_kerja: prefill?.tipe_kerja ?? "nonshift",
    nama_shift: prefill?.nama_shift ?? "",
    no_telp: prefill?.no_telp ?? "",
    darurat_alamat: prefill?.darurat_alamat ?? "",
    darurat_telp: prefill?.darurat_telp ?? "",
    darurat_hubungan: prefill?.darurat_hubungan ?? "",
  }));

  // Draf lokal agar tidak hilang saat berpindah aplikasi.
  useEffect(() => {
    if (prefill) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) }));
    } catch {
      /* abaikan */
    }
  }, [prefill]);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* abaikan */
    }
  }, [form]);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validStep(): string | null {
    if (step === 0) {
      if (form.nama_lengkap.trim().length < 3) return "Nama lengkap minimal 3 karakter.";
      if (!form.no_telp.trim()) return "No. telepon wajib diisi.";
    }
    if (step === 1) {
      if (!form.company_id) return "Perusahaan wajib dipilih.";
      if (!form.nopek.trim()) return "Nopek wajib diisi.";
      if (!form.lokasi_kerja) return "Lokasi kerja wajib dipilih.";
      if (!form.divisi) return "Divisi wajib dipilih.";
      if (!form.bagian) return "Bagian wajib dipilih.";
      if (form.tipe_kerja === "shift" && !form.nama_shift) return "Nama shift wajib dipilih.";
    }
    return null;
  }

  function next() {
    const err = validStep();
    if (err) return setError(err);
    setError(null);
    setStep((s) => Math.min(s + 1, 2));
  }

  async function submit() {
    if (!form.darurat_alamat.trim()) return setError("Alamat kontak darurat wajib diisi.");
    if (!form.darurat_telp.trim()) return setError("No. telepon kerabat wajib diisi.");
    if (!form.darurat_hubungan) return setError("Hubungan wajib dipilih.");
    setBusy(true);
    setError(null);
    try {
      await apiSend("/api/register", "POST", form);
      localStorage.removeItem(DRAFT_KEY);
      router.replace("/menunggu");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const STEPS = ["Data Diri", "Pekerjaan", "Kontak Darurat"];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-extrabold tracking-[-.3px]">Formulir Registrasi</h1>
        <button onClick={() => signOut({ redirectTo: "/login" })} className="text-xs font-bold text-faint">
          Keluar
        </button>
      </div>
      <p className="mt-1 text-[12.5px] text-muted">{email}</p>

      {/* Indikator langkah */}
      <div className="mt-4 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className="h-1.5 rounded-full"
              style={{ background: i <= step ? "var(--accent)" : "var(--surface-3)" }}
            />
            <div
              className="mt-1.5 text-[10.5px] font-bold"
              style={{ color: i === step ? "var(--accent)" : "var(--faint)" }}
            >
              {i + 1}. {s}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {step === 0 && (
          <>
            <Field label="Nama lengkap">
              <input className={INP} value={form.nama_lengkap} onChange={(e) => set("nama_lengkap", e.target.value)} />
            </Field>
            <Field label="No. telepon (WhatsApp)">
              <input className={INP} value={form.no_telp} onChange={(e) => set("no_telp", e.target.value)} placeholder="08xx / 62xx" />
            </Field>
            <Field label="Email (dari akun Google)">
              <input className={INP + " opacity-60"} value={email} readOnly />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Perusahaan">
              <select className={INP} value={form.company_id} onChange={(e) => set("company_id", e.target.value)}>
                <option value="">— pilih —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </select>
            </Field>
            <Field label="Nopek">
              <input className={INP} value={form.nopek} onChange={(e) => set("nopek", e.target.value)} />
            </Field>
            <Field label="Lokasi kerja">
              <Select value={form.lokasi_kerja} onChange={(v) => set("lokasi_kerja", v)} opts={options.lokasi} />
            </Field>
            <div className="flex gap-3">
              <Field label="Divisi" className="flex-1">
                <Select value={form.divisi} onChange={(v) => set("divisi", v)} opts={options.divisi} allowNew />
              </Field>
              <Field label="Bagian" className="flex-1">
                <Select value={form.bagian} onChange={(v) => set("bagian", v)} opts={options.bagian} allowNew />
              </Field>
            </div>
            <Field label="Pola kerja">
              <div className="flex gap-2">
                {(["nonshift", "shift"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tipe_kerja", t)}
                    className={
                      "flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-bold " +
                      (form.tipe_kerja === t ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted")
                    }
                  >
                    {t === "shift" ? "Shift" : "Non-shift"}
                  </button>
                ))}
              </div>
            </Field>
            {form.tipe_kerja === "shift" && (
              <Field label="Nama shift">
                <Select value={form.nama_shift} onChange={(v) => set("nama_shift", v)} opts={options.shift} />
              </Field>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Alamat lengkap kontak darurat">
              <textarea
                className="min-h-[70px] w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none"
                value={form.darurat_alamat}
                onChange={(e) => set("darurat_alamat", e.target.value)}
              />
            </Field>
            <Field label="No. telepon kerabat">
              <input className={INP} value={form.darurat_telp} onChange={(e) => set("darurat_telp", e.target.value)} placeholder="08xx / 62xx" />
            </Field>
            <Field label="Hubungan dengan pekerja">
              <Select value={form.darurat_hubungan} onChange={(v) => set("darurat_hubungan", v)} opts={options.hubungan} />
            </Field>
          </>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl bg-libur-weak px-3 py-2 text-[12.5px] font-semibold text-libur">{error}</div>}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="h-11 rounded-xl border border-border-strong bg-surface px-4 text-sm font-bold text-muted">
            Kembali
          </button>
        )}
        {step < 2 ? (
          <button onClick={next} className="h-11 flex-1 rounded-xl bg-accent text-sm font-extrabold text-white">
            Lanjut
          </button>
        ) : (
          <button onClick={submit} disabled={busy} className="h-11 flex-1 rounded-xl bg-accent text-sm font-extrabold text-white disabled:opacity-50">
            {busy ? "Mengirim…" : "Kirim Registrasi"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className={LBL}>{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, opts, allowNew }: { value: string; onChange: (v: string) => void; opts: string[]; allowNew?: boolean }) {
  const [custom, setCustom] = useState(false);
  if (custom) {
    return (
      <input
        className={INP}
        value={value}
        autoFocus
        placeholder="Ketik nilai baru"
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => value === "" && setCustom(false)}
      />
    );
  }
  return (
    <select
      className={INP}
      value={opts.includes(value) ? value : ""}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          setCustom(true);
          onChange("");
        } else onChange(e.target.value);
      }}
    >
      <option value="">— pilih —</option>
      {opts.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
      {allowNew && <option value="__new__">+ Tambah baru…</option>}
    </select>
  );
}
