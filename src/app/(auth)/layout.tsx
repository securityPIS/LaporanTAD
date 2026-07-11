import { Icon } from "@/components/shared/Icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-accent shadow-sm">
          <Icon name="logo" size={21} strokeWidth={2.4} style={{ color: "#fff" }} />
        </div>
        <div>
          <div className="text-[19px] font-extrabold tracking-[-.3px] text-text">LaporanTAD</div>
          <div className="text-[11px] font-semibold uppercase tracking-[.3px] text-faint">
            Administrasi Pekerja TAD
          </div>
        </div>
      </div>
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  );
}
