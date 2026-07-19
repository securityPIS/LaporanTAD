"use client";

import { useApp } from "@/lib/store";
import { LemburModal } from "./LemburModal";
import { CutiModal } from "./CutiModal";
import { DinasModal } from "./DinasModal";
import { DeklarasiModal } from "./DeklarasiModal";
import { GenerateDocModal } from "./GenerateDocModal";

/** Menampilkan modal aktif sesuai state store (Lembur / Cuti / Dinas / Deklarasi / Generate). */
export function ModalHost() {
  const { modal } = useApp();
  if (modal.kind === "lembur") return <LemburModal />;
  if (modal.kind === "cuti") return <CutiModal />;
  if (modal.kind === "dinas") return <DinasModal />;
  if (modal.kind === "deklarasi") return <DeklarasiModal />;
  if (modal.kind === "gen") return <GenerateDocModal />;
  return null;
}
