import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col wide:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto bg-bg wide:h-[calc(100vh-56px)]">
        <div className="mx-auto max-w-[1240px] p-[clamp(18px,3vw,34px)]">{children}</div>
      </main>
    </div>
  );
}
