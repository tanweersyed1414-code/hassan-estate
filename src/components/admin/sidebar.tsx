"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  HardHat,
  Wallet,
  MessagesSquare,
  CalendarCheck,
  BrainCircuit,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  PanelLeftClose,
} from "lucide-react";
import { Sidebar, DesktopSidebar, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/projects", label: "Construction Projects", icon: HardHat },
  { href: "/admin/payment-plans", label: "Payment Plans", icon: Wallet },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessagesSquare },
  { href: "/admin/visits", label: "Property Visits", icon: CalendarCheck },
  { href: "/admin/knowledge-base", label: "AI Knowledge Base", icon: BrainCircuit },
];

const SUPER_ADMIN_NAV = [
  { href: "/admin/users", label: "Users & Roles", icon: Users },
  { href: "/admin/settings", label: "Website Content", icon: Settings },
];

const PIN_KEY = "admin-sidebar-pinned";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "A"
  );
}

/** Text that fades / collapses away as the rail shrinks to an icon strip. */
function RevealLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, animate } = useSidebar();
  return (
    <motion.span
      initial={false}
      animate={{
        display: animate ? (open ? "inline-block" : "none") : "inline-block",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className={cn("whitespace-pre", className)}
    >
      {children}
    </motion.span>
  );
}

/** One row: icon chip stays put, label is revealed on expand. */
function Row({
  href,
  label,
  icon: Icon,
  active = false,
  danger = false,
  external = false,
  onClick,
}: {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  danger?: boolean;
  external?: boolean;
  onClick?: () => void;
}) {
  const base = cn(
    "group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors",
    danger
      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
      : active
        ? "bg-navy-900 text-white shadow-md shadow-navy-900/20 dark:bg-navy-600"
        : "text-gray-600 hover:bg-gray-50 dark:text-white/60 dark:hover:bg-white/5"
  );

  const inner = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-white/15 text-gold-300"
            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 dark:bg-white/5 dark:text-white/40 dark:group-hover:bg-white/10"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <RevealLabel>{label}</RevealLabel>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={label} className={base}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} title={label} target={external ? "_blank" : undefined} className={base}>
      {inner}
    </Link>
  );
}

/** Shared contents for both the collapsible desktop rail and the mobile drawer. */
function SidebarContents({
  role,
  name,
  pinned,
  onTogglePin,
}: {
  role: string;
  name: string;
  pinned?: boolean;
  onTogglePin?: () => void;
}) {
  const pathname = usePathname();
  const { open, animate } = useSidebar();
  const expanded = open || !animate;

  return (
    <div className="flex h-full flex-col">
      {/* Brand + pin toggle */}
      <div className="flex h-12 items-center gap-2 overflow-hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          {expanded ? (
            <Image
              src="/brand/logo.png"
              alt="Hassan & Sandhu"
              width={140}
              height={90}
              priority
              className="h-8 w-auto shrink-0"
            />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-900 font-serif-brand text-sm font-bold text-gold-300 dark:bg-navy-600">
              H
            </span>
          )}
          <RevealLabel className="font-serif-brand text-sm font-medium text-navy-950 dark:text-white">
            Admin Panel
          </RevealLabel>
        </Link>

        {animate && open && onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            title={pinned ? "Collapse to icons" : "Keep sidebar open"}
            aria-pressed={pinned}
            className="ml-auto shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-navy-900 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <PanelLeftClose className={cn("h-4 w-4 transition-transform", !pinned && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV.map((item) => (
          <Row
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
          />
        ))}

        {role === "SUPER_ADMIN" && (
          <div className="pt-3">
            <RevealLabel className="block px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
              Administration
            </RevealLabel>
            {SUPER_ADMIN_NAV.map((item) => (
              <Row
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Account + actions */}
      <div className="mt-2 space-y-1 border-t border-gray-100 pt-3 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-semibold text-white dark:bg-navy-600">
            {initials(name)}
          </span>
          <motion.div
            initial={false}
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="min-w-0 flex-1"
          >
            <p className="truncate text-sm font-medium text-navy-950 dark:text-white">{name}</p>
            <p className="truncate text-[11px] text-gray-400 dark:text-white/40">{role.replace("_", " ")}</p>
          </motion.div>
        </div>
        <Row href="/" label="View Website" icon={ExternalLink} external />
        <Row label="Sign Out" icon={LogOut} danger onClick={() => signOut({ callbackUrl: "/admin/login" })} />
      </div>
    </div>
  );
}

export function AdminSidebar({
  role,
  name = "Admin",
  mobile = false,
}: {
  role: string;
  name?: string;
  mobile?: boolean;
}) {
  // Mobile: rendered inside the topbar's slide-in sheet — always full width, no collapse.
  if (mobile) {
    return (
      <Sidebar open setOpen={() => {}} animate={false}>
        <div className="flex h-full w-full flex-col bg-white p-4 dark:bg-navy-900">
          <SidebarContents role={role} name={name} />
        </div>
      </Sidebar>
    );
  }

  return <CollapsibleRail role={role} name={name} />;
}

const PIN_EVENT = "admin-sidebar-pin-change";

function subscribePin(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PIN_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PIN_EVENT, callback);
  };
}

function readPin() {
  try {
    return localStorage.getItem(PIN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Persisted "keep the rail open" flag, read via an external store so there's
 *  no setState-in-effect and no hydration mismatch (server snapshot = false). */
function usePinned(): [boolean, () => void] {
  const pinned = React.useSyncExternalStore(subscribePin, readPin, () => false);
  const toggle = React.useCallback(() => {
    try {
      localStorage.setItem(PIN_KEY, readPin() ? "0" : "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(PIN_EVENT));
  }, []);
  return [pinned, toggle];
}

function CollapsibleRail({ role, name }: { role: string; name: string }) {
  const reduce = useReducedMotion();
  // The rail is open when hovered OR pinned. The primitive's mouse handlers
  // drive `hovered`; the pin button toggles `pinned` (persisted).
  const [hovered, setHovered] = React.useState(false);
  const [pinned, togglePin] = usePinned();

  const open = pinned || hovered;
  const animated = !reduce;

  return (
    <Sidebar open={open} setOpen={setHovered} animate={animated}>
      <DesktopSidebar
        className="admin-rail-r sticky top-0 z-20 !hidden h-screen border-r border-gray-200 !bg-white !px-3 !py-4 lg:!flex lg:!flex-col dark:border-white/[0.06] dark:!bg-navy-900"
        initial={false}
        animate={{ width: !animated || open ? "16rem" : "4.5rem" }}
        transition={
          animated
            ? { type: "spring", stiffness: 320, damping: 34, mass: 0.7 }
            : { duration: 0 }
        }
      >
        <SidebarContents role={role} name={name} pinned={pinned} onTogglePin={togglePin} />
      </DesktopSidebar>
    </Sidebar>
  );
}
