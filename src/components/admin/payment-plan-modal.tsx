"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PaymentPlan, Property } from "@/db/schema";

export function PaymentPlanModal({ plan, properties, trigger }: { plan?: PaymentPlan; properties: Property[]; trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!plan;

  const [title, setTitle] = React.useState(plan?.title || "");
  const [propertyId, setPropertyId] = React.useState(plan?.propertyId ? String(plan.propertyId) : "");
  const [totalPrice, setTotalPrice] = React.useState(plan?.totalPrice || "");
  const [bookingAmount, setBookingAmount] = React.useState(plan?.bookingAmount || "0");
  const [downPayment, setDownPayment] = React.useState(plan?.downPayment || "0");
  const [numberOfInstallments, setNumberOfInstallments] = React.useState(plan?.numberOfInstallments || 36);
  const [notes, setNotes] = React.useState(plan?.notes || "");
  const [isActive, setIsActive] = React.useState(plan?.isActive ?? true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      propertyId: propertyId ? Number(propertyId) : null,
      totalPrice: Number(totalPrice) || 0,
      bookingAmount: Number(bookingAmount) || 0,
      downPayment: Number(downPayment) || 0,
      numberOfInstallments: Number(numberOfInstallments) || 0,
      notes,
      isActive,
    };

    try {
      const res = await fetch(isEdit ? `/api/payment-plans/${plan!.id}` : "/api/payment-plans", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save plan");
      toast.success(isEdit ? "Plan updated." : "Plan created.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Payment Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogTitle>{isEdit ? "Edit Payment Plan" : "Add Payment Plan"}</DialogTitle>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <Label>Plan Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Attach to Property (optional)</Label>
            <Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
              <option value="">None</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Price (PKR)</Label>
              <Input type="number" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} required />
            </div>
            <div>
              <Label>Number of Installments</Label>
              <Input type="number" value={numberOfInstallments} onChange={(e) => setNumberOfInstallments(Number(e.target.value))} />
            </div>
            <div>
              <Label>Booking Amount</Label>
              <Input type="number" value={bookingAmount} onChange={(e) => setBookingAmount(e.target.value)} />
            </div>
            <div>
              <Label>Down Payment</Label>
              <Input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Additional Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <label className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm text-navy-900 dark:text-white">Active (visible on website)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
