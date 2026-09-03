import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hour sessions
  pages: {
    signIn: "/admin/login",
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        // Basic brute-force throttling per email.
        const rl = checkRateLimit(`login:${email}`, { limit: 8, windowMs: 5 * 60 * 1000 });
        if (!rl.success) {
          throw new Error("Too many login attempts. Please try again in a few minutes.");
        }

        const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
