import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role || "EDITOR";
  const name = session?.user.name || "Admin";

  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar role={role} name={name} />
      <div className="flex flex-1 flex-col">
        <AdminTopbar name={name} role={role} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
