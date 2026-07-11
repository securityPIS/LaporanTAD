"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/login" })}
      className={
        className ??
        "h-10 rounded-xl border border-border-strong bg-surface px-4 text-sm font-bold text-muted hover:bg-surface-2"
      }
    >
      Keluar
    </button>
  );
}
