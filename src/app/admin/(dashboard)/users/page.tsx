import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { UserModal } from "@/components/admin/user-modal";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      lastLoginAt: schema.users.lastLoginAt,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Users &amp; Roles</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">Manage admin panel access</p>
        </div>
        <UserModal />
      </div>

      <div className="admin-card overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Login</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-white/5">
                <td className="px-5 py-3 font-medium text-navy-950 dark:text-white">{u.name}</td>
                <td className="px-5 py-3 text-gray-600 dark:text-white/60">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline">{u.role.replace("_", " ")}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={u.isActive ? "success" : "neutral"}>{u.isActive ? "Active" : "Disabled"}</Badge>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400 dark:text-white/40">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <UserModal
                      user={u}
                      trigger={
                        <button className="flex h-8 w-8 items-center justify-center rounded-full text-navy-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10">
                          <Pencil className="h-4 w-4" />
                        </button>
                      }
                    />
                    <DeleteButton url={`/api/users/${u.id}`} label="user" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
