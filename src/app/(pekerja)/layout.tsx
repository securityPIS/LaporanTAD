import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail, gatePath } from "@/lib/session";
import { TopBar } from "@/components/layout/TopBar";
import { PekerjaShell } from "@/components/layout/PekerjaShell";
import { PekerjaSidebar } from "@/components/layout/PekerjaSidebar";
import { ModalHost } from "@/components/forms/ModalHost";

// Gerbang server: hanya pengguna aktif yang boleh mengakses halaman pekerja.
export default async function PekerjaLayout({ children }: { children: React.ReactNode }) {
  const email = await getSessionEmail();
  const user = await getCurrentUser();
  if (!user || user.status !== "active") redirect(gatePath(user, Boolean(email)));

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text wide:h-screen wide:flex-row wide:justify-center wide:gap-[10px] wide:overflow-hidden wide:px-[clamp(10px,3vw,22px)]">
      <PekerjaSidebar />

      {/* Kolom terpusat: top bar + kotak konten berbagi lebar (max 980px) & posisi yang sama */}
      <div className="flex w-full min-w-0 flex-col wide:h-screen wide:max-w-[980px] wide:flex-1 wide:pb-3">
        <TopBar columnFramed />
        <PekerjaShell>{children}</PekerjaShell>
      </div>

      <ModalHost />
    </div>
  );
}
