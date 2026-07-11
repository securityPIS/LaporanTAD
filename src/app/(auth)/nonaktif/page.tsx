import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail } from "@/lib/session";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { StatusCard } from "@/components/shared/StatusCard";

export default async function NonaktifPage() {
  if (!(await getSessionEmail())) redirect("/login");
  const u = await getCurrentUser();
  if (!u) redirect("/register");
  if (u.status !== "inactive") redirect("/");
  return (
    <StatusCard
      tone="faint"
      icon="users"
      title="Akun dinonaktifkan"
      body="Akun Anda telah dinonaktifkan oleh admin. Data historis Anda tetap tersimpan. Hubungi admin bila ini keliru."
    >
      <LogoutButton />
    </StatusCard>
  );
}
