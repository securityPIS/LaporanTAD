"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

/** Logo Google resmi (4 warna) — untuk tombol "Masuk dengan Google". */
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

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
          <GoogleLogo />
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
