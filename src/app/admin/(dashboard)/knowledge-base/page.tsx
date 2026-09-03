import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { KnowledgeModal } from "@/components/admin/knowledge-modal";
import { ActiveToggle } from "@/components/admin/active-toggle";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgeBasePage() {
  const entries = await db.select().from(schema.aiKnowledgeBase).orderBy(desc(schema.aiKnowledgeBase.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">AI Knowledge Base</h1>
          <p className="text-sm text-gray-500 dark:text-white/50">
            {entries.length} entries — powers the Hassan AI Assistant&apos;s verified answers
          </p>
        </div>
        <KnowledgeModal />
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="admin-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge variant="outline">{entry.category}</Badge>
                  {!entry.isActive && <Badge variant="neutral">Inactive</Badge>}
                </div>
                <p className="font-medium text-navy-950 dark:text-white">{entry.question}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{entry.answer}</p>
                {entry.keywords && <p className="mt-2 text-xs text-gray-400 dark:text-white/40">Keywords: {entry.keywords}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ActiveToggle url={`/api/knowledge-base/${entry.id}`} active={entry.isActive} />
                <KnowledgeModal
                  entry={entry}
                  trigger={
                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-navy-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10">
                      <Pencil className="h-4 w-4" />
                    </button>
                  }
                />
                <DeleteButton url={`/api/knowledge-base/${entry.id}`} label="entry" />
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400 dark:border-white/[0.06] dark:text-white/40">
            No knowledge base entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
