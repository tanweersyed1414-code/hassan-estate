import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-navy-900 hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-gray-300 dark:text-white/30">…</span>}
          <Link
            href={hrefFor(p)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
              p === page ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/10"
            }`}
          >
            {p}
          </Link>
        </React.Fragment>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-navy-900 hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
