import { Suspense } from "react";
import { connection } from "next/server";
import { REAL_BOOKS } from "@/lib/mock-data";
import type { Book } from "@/lib/types";
import { CatalogueSection } from "@/components/catalogue/CatalogueSection";
import { BookCard } from "@/components/book-card/BookCard";
import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/navbar/Navbar";

// Map sidebar category labels → Book.category values where they differ
const CATEGORY_MAP: Record<string, Book["category"][]> = {
  All: [],
  Romance: ["Romance"],
  Mystery: ["Mystery"],
  "Science Fiction": ["Science Fiction"],
  Fantasy: ["Fantasy"],
  Historical: ["History"],
  Biography: ["Biography"],
  "Self-help": ["Self-help"],
  Memoir: ["Memoir"],
  Philosophy: ["Philosophy"],
  Travel: ["Travel"],
  Cooking: ["Cooking"],
  "Children's": ["Children"],
  "Young Adult": ["New Launch"],
  "Comics & Graphic Novels": [],
  Poetry: [],
  Drama: [],
  Science: [],
  Religion: [],
  "Language Learning": [],
};

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    lang?: string;
    format?: string;
    price?: string;
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  await connection();
  const params = await searchParams;

  const {
    q = "",
    category = "",
    lang = "",
    format = "",
    price = "",
    sort = "",
  } = params;

  // ── 1. Apply category filter ────────────────────────────────
  let filtered = [...REAL_BOOKS];

  if (category && category !== "All") {
    const mapped = CATEGORY_MAP[category] ?? [];
    if (mapped.length > 0) {
      filtered = filtered.filter((b) =>
        mapped.includes(b.category as Book["category"])
      );
    }
    // categories with no direct mapping show no results intentionally
    else if (!Object.keys(CATEGORY_MAP).includes(category)) {
      filtered = [];
    }
  }

  // ── 2. Apply text search ────────────────────────────────────
  if (q.trim()) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower) ||
        b.category.toLowerCase().includes(lower)
    );
  }

  // ── 3. Language filter ──────────────────────────────────────
  if (lang) {
    filtered = filtered.filter(
      (b) => b.language?.toLowerCase() === lang.toLowerCase()
    );
  }

  // ── 4. Format filter ────────────────────────────────────────
  if (format) {
    filtered = filtered.filter(
      (b) => b.format.toLowerCase() === format.toLowerCase()
    );
  }

  // ── 5. Price range filter ───────────────────────────────────
  if (price) {
    if (price === "0-199") filtered = filtered.filter((b) => b.price <= 199);
    else if (price === "200-499")
      filtered = filtered.filter((b) => b.price >= 200 && b.price <= 499);
    else if (price === "500-999")
      filtered = filtered.filter((b) => b.price >= 500 && b.price <= 999);
    else if (price === "1000+") filtered = filtered.filter((b) => b.price >= 1000);
  }

  // ── 6. Sort ─────────────────────────────────────────────────
  if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === "newest")
    filtered.sort(
      (a, b) =>
        new Date(b.publishedDate ?? 0).getTime() -
        new Date(a.publishedDate ?? 0).getTime()
    );

  // ── Determine display mode ──────────────────────────────────
  const isFiltered = q || category || lang || format || price || sort;

  const recommended = REAL_BOOKS.filter((b) => b.isRecommended).slice(0, 5);
  const bestsellers = REAL_BOOKS.filter((b) => b.isBestseller).slice(0, 5);
  const newLaunches = REAL_BOOKS.filter((b) => b.isNewLaunch).slice(0, 5);

  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <Suspense>
          <Sidebar />
        </Suspense>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 md:px-6 py-6 space-y-10">
          {isFiltered ? (
            /* ── Filtered / Search results view ── */
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-zinc-100">
                  {q ? (
                    <>
                      Results for{" "}
                      <span className="text-yellow-400">&ldquo;{q}&rdquo;</span>
                    </>
                  ) : category ? (
                    <>
                      <span className="text-yellow-400">{category}</span> Books
                    </>
                  ) : (
                    "Filtered Books"
                  )}
                </h2>
                <span className="text-sm text-zinc-400">
                  {filtered.length} book{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-5xl mb-4">📚</p>
                  <p className="text-zinc-300 font-semibold text-lg">
                    No books found
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.map((book) => (
                    <Suspense key={book.id} fallback={<BookCardSkeleton />}>
                      {/* BookCard is a Server Component import — client interactivity comes from AddToCartButton inside */}
                      {/* We import it from a server-compatible path */}
                      <BookCardWrapper book={book} />
                    </Suspense>
                  ))}
                </div>
              )}
            </section>
          ) : (
            /* ── Home sections ── */
            <>
              <CatalogueSection
                title="✨ Recommended for You"
                books={recommended}
                viewAllHref="/?sort=rating"
                prioritizeFirst
              />
              <CatalogueSection
                title="🏆 Bestsellers this Month"
                books={bestsellers}
                viewAllHref="/?sort=rating"
              />
              <CatalogueSection
                title="🆕 New Launches"
                books={newLaunches}
                viewAllHref="/?sort=newest"
              />
            </>
          )}
        </main>
      </div>
    </>
  );
}

// ── Thin wrapper so we can Suspense-wrap book cards ─────────────────────────
function BookCardWrapper({ book }: { book: Book }) {
  return <BookCard book={book} />;
}

function BookCardSkeleton() {
  return (
    <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-zinc-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-700 rounded w-3/4" />
        <div className="h-3 bg-zinc-700 rounded w-1/2" />
        <div className="h-6 bg-zinc-700 rounded mt-4" />
      </div>
    </div>
  );
}
