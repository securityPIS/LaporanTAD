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
import { SEED_OVERTIME } from "./mock-data";
import type { Overtime } from "./types";

type Theme = "light" | "dark";
type ModalKind = "lembur" | "cuti" | "gen" | null;

interface AppStore {
  theme: Theme;
  toggleTheme: () => void;

  toast: string;
  showToast: (msg: string) => void;

  overtime: Overtime[];
  addOvertime: (o: Omit<Overtime, "id">) => void;
  deleteOvertime: (id: string) => void;

  modal: ModalKind;
  openModal: (m: Exclude<ModalKind, null>) => void;
  closeModal: () => void;
}

const Ctx = createContext<AppStore | null>(null);

const THEME_KEY = "ltad-theme";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [toast, setToast] = useState("");
  const [overtime, setOvertime] = useState<Overtime[]>(SEED_OVERTIME);
  const [modal, setModal] = useState<ModalKind>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sinkronkan tema awal dari atribut <html> yang sudah diset skrip no-flash.
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
      /* localStorage tak tersedia — abaikan */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "light" ? "dark" : "light");
  }, [theme, applyTheme]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const addOvertime = useCallback((o: Omit<Overtime, "id">) => {
    setOvertime((prev) => [{ ...o, id: "o" + Date.now() }, ...prev]);
  }, []);

  const deleteOvertime = useCallback((id: string) => {
    setOvertime((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const openModal = useCallback((m: Exclude<ModalKind, null>) => setModal(m), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo<AppStore>(
    () => ({
      theme,
      toggleTheme,
      toast,
      showToast,
      overtime,
      addOvertime,
      deleteOvertime,
      modal,
      openModal,
      closeModal,
    }),
    [theme, toggleTheme, toast, showToast, overtime, addOvertime, deleteOvertime, modal, openModal, closeModal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp harus dipakai di dalam <AppProvider>");
  return ctx;
}
