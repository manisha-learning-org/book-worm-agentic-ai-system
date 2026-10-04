"use client";

// ─────────────────────────────────────────────────────────────
//  My Wishlist
//  – Persisted list of saved books
//  – Add to cart / Remove from wishlist actions
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ChevronRight, Star } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { bookById } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { BookCover } from "@/components/BookCover";
import { useState } from "react";

export default function WishlistClient() {
  const { bookIds, removeBook } = useWishlistStore();
  const { addItem } = useCartStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const books = bookIds
    .map((id) => bookById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof bookById>>[];

  const handleAddToCart = (bookId: string) => {
    const book = bookById(bookId);
    if (!book) return;
    addItem({
      bookId: book.id,
      quantity: 1,
      selectedFormat: book.format,
      priceAtAdd: book.price,
    });
    setAddedIds((prev) => new Set(prev).add(bookId));
  };

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full">
      {/* ── Heading ── */}
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold text-zinc-100">My Wishlist</h1>
        <span className="ml-auto text-sm text-zinc-400">
          {books.length} book{books.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Empty state ── */}
      {books.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Heart className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-lg font-bold text-zinc-100 mb-1">
            Your wishlist is empty
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Save books you love by clicking the heart icon on any book.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-zinc-900 font-semibold hover:bg-yellow-300 transition-colors"
          >
            Browse Books
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Book list ── */}
      {books.length > 0 && (
        <div className="space-y-3">
          {books.map((book) => {
            const isAdded = addedIds.has(book.id);
            const discount =
              book.originalPrice && book.originalPrice > book.price
                ? Math.round(
                    ((book.originalPrice - book.price) / book.originalPrice) *
                      100
                  )
                : null;

            return (
              <article
                key={book.id}
                className="flex items-center gap-4 bg-[#1E1E1E] border border-zinc-800 rounded-2xl px-4 py-4 hover:border-zinc-700 transition-colors"
              >
                {/* Cover */}
                <Link
                  href={`/books/${book.id}`}
                  className="w-14 shrink-0"
                  tabIndex={-1}
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
                <div className="flex-1 min-w-0">
                  <Link href={`/books/${book.id}`}>
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-1 hover:text-yellow-400 transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-zinc-400 mt-0.5">by {book.author}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-zinc-300">
                      {book.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({book.reviewCount.toLocaleString("en-IN")})
                    </span>
                  </div>
                </div>

                {/* Price + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-zinc-100">
                      {formatPrice(book.price)}
                    </span>
                    {discount !== null && (
                      <span className="text-xs text-green-400">{discount}% off</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(book.id)}
                      disabled={isAdded}
                      className={
                        isAdded
                          ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 cursor-default"
                          : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/20 transition-colors"
                      }
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isAdded ? "Added" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => removeBook(book.id)}
                      aria-label={`Remove ${book.title} from wishlist`}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
