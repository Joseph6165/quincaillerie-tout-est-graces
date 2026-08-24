"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-black/10 text-ink-soft disabled:opacity-30 hover:bg-black/[0.02] transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-faint text-xs">...</span>}
          <button
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
              p === page ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-black/[0.03]"
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-black/10 text-ink-soft disabled:opacity-30 hover:bg-black/[0.02] transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}