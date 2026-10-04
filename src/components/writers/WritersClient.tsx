"use client";

// ─────────────────────────────────────────────────────────────
//  My Writers
//  – Full author directory derived from the book catalogue
//  – Search by name, click through to the author's books
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { PenTool, Search, BookOpen, ChevronRight } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import { useMemo, useState } from "react";

interface AuthorEntry {
  name: string;
  bio: string;
  imageUrl: string;
  bookCount: number;
  bookIds: string[];
}

/** Deduplicate authors from the book catalogue */
function buildAuthorDirectory(): AuthorEntry[] {
  const map = new Map<string, AuthorEntry>();
  for (const book of mockBooks) {
    const existing = map.get(book.author);
    if (existing) {
      existing.bookCount += 1;
      existing.bookIds.push(book.id);
    } else {
      map.set(book.author, {
        name: book.author,
        bio: book.authorBio,
        imageUrl: book.authorImage,
        bookCount: 1,
        bookIds: [book.id],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

const ALL_AUTHORS = buildAuthorDirectory();

export default function WritersClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_AUTHORS;
    return ALL_AUTHORS.filter((a) => a.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full">
      {/* ── Heading ── */}
      <div className="flex items-center gap-2 mb-6">
        <PenTool className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold text-zinc-100">My Writers</h1>
        <span className="ml-auto text-sm text-zinc-400">
          {ALL_AUTHORS.length} author{ALL_AUTHORS.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search authors…"
          aria-label="Search authors"
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition"
        />
      </div>

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <PenTool className="w-14 h-14 text-zinc-600 mb-4" />
          <p className="text-zinc-300 font-semibold">No authors found</p>
          <p className="text-zinc-500 text-sm mt-1">
            Try a different search term.
          </p>
        </div>
      )}

      {/* ── Author cards ── */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((author) => (
            <article
              key={author.name}
              className="flex items-start gap-4 bg-[#1E1E1E] border border-zinc-800 rounded-2xl px-4 py-4 hover:border-zinc-700 transition-colors"
            >
              {/* Avatar */}
              <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-zinc-700">
                <Image
                  src={author.imageUrl}
                  alt={author.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {author.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {author.bio}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-400">
                    {author.bookCount} book{author.bookCount !== 1 ? "s" : ""} in catalogue
                  </span>
                </div>
              </div>

              {/* Browse link */}
              <Link
                href={`/?q=${encodeURIComponent(author.name)}`}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 transition-colors"
              >
                Browse
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
