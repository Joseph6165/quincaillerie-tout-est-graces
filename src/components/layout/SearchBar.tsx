"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, User as UserIcon } from "lucide-react";
import { searchGlobal, SearchResult } from "@/lib/search";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const r = await searchGlobal(query);
        setResults(r);
        setOpen(true);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-black/[0.06] rounded-lg px-3 py-2">
        <Search size={15} className="text-ink-faint shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Rechercher un produit, un client..."
          className="bg-transparent outline-none text-sm text-ink placeholder:text-ink-faint w-full min-w-0"
        />
        <span className="text-[10px] font-mono text-ink-faint border border-black/10 rounded px-1.5 py-0.5 shrink-0">⌘K</span>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/[0.08] rounded-lg shadow-lg overflow-hidden z-30">
          {isPending && <p className="px-4 py-3 text-xs text-ink-faint font-mono">RECHERCHE...</p>}
          {!isPending && results.length === 0 && (
            <p className="px-4 py-3 text-xs text-ink-faint">Aucun résultat pour &quot;{query}&quot;.</p>
          )}
          {!isPending && results.map((r) => (
            <button key={`${r.type}-${r.id}`} onClick={() => goTo(r.href)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FAFAFA] transition-colors">
              <div className="w-7 h-7 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
                {r.type === "PRODUIT" ? <Package size={13} className="text-brand-600" /> : <UserIcon size={13} className="text-brand-600" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{r.label}</p>
                <p className="text-[11px] font-mono text-ink-faint truncate">{r.sublabel}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}