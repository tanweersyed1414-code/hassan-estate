import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** "admin" = staff (email/password). "visitor" = public user (Google). */
      kind?: "admin" | "visitor";
      role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
      /** Set only for kind === "visitor" — the visitors table row id. */
      visitorId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    kind?: "admin" | "visitor";
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
    id?: string;
    visitorId?: string;
  }
}
