import Link from "next/link";
import { Star, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/book-card/AddToCartButton";
import { BookCover } from "@/components/BookCover";

interface RelatedReadsProps {
  books: Book[];
}

export function RelatedReads({ books }: RelatedReadsProps) {
  if (books.length === 0) return null;

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
      <h2 className="text-base font-bold text-zinc-100 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-yellow-400" />
        Related Reads
      </h2>

      <ul className="space-y-3">
        {books.map((book) => {
          const discount =
            book.originalPrice && book.originalPrice > book.price
              ? Math.round(
                  ((book.originalPrice - book.price) / book.originalPrice) * 100
                )
              : null;

          return (
            <li
              key={book.id}
              className="flex gap-3 bg-[#1A1A1A] border border-zinc-800 rounded-xl p-3 hover:border-zinc-600 transition-colors"
            >
              {/* Cover */}
              <Link
                href={`/books/${book.id}`}
                className="w-16 shrink-0"
                tabIndex={-1}
                aria-label={`View ${book.title}`}
              >
                <BookCover
                  src={book.coverImage}
                  title={book.title}
                  author={book.author}
                  className="w-full h-full object-cover"
                  aspectRatio="aspect-[3/4]"
                />
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0 gap-1">
                <Link href={`/books/${book.id}`}>
                  <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 hover:text-yellow-400 transition-colors">
                    {book.title}
                  </h3>
                </Link>
                <p className="text-xs text-zinc-400 truncate">by {book.author}</p>

                {/* Format tag */}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 w-fit">
                  {book.format}
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-zinc-300">{book.rating.toFixed(1)}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-zinc-100">
                    {formatPrice(book.price)}
                  </span>
                  {discount !== null && (
                    <span className="text-[10px] font-bold text-green-400">
                      {discount}% off
                    </span>
                  )}
                </div>

                {/* Add to cart */}
                <AddToCartButton book={book} />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
