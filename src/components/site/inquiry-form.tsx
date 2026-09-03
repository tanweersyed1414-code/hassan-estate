"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { INQUIRY_TYPE_LABELS } from "@/lib/utils";

interface Props {
  propertyId?: number;
  projectId?: number;
  defaultType?: keyof typeof INQUIRY_TYPE_LABELS;
  title?: string;
  compact?: boolean;
}

export function InquiryForm({ propertyId, projectId, defaultType = "GENERAL", title = "Send an Inquiry", compact }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email") || "",
          inquiryType: form.get("inquiryType") || defaultType,
          propertyId,
          projectId,
          message: form.get("message") || "",
          source: "WEBSITE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
      toast.success("Thank you! Your inquiry has been received.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send inquiry.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">Thank you for reaching out!</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && <h3 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">{title}</h3>}
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required placeholder="03XX-XXXXXXX" />
        </div>
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </div>
      </div>
      {!propertyId && !projectId && (
        <div>
          <Label htmlFor="inquiryType">Inquiry Type</Label>
          <Select id="inquiryType" name="inquiryType" defaultValue={defaultType}>
            {Object.entries(INQUIRY_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="Tell us what you're looking for..." />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
