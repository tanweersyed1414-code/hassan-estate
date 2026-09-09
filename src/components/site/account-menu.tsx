"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { CalendarCheck, LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccountVisitor {
  name: string;
  email: string;
  image: string;
}

function initials(name: string, email: string) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || src[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

function UnreadDot({ count, className = "" }: { count: number; className?: string }) {
  return (
    <span
      aria-label={`${count} unread update${count === 1 ? "" : "s"}`}
      className={`inline-block h-2 w-2 rounded-full bg-red-500 ${className}`}
    />
  );
}

export function AccountMenu({
  visitor,
  variant = "bar",
  unreadCount = 0,
  onNavigate,
}: {
  visitor: AccountVisitor | null;
  /** "bar" = compact button in the header; "sheet" = full-width rows in the mobile menu. */
  variant?: "bar" | "sheet";
  /** Number of visit updates the visitor hasn't seen — drives the red dot. */
  unreadCount?: number;
  onNavigate?: () => void;
}) {
  const hasUnread = unreadCount > 0;
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // ---- Signed out ----
  if (!visitor) {
    const doSignIn = () => signIn("google", { callbackUrl: pathname || "/" });
    if (variant === "sheet") {
      return (
        <button
          onClick={doSignIn}
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-gray-50 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5"
        >
          <UserRound className="h-4 w-4" /> Sign in with Google
        </button>
      );
    }
    return (
      <button
        onClick={doSignIn}
        className="hidden h-10 items-center gap-2 rounded-full border border-gray-200 px-3.5 text-[13px] font-semibold text-navy-800 transition-colors hover:bg-gray-100 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10 sm:flex"
      >
        <UserRound className="h-[18px] w-[18px]" /> Sign in
      </button>
    );
  }

  // ---- Signed in ----
  const avatar = visitor.image ? (
    <Image src={visitor.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">
      {initials(visitor.name, visitor.email)}
    </span>
  );

  if (variant === "sheet") {
    return (
      <div className="rounded-2xl border border-gray-100 p-3 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          {avatar}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-950 dark:text-white">{visitor.name || "Signed in"}</p>
            <p className="truncate text-xs text-gray-400 dark:text-white/40">{visitor.email}</p>
          </div>
        </div>
        <Link
          href="/my-visits"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-800 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
        >
          <CalendarCheck className="h-4 w-4" /> My Visits
          {hasUnread && <UnreadDot count={unreadCount} className="ml-auto" />}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={hasUnread ? "Account menu — you have an update" : "Account menu"}
        className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
      >
        {avatar}
        {hasUnread && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-navy-950" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-warm dark:border-white/10 dark:bg-navy-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.06]">
            <p className="truncate text-sm font-semibold text-navy-950 dark:text-white">{visitor.name || "Signed in"}</p>
            <p className="truncate text-xs text-gray-400 dark:text-white/40">{visitor.email}</p>
          </div>
          <Link
            href="/my-visits"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-navy-800 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5",
              pathname === "/my-visits" && "text-gold-600 dark:text-gold-300"
            )}
          >
            <CalendarCheck className="h-4 w-4" /> My Visits
            {hasUnread && <UnreadDot count={unreadCount} className="ml-auto" />}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
