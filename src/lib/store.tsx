"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { UserRow } from "@/lib/db/tables";

type Theme = "light" | "dark";
export type ModalKind = "lembur" | "cuti" | "dinas" | "gen" | null;

export interface ModalState {
  kind: ModalKind;
  payload?: Record<string, unknown>;
  onDone?: () => void;
}

interface AppStore {
  theme: Theme;
  toggleTheme: () => void;

  toast: string;
  toastKind: "ok" | "err";
  showToast: (msg: string, kind?: "ok" | "err") => void;

  me: UserRow | null;
  setMe: (u: UserRow | null) => void;

  modal: ModalState;
  openModal: (kind: Exclude<ModalKind, null>, payload?: Record<string, unknown>, onDone?: () => void) => void;
  closeModal: () => void;
}

const Ctx = createContext<AppStore | null>(null);
const THEME_KEY = "ltad-theme";

export function AppProvider({
  children,
  initialMe = null,
}: {
  children: React.ReactNode;
  initialMe?: UserRow | null;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [toast, setToast] = useState("");
  const [toastKind, setToastKind] = useState<"ok" | "err">("ok");
  const [me, setMe] = useState<UserRow | null>(initialMe);
  const [modal, setModal] = useState<ModalState>({ kind: null });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(current);
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* abaikan */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "light" ? "dark" : "light");
  }, [theme, applyTheme]);

  const showToast = useCallback((msg: string, kind: "ok" | "err" = "ok") => {
    setToast(msg);
    setToastKind(kind);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const openModal = useCallback(
    (kind: Exclude<ModalKind, null>, payload?: Record<string, unknown>, onDone?: () => void) =>
      setModal({ kind, payload, onDone }),
    [],
  );
  const closeModal = useCallback(() => setModal({ kind: null }), []);

  const value = useMemo<AppStore>(
    () => ({
      theme, toggleTheme, toast, toastKind, showToast, me, setMe, modal, openModal, closeModal,
    }),
    [theme, toggleTheme, toast, toastKind, showToast, me, modal, openModal, closeModal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp harus dipakai di dalam <AppProvider>");
  return ctx;
}
