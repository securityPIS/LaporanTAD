"use client";

import { useApp } from "@/lib/store";
import { LemburModal } from "./LemburModal";
import { CutiModal } from "./CutiModal";
import { GenerateDocModal } from "./GenerateDocModal";

/** Menampilkan modal aktif sesuai state store (Lembur / Cuti / Generate Dokumen). */
export function ModalHost() {
  const { modal } = useApp();
  if (modal === "lembur") return <LemburModal />;
  if (modal === "cuti") return <CutiModal />;
  if (modal === "gen") return <GenerateDocModal />;
  return null;
}
