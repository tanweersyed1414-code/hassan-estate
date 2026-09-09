import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

// Google sign-in is for public visitors only (booking property visits).
// It is enabled once AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are set.
const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const providers: NextAuthConfig["providers"] = [
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
];

if (googleEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

/** Upsert a public visitor by email on Google sign-in; returns the row id. */
async function upsertVisitor(input: { email: string; name: string; image: string; googleSub: string }) {
  const email = input.email.trim().toLowerCase();
  const [existing] = await db.select().from(schema.visitors).where(eq(schema.visitors.email, email)).limit(1);
  if (existing) {
    await db
      .update(schema.visitors)
      .set({
        name: input.name || existing.name,
        image: input.image || existing.image,
        googleSub: input.googleSub || existing.googleSub,
        lastLoginAt: new Date(),
      })
      .where(eq(schema.visitors.id, existing.id));
    return existing.id;
  }
  const [created] = await db
    .insert(schema.visitors)
    .values({ email, name: input.name, image: input.image, googleSub: input.googleSub, lastLoginAt: new Date() })
    .returning();
  return created.id;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hour sessions
  pages: {
    signIn: "/admin/login",
  },
  trustHost: true,
  providers,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Admin sign-in (email + password)
      if (user && account?.provider === "credentials") {
        token.kind = "admin";
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      // Public visitor sign-in (Google)
      if (account?.provider === "google" && profile?.email) {
        const visitorId = await upsertVisitor({
          email: profile.email,
          name: (profile.name as string) || "",
          image: (profile.picture as string) || (profile.image as string) || "",
          googleSub: account.providerAccountId || "",
        });
        token.kind = "visitor";
        token.visitorId = String(visitorId);
        token.id = String(visitorId);
        token.role = undefined;
        token.name = (profile.name as string) || token.name;
        token.picture = (profile.picture as string) || token.picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          id?: string;
          role?: string;
          kind?: "admin" | "visitor";
          visitorId?: string;
        };
        u.id = token.id as string;
        u.role = token.role as string | undefined;
        u.kind = token.kind as "admin" | "visitor" | undefined;
        u.visitorId = token.visitorId as string | undefined;
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
