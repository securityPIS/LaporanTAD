import { getCurrentUser } from "@/lib/session";
import { listOptions } from "@/repositories/masters";
import { ProfilForm } from "./ProfilForm";

export default async function ProfilPage() {
  const u = await getCurrentUser();
  if (!u) return null;
  const [hubungan, shift] = await Promise.all([listOptions("hubungan_darurat"), listOptions("shift")]);
  return (
    <ProfilForm
      user={u}
      hubungan={hubungan.filter((o) => o.active).map((o) => o.nilai)}
      shift={shift.filter((o) => o.active).map((o) => o.nilai)}
    />
  );
}
