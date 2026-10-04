import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BookCard } from "@/components/book-card/BookCard";
import type { Book } from "@/lib/types";

interface CatalogueSectionProps {
  title: string;
  books: Book[];
  viewAllHref?: string;
  /** Mark the first card as priority (eager) for above-the-fold sections */
  prioritizeFirst?: boolean;
}

export function CatalogueSection({
  title,
  books,
  viewAllHref,
  prioritizeFirst = false,
}: CatalogueSectionProps) {
  if (books.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-0.5 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map((book, i) => (
          <BookCard key={book.id} book={book} priority={prioritizeFirst && i === 0} />
        ))}
      </div>
    </section>
  );
}
