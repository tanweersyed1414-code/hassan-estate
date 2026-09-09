import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // ---- Security headers (defense in depth; see next.config for CSP) ----
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  // ---- Admin route protection ----
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const session = req.auth;
    // Only staff accounts (email/password) may enter /admin — never public
    // Google visitors, even though they hold a valid session.
    if (!session?.user || session.user.kind !== "admin") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role gating for sensitive areas: only SUPER_ADMIN may manage users/settings.
    const restrictedToSuperAdmin = pathname.startsWith("/admin/users") || pathname.startsWith("/admin/settings");
    if (restrictedToSuperAdmin && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin?error=forbidden", req.url));
    }
  }

  return res;
});

export const config = {
  matcher: [
    /*
     * Match all paths except static assets, images, and internal Next.js paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
