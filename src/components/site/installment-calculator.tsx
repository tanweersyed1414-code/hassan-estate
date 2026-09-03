"use client";

import * as React from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";

export function InstallmentCalculator() {
  const [total, setTotal] = React.useState(10000000);
  const [booking, setBooking] = React.useState(1000000);
  const [down, setDown] = React.useState(2000000);
  const [months, setMonths] = React.useState(36);

  const remaining = Math.max(total - booking - down, 0);
  const monthly = months > 0 ? remaining / months : 0;

  return (
    <div className="grid gap-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900 lg:grid-cols-2 lg:p-10">
      <div>
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-300">
            <Calculator className="h-5 w-5" />
          </span>
          <h3 className="font-serif-brand text-xl font-medium text-navy-950 dark:text-white">Installment Calculator</h3>
        </div>

        <div className="space-y-6">
          <SliderField label="Total Amount" value={total} min={500000} max={100000000} step={100000} onChange={setTotal} />
          <SliderField label="Booking Amount" value={booking} min={0} max={total} step={50000} onChange={setBooking} />
          <SliderField label="Down Payment" value={down} min={0} max={total} step={50000} onChange={setDown} />
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Number of Months</Label>
              <span className="text-sm font-semibold text-navy-900 dark:text-white">{months} months</span>
            </div>
            <input
              type="range"
              min={1}
              max={120}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="brand-range w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-lg bg-navy-950 p-8 text-white">
        <p className="text-sm uppercase tracking-widest text-gold-400">Estimated Plan</p>
        <div className="mt-6 space-y-4">
          <Row label="Total Price" value={formatPKR(total)} />
          <Row label="Booking Amount" value={formatPKR(booking)} />
          <Row label="Down Payment" value={formatPKR(down)} />
          <div className="h-px bg-white/10" />
          <Row label="Remaining Amount" value={formatPKR(remaining)} />
          <Row label="Monthly Installment" value={formatPKR(monthly)} highlight />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-white/50">
          This calculation is an estimate. Final payment terms are subject to confirmation by Hassan Estates with
          Sandhu Builders.
        </p>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Label className="mb-0 shrink-0">{label}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="h-9 w-36 text-right"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="brand-range w-full"
      />
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      <span className={highlight ? "font-serif-brand text-2xl font-medium text-gold-400" : "font-medium text-white"}>
        {value}
      </span>
    </div>
  );
}
