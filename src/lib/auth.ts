import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { env, isGoogleAuthConfigured } from "./env";

// Provider: Google OAuth di produksi (satu-satunya metode masuk, FR-AUTH-01).
// Bila Google belum dikonfigurasi (dev/demo), sediakan Credentials "dev" agar
// alur onboarding tetap dapat diuji tanpa kredensial nyata.
const providers: NextAuthConfig["providers"] = [];

if (isGoogleAuthConfigured()) {
  providers.push(
    Google({
      clientId: env.googleId!,
      clientSecret: env.googleSecret!,
      authorization: { params: { prompt: "select_account" } },
    }),
  );
} else {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Nama", type: "text" },
      },
      // Mode dev: menerima identitas apa pun (meniru Google), gerbang
      // status ditangani oleh lapisan otorisasi berbasis data `users`.
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        if (!email) return null;
        const name = String(creds?.name ?? "") || email.split("@")[0];
        return { id: email, email, name };
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  secret: env.authSecret ?? "dev-insecure-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email as string;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
