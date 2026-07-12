import { StatusBar } from "@/components/shared/Icons";
import { BottomNav } from "./BottomNav";
import { PekerjaSidebar } from "./PekerjaSidebar";

/**
 * Panggung tampilan pekerja — responsif (menggantikan PhoneFrame di layout pekerja):
 * - Mobile (< 860px): aplikasi layar penuh dgn StatusBar + BottomNav (tak berubah).
 * - Desktop (>= 860px): sidebar kiri + kolom konten terpusat (tanpa bingkai telepon).
 *
 * Kolom konten selalu `relative` + tinggi tetap agar FAB (absolute) & sticky header
 * pada halaman berperilaku sama di kedua ukuran.
 */
export function PekerjaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col wide:flex-row">
      <PekerjaSidebar />

      <div className="flex min-w-0 flex-1 wide:h-[calc(100vh-56px)] wide:justify-center wide:overflow-hidden wide:bg-bg wide:px-6 wide:py-6">
        <div className="relative flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden bg-surface wide:h-full wide:max-w-[960px] wide:rounded-2xl wide:border wide:border-border wide:shadow-sm">
          {/* StatusBar palsu hanya untuk mobile */}
          <div className="wide:hidden">
            <StatusBar />
          </div>

          {children}

          {/* BottomNav hanya untuk mobile */}
          <div className="wide:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
