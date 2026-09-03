"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TIME_SLOTS = ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM", "6:00 PM - 8:00 PM"];

export function VisitForm({ propertyId }: { propertyId: number }) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const today = new Date().toISOString().split("T")[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email") || "",
          propertyId,
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

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">Visit request received!</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          Our team will contact you to confirm your visit — this is not an automatic confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="v-name">Full Name</Label>
        <Input id="v-name" name="name" required placeholder="Your name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="v-phone">Phone</Label>
          <Input id="v-phone" name="phone" required placeholder="03XX-XXXXXXX" />
        </div>
        <div>
          <Label htmlFor="v-email">Email (optional)</Label>
          <Input id="v-email" name="email" type="email" placeholder="you@example.com" />
        </div>
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
        Submitting this form sends a visit request only — our team will confirm your appointment by phone or
        WhatsApp.
      </p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Book a Property Visit"}
      </Button>
    </form>
  );
}
