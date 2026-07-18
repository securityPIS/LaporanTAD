import { BottomNav } from "./BottomNav";
import { PekerjaSidebar } from "./PekerjaSidebar";

/**
 * Panggung tampilan pekerja — responsif (menggantikan PhoneFrame di layout pekerja):
 * - Mobile (< 860px): aplikasi layar penuh dgn BottomNav (fixed di bawah).
 * - Desktop (>= 860px): sidebar kiri + kolom konten terpusat (tanpa bingkai telepon).
 *
 * Kolom konten selalu `relative` + tinggi tetap agar FAB (absolute) & sticky header
 * pada halaman berperilaku sama di kedua ukuran.
 */
export function PekerjaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col wide:flex-row">
      <PekerjaSidebar />

      <div className="flex min-w-0 flex-1 wide:h-[calc(100vh-76px)] wide:justify-center wide:overflow-hidden wide:bg-bg wide:pr-[clamp(10px,3vw,22px)] wide:py-3 wide:pl-2">
        <div className="relative flex h-[calc(100vh-76px)] w-full flex-col overflow-hidden bg-surface wide:h-full wide:max-w-[980px] wide:rounded-3xl wide:shadow-lg">
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
