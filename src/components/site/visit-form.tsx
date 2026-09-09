"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TIME_SLOTS = ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM", "6:00 PM - 8:00 PM"];

export function VisitForm({
  propertyId,
  visitorName,
  bookingEnabled = true,
}: {
  propertyId: number;
  /** Passed when the viewer is signed in with Google; undefined means signed out. */
  visitorName?: string;
  /** False while Google sign-in isn't configured yet. */
  bookingEnabled?: boolean;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const today = new Date().toISOString().split("T")[0];
  const signedIn = visitorName !== undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          phone: form.get("phone"),
          preferredDate: form.get("preferredDate"),
          preferredTime: form.get("preferredTime") || "",
          message: form.get("message") || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
      toast.success("Visit request submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  }

  if (!signedIn) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-5 text-center dark:border-white/[0.06] dark:bg-white/[0.03]">
        {bookingEnabled ? (
          <>
            <p className="text-sm text-gray-600 dark:text-white/60">
              Sign in with Google to book a visit and get notified once our team confirms it.
            </p>
            <Button
              type="button"
              className="mt-4 w-full"
              onClick={() => signIn("google", { callbackUrl: pathname || "/" })}
            >
              <UserRound className="h-4 w-4" /> Sign in with Google
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-600 dark:text-white/60">
            To arrange a visit, please call or WhatsApp our team using the buttons below.
          </p>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">Visit request received!</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          It&apos;s pending review. You&apos;ll get an email once our team confirms, and you can track it under{" "}
          <a href="/my-visits" className="font-semibold underline">
            My Visits
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {visitorName ? (
        <p className="text-xs text-gray-500 dark:text-white/50">
          Booking as <span className="font-semibold text-navy-900 dark:text-white">{visitorName}</span>
        </p>
      ) : null}
      <div>
        <Label htmlFor="v-phone">Phone</Label>
        <Input id="v-phone" name="phone" required placeholder="03XX-XXXXXXX" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="v-date">Preferred Date</Label>
          <Input id="v-date" name="preferredDate" type="date" min={today} required />
        </div>
        <div>
          <Label htmlFor="v-time">Preferred Time</Label>
          <Select id="v-time" name="preferredTime" defaultValue="">
            <option value="" disabled>
              Select a slot
            </option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="v-message">Message (optional)</Label>
        <Textarea id="v-message" name="message" placeholder="Anything we should know before your visit?" />
      </div>
      <p className="text-xs text-gray-400 dark:text-white/35">
        Submitting sends a visit request — our team reviews it and you&apos;ll be emailed when it&apos;s confirmed or
        declined.
      </p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Book a Property Visit"}
      </Button>
    </form>
  );
}
