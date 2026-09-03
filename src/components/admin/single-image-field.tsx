"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}

export function SingleImageField({ label, hint, value, onChange }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mb-2 text-xs text-gray-400 dark:text-white/40">{hint}</p>}
      <div className="flex items-center gap-4">
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex h-24 w-36 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-gray-300 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25"
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gold-600" />
          ) : value ? (
            <Image src={value} alt={label} fill sizes="144px" className="object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-gray-400 dark:text-white/30" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy-900 hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
          >
            {value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
