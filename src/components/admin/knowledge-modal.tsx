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
import { knowledgeCategories } from "@/lib/validations";
import type { AIKnowledgeEntry } from "@/db/schema";

export function KnowledgeModal({ entry, trigger }: { entry?: AIKnowledgeEntry; trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!entry;

  const [category, setCategory] = React.useState(entry?.category || "FAQ");
  const [question, setQuestion] = React.useState(entry?.question || "");
  const [answer, setAnswer] = React.useState(entry?.answer || "");
  const [keywords, setKeywords] = React.useState(entry?.keywords || "");
  const [isActive, setIsActive] = React.useState(entry?.isActive ?? true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/knowledge-base/${entry!.id}` : "/api/knowledge-base", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, question, answer, keywords, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save entry");
      toast.success(isEdit ? "Entry updated." : "Entry created.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Knowledge Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogTitle>{isEdit ? "Edit Knowledge Entry" : "Add Knowledge Entry"}</DialogTitle>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as never)}>
              {knowledgeCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Question / Topic</Label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>
          <div>
            <Label>Answer</Label>
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} required />
          </div>
          <div>
            <Label>Keywords (comma separated)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="installment, payment, monthly" />
          </div>
          <label className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm text-navy-900 dark:text-white">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
