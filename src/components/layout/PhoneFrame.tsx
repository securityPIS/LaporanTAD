import { StatusBar } from "@/components/shared/Icons";
import { BottomNav } from "./BottomNav";

/**
 * Panggung tampilan pekerja.
 * < 860px  : aplikasi layar penuh (mobile).
 * >= 860px : bingkai telepon 414px di tengah panggung (pratinjau desktop).
 * Anak (halaman) menjadi anak langsung phoneOuter — memuat area scroll +
 * FAB opsional (absolute relatif ke bingkai).
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 bg-surface wide:items-start wide:justify-center wide:overflow-auto wide:bg-stage wide:px-4 wide:py-[26px]">
      <div className="relative flex h-[calc(100vh-76px)] w-full flex-col overflow-hidden bg-surface wide:h-[min(858px,calc(100vh-128px))] wide:w-[414px] wide:rounded-[42px] wide:shadow-lg">
        <StatusBar />
        {children}
        <BottomNav />
      </div>
    </div>
  );
}

/** Kelas area scroll dalam bingkai telepon. */
export const PHONE_SCROLL = "flex-1 overflow-y-auto overflow-x-hidden";

/** Kelas FAB (tombol aksi mengambang) — absolute relatif ke bingkai. */
export const FAB_CLASS =
  "clay-press absolute right-[18px] bottom-[90px] z-[8] flex h-[52px] items-center gap-2 rounded-2xl border-none bg-accent px-5 text-sm font-extrabold text-white shadow-lg transition-all";
