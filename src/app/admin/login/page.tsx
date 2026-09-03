"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <Image
            src="/brand/logo.png"
            alt="Hassan & Sandhu Estate | Builders"
            width={280}
            height={180}
            priority
            className="mx-auto h-20 w-auto"
          />
          <h1 className="mt-4 font-serif-brand text-xl font-semibold text-white">Admin Panel</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-white/70">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hassanestates.pk"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label className="text-white/70">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
