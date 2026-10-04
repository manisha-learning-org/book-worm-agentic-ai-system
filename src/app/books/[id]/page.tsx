import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/navbar/Navbar";
import { Breadcrumbs } from "@/components/book-detail/Breadcrumbs";
import { BookDetailClient } from "@/components/book-detail/BookDetailClient";
import { ReviewsSection } from "@/components/book-detail/ReviewsSection";
import { RelatedReads } from "@/components/book-detail/RelatedReads";
import { getBookById, reviewsForBook, getRelatedReads } from "@/lib/mock-data";
import { User as UserIcon } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────
function getDeliveryDate(tentativeDays: string): string {
  const match = tentativeDays.match(/(\d+)/);
  const days = match ? parseInt(match[1], 10) + 0 : 3;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── Page ──────────────────────────────────────────────────────
export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBookById(id);

  if (!book) notFound();

  const reviews = reviewsForBook(book.id);
  const related = getRelatedReads(book.id, 4);

  const deliveryDate = getDeliveryDate(book.tentativeDeliveryDays);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: book.category, href: `/?category=${encodeURIComponent(book.category)}` },
    { label: book.format, href: `/?format=${encodeURIComponent(book.format)}` },
    { label: book.title },
  ];

  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>

      <div className="flex-1 px-4 md:px-6 py-6 max-w-screen-xl mx-auto w-full">
        <Breadcrumbs crumbs={crumbs} />

        {/* ── Main layout: left+center | right rail ── */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* ── Left + Center ── */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Book showcase */}
            <BookDetailClient book={book} deliveryDate={deliveryDate} />

            {/* Description */}
            {book.description && (
              <section>
                <h2 className="text-xl font-bold text-zinc-100 mb-3">About this Book</h2>
                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                  {book.description}
                </p>
                {/* Additional metadata chips */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {book.pages && (
                    <MetaChip label="Pages" value={String(book.pages)} />
                  )}
                  {book.isbn && (
                    <MetaChip label="ISBN" value={book.isbn} />
                  )}
                  {book.publishedDate && (
                    <MetaChip
                      label="Published"
                      value={new Date(book.publishedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                </div>
              </section>
            )}

            {/* About the Writer */}
            <section>
              <h2 className="text-xl font-bold text-zinc-100 mb-4">About the Writer</h2>
              <div className="flex gap-4 items-start bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-5">
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-700 shrink-0 border border-zinc-600">
                  {book.authorImage ? (
                    <Image
                      src={book.authorImage}
                      alt={`Photo of ${book.author}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-7 h-7 text-zinc-400" />
                    </div>
                  )}
                </div>
                {/* Bio */}
                <div>
                  <p className="text-base font-semibold text-zinc-100 mb-1">
                    {book.author}
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {book.authorBio ||
                      "No biography available for this author."}
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <ReviewsSection initialReviews={reviews} bookId={book.id} />
          </div>

          {/* ── Right Rail ── */}
          <RelatedReads books={related} />
        </div>
      </div>
    </>
  );
}

// ── Small helper component ─────────────────────────────────────
function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs">
      <span className="text-zinc-500 font-medium">{label}:</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}
