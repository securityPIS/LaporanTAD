import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail } from "@/lib/session";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { StatusCard } from "@/components/shared/StatusCard";

export default async function MenungguPage() {
  if (!(await getSessionEmail())) redirect("/login");
  const u = await getCurrentUser();
  if (!u) redirect("/register");
  if (u.status !== "pending") redirect("/");
  return (
    <StatusCard
      tone="cuti"
      icon="clock"
      title="Menunggu verifikasi admin"
      body={`Terima kasih, ${u.nama_lengkap}. Pendaftaran Anda telah kami terima dan sedang menunggu persetujuan admin. Anda akan langsung masuk ke beranda saat login berikutnya setelah disetujui.`}
    >
      <LogoutButton />
    </StatusCard>
  );
}
