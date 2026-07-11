import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail, gatePath } from "@/lib/session";

// Gerbang status onboarding (alur 4.1): arahkan sesuai status akun.
export default async function Home() {
  const email = await getSessionEmail();
  const user = await getCurrentUser();
  redirect(gatePath(user, Boolean(email)));
}
