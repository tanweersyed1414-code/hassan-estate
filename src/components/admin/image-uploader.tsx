"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploaderImage {
  url: string;
  kind?: "GALLERY" | "BEFORE" | "AFTER";
}

interface Props {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
  featuredImage?: string;
  onFeaturedChange?: (url: string) => void;
  withKind?: boolean;
}

export function ImageUploader({ images, onChange, featuredImage, onFeaturedChange, withKind }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragIndex = React.useRef<number | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    const uploaded: UploaderImage[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({ url: data.url, kind: "GALLERY" });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    }
    onChange([...images, ...uploaded]);
    if (!featuredImage && uploaded[0] && onFeaturedChange) onFeaturedChange(uploaded[0].url);
    setUploading(false);
  }

  function removeAt(i: number) {
    const removed = images[i];
    const next = images.filter((_, idx) => idx !== i);
    onChange(next);
    // If the image being removed was the featured one, move "featured" to
    // whatever is now first so the card / homepage image never points at a
    // deleted file.
    if (onFeaturedChange && removed?.url === featuredImage) {
      onFeaturedChange(next[0]?.url || "");
    }
  }

  function setKind(i: number, kind: UploaderImage["kind"]) {
    const next = images.map((img, idx) => (idx === i ? { ...img, kind } : img));
    onChange(next);
  }

  function onDrop(i: number) {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, moved);
    onChange(next);
    dragIndex.current = null;
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10" : "border-gray-200 hover:border-gray-300 dark:border-white/15 dark:hover:border-white/25"
        )}
      >
        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gold-600" /> : <ImagePlus className="h-6 w-6 text-gray-400 dark:text-white/30" />}
        <p className="text-sm text-gray-500 dark:text-white/50">
          <span className="font-medium text-navy-900 dark:text-white">Click to upload</span> or drag and drop images
        </p>
        <p className="text-xs text-gray-400 dark:text-white/40">JPG, PNG, WEBP or GIF, up to 8MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.url + i}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/5"
            >
              <Image src={img.url} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px" className="object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1.5">
                  {onFeaturedChange && (
                    <button
                      type="button"
                      title="Set as featured image"
                      onClick={() => onFeaturedChange(img.url)}
                      className={cn(
                        "rounded-full p-1.5 text-white hover:bg-white/20",
                        featuredImage === img.url && "bg-gold-500 text-navy-950"
                      )}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => removeAt(i)}
                    className="rounded-full p-1.5 text-white hover:bg-white/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="cursor-grab rounded-full p-1.5 text-white/70">
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                </div>
                {withKind && (
                  <select
                    value={img.kind}
                    onChange={(e) => setKind(i, e.target.value as UploaderImage["kind"])}
                    className="rounded-md border-0 bg-white/90 px-1.5 py-0.5 text-[11px] text-navy-900"
                  >
                    <option value="GALLERY">Gallery</option>
                    <option value="BEFORE">Before</option>
                    <option value="AFTER">After</option>
                  </select>
                )}
              </div>
              {featuredImage === img.url && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-semibold text-navy-950">
                  Featured
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
