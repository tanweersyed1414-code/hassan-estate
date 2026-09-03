"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { userRoles } from "@/lib/validations";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export function UserModal({ user, trigger }: { user?: UserRow; trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!user;

  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState(user?.role || "EDITOR");
  const [isActive, setIsActive] = React.useState(user?.isActive ?? true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/users/${user!.id}` : "/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined, role, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save user");
      toast.success(isEdit ? "User updated." : "User created.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>{isEdit ? "New Password (leave blank to keep current)" : "Password"}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEdit} minLength={8} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {userRoles.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm text-navy-900 dark:text-white">Active account</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
