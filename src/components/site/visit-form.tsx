"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { CalendarCheck, CheckCircle2, Clock3, UserRound, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TIME_SLOTS = ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM", "6:00 PM - 8:00 PM"];

export interface ExistingVisitRequest {
  status: "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  preferredDate: string | null;
  preferredTime: string;
  adminNote: string;
}

export function VisitForm({
  propertyId,
  visitorName,
  bookingEnabled = true,
  existingRequest = null,
}: {
  propertyId: number;
  /** Passed when the viewer is signed in with Google; undefined means signed out. */
  visitorName?: string;
  /** False while Google sign-in isn't configured yet. */
  bookingEnabled?: boolean;
  /** The visitor's most recent request for THIS property, if any. */
  existingRequest?: ExistingVisitRequest | null;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [rebooking, setRebooking] = React.useState(false);
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

  // ---- Signed out ----
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

  // ---- Just submitted ----
  if (submitted) {
    return <StatusCard status="NEW" />;
  }

  // ---- Existing request for this property ----
  if (existingRequest && !rebooking) {
    const isFinished = existingRequest.status === "CANCELLED" || existingRequest.status === "COMPLETED";
    return (
      <div className="space-y-3">
        <StatusCard
          status={existingRequest.status}
          preferredDate={existingRequest.preferredDate}
          preferredTime={existingRequest.preferredTime}
          adminNote={existingRequest.adminNote}
        />
        {isFinished ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => setRebooking(true)}>
            Book another visit
          </Button>
        ) : null}
      </div>
    );
  }

  // ---- The booking form ----
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

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function StatusCard({
  status,
  preferredDate = null,
  preferredTime = "",
  adminNote = "",
}: {
  status: ExistingVisitRequest["status"];
  preferredDate?: string | null;
  preferredTime?: string;
  adminNote?: string;
}) {
  const config = {
    NEW: {
      cls: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
      icon: <Clock3 className="h-5 w-5" />,
      title: "Visit request pending review",
      body: "Our team is reviewing your request. You'll get an email once it's confirmed — no need to book again.",
    },
    CONFIRMED: {
      cls: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Visit confirmed — check your inbox",
      body: "Your visit to this property is confirmed. We've emailed you the details.",
    },
    COMPLETED: {
      cls: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Visit completed",
      body: "You've already visited this property with us. Book another time if you'd like to come again.",
    },
    CANCELLED: {
      cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
      icon: <XCircle className="h-5 w-5" />,
      title: "Previous request cancelled",
      body: "Your last request for this property couldn't go ahead. You're welcome to book a new time.",
    },
  }[status];

  return (
    <div className={`rounded-lg border p-5 ${config.cls}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <p className="font-semibold">{config.title}</p>
      </div>
      <p className="mt-1.5 text-sm opacity-90">{config.body}</p>
      {(preferredDate || preferredTime) && (status === "NEW" || status === "CONFIRMED") ? (
        <p className="mt-2 text-sm font-medium">
          {fmtDate(preferredDate)}
          {preferredTime ? ` · ${preferredTime}` : ""}
        </p>
      ) : null}
      {adminNote ? (
        <p className="mt-2 rounded-md bg-white/50 p-2 text-sm dark:bg-black/20">
          <span className="font-semibold">From our team:</span> {adminNote}
        </p>
      ) : null}
      <Link
        href="/my-visits"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2"
      >
        <CalendarCheck className="h-3.5 w-3.5" /> View in My Visits
      </Link>
    </div>
  );
}
