import { BottomNav } from "./BottomNav";

/**
 * Kotak konten utama tampilan pekerja.
 * - Mobile (< 860px): aplikasi layar penuh dgn BottomNav (fixed di bawah).
 * - Desktop (>= 860px): kartu mengambang (rounded + shadow) yang mengisi tinggi
 *   kolom terpusat; lebar & posisi kolom diatur oleh layout pekerja.
 *
 * Selalu `relative` + tinggi tetap agar FAB (absolute) & sticky header pada
 * halaman berperilaku sama di kedua ukuran.
 */
export function PekerjaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[calc(100vh-76px)] w-full min-w-0 flex-col overflow-hidden bg-surface wide:h-auto wide:min-h-0 wide:flex-1 wide:rounded-3xl wide:shadow-lg">
      {children}

      {/* BottomNav hanya untuk mobile */}
      <div className="wide:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
