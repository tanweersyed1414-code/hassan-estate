"use client";

import { signIn } from "next-auth/react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignInPrompt() {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/my-visits" })}>
      <UserRound className="h-4 w-4" /> Sign in with Google
    </Button>
  );
}
