import { redirect } from "next/navigation";
import { getCurrentUser, getSessionEmail, gatePath } from "@/lib/session";
import { TopBar } from "@/components/layout/TopBar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await getSessionEmail();
  const user = await getCurrentUser();
  if (!user || user.status !== "active" || user.role !== "admin") {
    redirect(gatePath(user, Boolean(email)));
  }
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col wide:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-bg wide:h-[calc(100vh-56px)]">
          <div className="mx-auto max-w-[1240px] p-[clamp(18px,3vw,34px)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
