"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = React.useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1 text-xs font-medium text-navy-900 dark:bg-white/10 dark:text-white">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={placeholder || "Type and press Enter to add"}
        className="mt-2"
      />
    </div>
  );
}
