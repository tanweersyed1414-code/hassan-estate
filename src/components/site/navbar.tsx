"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, MessageCircle, Phone, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn, telLink, whatsappLink } from "@/lib/utils";
import { useChat } from "./chat-context";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu, type AccountVisitor } from "./account-menu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/builders", label: "Builders" },
  { href: "/projects", label: "Projects" },
  { href: "/payment-plans", label: "Payment Plans" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export function Navbar({
  logoUrl,
  visitor,
  showAccount = true,
  unreadVisitUpdates = 0,
}: {
  logoUrl?: string;
  visitor?: AccountVisitor | null;
  showAccount?: boolean;
  unreadVisitUpdates?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const chat = useChat();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(searchTerm ? `/properties?q=${encodeURIComponent(searchTerm)}` : "/properties");
    setSearchOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 bg-white/90 py-3 backdrop-blur-md transition-all duration-300 dark:bg-navy-950/95",
        scrolled ? "shadow-warm-sm" : "shadow-none"
      )}
    >
      <div className="section-container flex items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Hassan Estates with Sandhu Builders"
              width={220}
              height={140}
              priority
              className="h-11 w-auto"
            />
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-serif-brand text-base font-bold text-navy-950 shadow-warm-sm">
                H
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-serif-brand text-lg font-bold text-navy-950 dark:text-white">Hassan Estates</span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-gray-400">Sandhu Builders · Top City-1</span>
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative px-4 py-2 text-[13px] font-semibold tracking-wide text-navy-800 transition-colors hover:text-gold-600 dark:text-white/75 dark:hover:text-gold-300",
                  active && "text-gold-600 dark:text-gold-300"
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-4 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-gold-500 transition-transform duration-300 ease-out group-hover:scale-x-100",
                    active && "scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            aria-label="Search properties"
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10 sm:flex"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <ThemeToggle className="hidden sm:flex" variant="onLight" />
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp us"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-gray-100 hover:text-emerald-600 dark:text-white/80 dark:hover:bg-white/10 sm:flex"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
          </a>
          <Button variant="gold" size="sm" className="ml-2 hidden md:inline-flex" onClick={chat.open}>
            <span className="h-1.5 w-1.5 rounded-full bg-navy-950" /> Ask Hassan AI
          </Button>

          {showAccount && (
            <AccountMenu visitor={visitor ?? null} variant="bar" unreadCount={unreadVisitUpdates} />
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-white/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="font-serif-brand text-lg font-bold text-navy-950 dark:text-white">Menu</span>
                <ThemeToggle variant="onLight" />
              </div>
              <nav className="mt-6 flex flex-1 flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-base font-semibold text-navy-800 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5",
                      pathname === link.href && "bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-300"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 dark:border-white/[0.06]">
                {showAccount && (
                  <AccountMenu
                    visitor={visitor ?? null}
                    variant="sheet"
                    unreadCount={unreadVisitUpdates}
                    onNavigate={() => setMobileOpen(false)}
                  />
                )}
                <Button variant="outline" onClick={() => window.open(telLink())}>
                  <Phone className="h-4 w-4" /> Call Us
                </Button>
                <Button onClick={() => window.open(whatsappLink(), "_blank")}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us
                </Button>
                <Button
                  variant="gold"
                  onClick={() => {
                    setMobileOpen(false);
                    chat.open();
                  }}
                >
                  Hassan AI Assistant
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submitSearch}
          className="section-container mt-3 hidden sm:block"
        >
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 shadow-warm dark:border-white/15 dark:bg-navy-900">
            <Input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by location, society, or property title..."
              className="rounded-full border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" variant="gold" size="icon" className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:text-white/40 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.form>
      )}
    </header>
  );
}
