import { redirect } from "next/navigation";
import { isGoogleAuthConfigured } from "@/lib/env";
import { getSessionEmail } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  // Sudah login → biarkan gerbang status mengarahkan.
  if (await getSessionEmail()) redirect("/");
  return <LoginForm googleEnabled={isGoogleAuthConfigured()} />;
}
