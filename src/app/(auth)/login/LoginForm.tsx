"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@/components/shared/Icons";

const DEV_USERS = [
  { email: "admin@laporantad.app", label: "Administrator TAD", role: "Admin" },
  { email: "rizky@example.com", label: "Rizky Ramadhan", role: "Pekerja shift" },
  { email: "budi@example.com", label: "Budi Santoso", role: "Pekerja non-shift" },
  { email: "fajar@example.com", label: "Fajar Hidayat", role: "Menunggu verifikasi" },
];

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function devLogin(e: string, name?: string) {
    setBusy(true);
    await signIn("dev", { email: e, name: name ?? e.split("@")[0], redirectTo: "/" });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-[18px] font-extrabold tracking-[-.3px]">Masuk</h1>
      <p className="mt-1 text-[13px] text-muted">Gunakan akun Google Anda untuk masuk.</p>

      {googleEnabled ? (
        <button
          onClick={() => signIn("google", { redirectTo: "/" })}
          className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-surface text-sm font-bold text-text shadow-sm hover:bg-surface-2"
        >
          <Icon name="logo" size={18} />
          Masuk dengan Google
        </button>
      ) : (
        <div className="mt-5">
          <div className="rounded-xl border border-cuti bg-cuti-weak px-4 py-3 text-[12px] font-semibold text-cuti">
            Mode pengembangan — Google OAuth belum dikonfigurasi. Pilih akun contoh
            atau masukkan email untuk menguji alur registrasi.
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {DEV_USERS.map((u) => (
              <button
                key={u.email}
                disabled={busy}
                onClick={() => devLogin(u.email, u.label)}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-left hover:border-accent disabled:opacity-50"
              >
                <div>
                  <div className="text-[13.5px] font-bold text-text">{u.label}</div>
                  <div className="text-[11.5px] text-faint">{u.email}</div>
                </div>
                <span className="rounded-md bg-surface-3 px-2 py-1 text-[10.5px] font-bold text-muted">
                  {u.role}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <label className="mb-[7px] block text-xs font-bold text-muted">
              Atau masuk dengan email lain (uji registrasi baru)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="h-11 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-text outline-none"
              />
              <button
                disabled={busy || !email}
                onClick={() => devLogin(email)}
                className="h-11 rounded-xl bg-accent px-5 text-sm font-extrabold text-white disabled:opacity-50"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
