"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { AdminSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AdminTopbar({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="admin-rail-b flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-white/[0.06] dark:bg-navy-900 lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className={cn("w-72 p-0")}>
            <AdminSidebar role={role} name={name} mobile />
          </SheetContent>
        </Sheet>
        <p className="font-serif-brand text-base font-medium text-navy-950 dark:text-white lg:hidden">Admin Panel</p>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle variant="onLight" />
        <Link href="/" target="_blank" className="hidden items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 dark:text-white/50 dark:hover:text-white sm:flex">
          <ExternalLink className="h-3.5 w-3.5" /> View Website
        </Link>
        <div className="hidden items-center gap-2.5 pl-1.5 sm:flex">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[11px] font-semibold text-white dark:bg-navy-600">
            {name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((n) => n[0]?.toUpperCase())
              .join("") || "A"}
          </span>
          <p className="text-sm font-medium text-navy-950 dark:text-white">{name}</p>
        </div>
        <Badge variant="outline">{role.replace("_", " ")}</Badge>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 sm:hidden"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
