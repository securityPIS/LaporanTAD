import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail, gatePath } from "@/lib/session";
import { TopBar } from "@/components/layout/TopBar";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { ModalHost } from "@/components/forms/ModalHost";

// Gerbang server: hanya pengguna aktif yang boleh mengakses halaman pekerja.
export default async function PekerjaLayout({ children }: { children: React.ReactNode }) {
  const email = await getSessionEmail();
  const user = await getCurrentUser();
  if (!user || user.status !== "active") redirect(gatePath(user, Boolean(email)));

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <TopBar />
      <PhoneFrame>{children}</PhoneFrame>
      <ModalHost />
    </div>
  );
}
