import Link from "next/link";
import { Star, Truck } from "lucide-react";
import type { Book } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import { BookCover } from "@/components/BookCover";

interface BookCardProps {
  book: Book;
  /** Pass true for the first above-the-fold card to get priority loading */
  priority?: boolean;
}

/** Derives a human-readable delivery label from the book's tentativeDeliveryDays */
function deliveryLabel(tentativeDays: string): string {
  const match = tentativeDays.match(/(\d+)/);
  const maxDays = match ? parseInt(match[1], 10) + 2 : 5;
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function BookCard({ book, priority = false }: BookCardProps) {
  const discount =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  return (
    <article className="group relative flex flex-col bg-[#1E1E1E] border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-600 hover:shadow-[0_0_24px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
      {/* ── Cover ── */}
      <Link
        href={`/books/${book.id}`}
        className="relative block"
        tabIndex={-1}
        aria-label={`View details for ${book.title}`}
      >
        <BookCover
          src={book.coverImage}
          title={book.title}
          author={book.author}
          className="w-full h-full object-cover"
          aspectRatio="aspect-[3/4]"
          priority={priority}
        />

        {/* Wishlist toggle */}
        <WishlistButton bookId={book.id} />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {book.isBestseller && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-yellow-400 text-zinc-900">
              Bestseller
            </span>
          )}
          {book.isNewLaunch && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-blue-500 text-white">
              New
            </span>
          )}
          {discount !== null && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-green-500 text-white">
              {discount}% off
            </span>
          )}
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {/* Title */}
        <Link href={`/books/${book.id}`}>
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 hover:text-yellow-400 transition-colors">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-xs text-zinc-400">by {book.author}</p>

        {/* Genre / Format tags */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-700 text-zinc-300">
            {book.category}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-700 text-zinc-300">
            {book.format}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-zinc-200">
            {book.rating.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500">
            ({book.reviewCount.toLocaleString("en-IN")})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className="text-base font-bold text-zinc-100">
            {formatPrice(book.price)}
          </span>
          {book.originalPrice && book.originalPrice > book.price && (
            <span className="text-xs text-zinc-500 line-through">
              {formatPrice(book.originalPrice)}
            </span>
          )}
        </div>

        {/* Delivery */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Truck className="w-3 h-3 shrink-0" />
          <span>Delivery by {deliveryLabel(book.tentativeDeliveryDays)}</span>
        </div>

        {/* CTA */}
        <AddToCartButton book={book} />
      </div>
    </article>
  );
}
