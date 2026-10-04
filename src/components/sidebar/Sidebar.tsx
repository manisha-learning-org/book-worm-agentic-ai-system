"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Romance",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Historical",
  "Biography",
  "Self-help",
  "Memoir",
  "Travel",
  "Cooking",
  "Children's",
  "Young Adult",
  "Comics & Graphic Novels",
  "Poetry",
  "Drama",
  "Science",
  "Philosophy",
  "Religion",
  "Language Learning",
] as const;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "All";

  const setCategory = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat === "All") {
        params.delete("category");
      } else {
        params.set("category", cat);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-[109px] h-[calc(100vh-109px)] overflow-y-auto scrollbar-thin bg-[#1E1E1E] border-r border-zinc-800 py-4">
      <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Categories
      </p>
      <nav aria-label="Book categories">
        <ul className="space-y-0.5 px-2">
          {CATEGORIES.map((cat) => {
            const isActive =
              cat === "All"
                ? !searchParams.get("category")
                : activeCategory === cat;
            return (
              <li key={cat}>
                <button
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-yellow-400/15 text-yellow-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50"
                  )}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
