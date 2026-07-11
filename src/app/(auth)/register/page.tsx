import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail } from "@/lib/session";
import { listCompanies, listOptions } from "@/repositories/masters";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login");
  const u = await getCurrentUser();
  if (u && (u.status === "active" || u.status === "pending")) redirect("/");

  const [companies, lokasi, divisi, bagian, shift, hubungan] = await Promise.all([
    listCompanies(),
    listOptions("lokasi"),
    listOptions("divisi"),
    listOptions("bagian"),
    listOptions("shift"),
    listOptions("hubungan_darurat"),
  ]);

  return (
    <RegisterForm
      email={email}
      prefill={u ?? null}
      companies={companies.filter((c) => c.active).map((c) => ({ id: c.id, nama: c.nama }))}
      options={{
        lokasi: lokasi.filter((o) => o.active).map((o) => o.nilai),
        divisi: divisi.filter((o) => o.active).map((o) => o.nilai),
        bagian: bagian.filter((o) => o.active).map((o) => o.nilai),
        shift: shift.filter((o) => o.active).map((o) => o.nilai),
        hubungan: hubungan.filter((o) => o.active).map((o) => o.nilai),
      }}
    />
  );
}
