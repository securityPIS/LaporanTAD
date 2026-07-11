import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail } from "@/lib/session";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { StatusCard } from "@/components/shared/StatusCard";

export default async function DitolakPage() {
  if (!(await getSessionEmail())) redirect("/login");
  const u = await getCurrentUser();
  if (!u) redirect("/register");
  if (u.status !== "rejected") redirect("/");
  return (
    <StatusCard
      tone="libur"
      icon="close"
      title="Pendaftaran ditolak"
      body={`Alasan: ${u.alasan_tolak || "—"}. Anda dapat memperbaiki data dan mengajukan ulang.`}
    >
      <Link
        href="/register"
        className="flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-extrabold text-white"
      >
        Perbaiki & ajukan ulang
      </Link>
      <LogoutButton />
    </StatusCard>
  );
}
