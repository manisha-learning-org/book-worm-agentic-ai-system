"use client";

import { useState, useCallback } from "react";
import { ShoppingCart, Heart, Truck, BookOpen, Globe, Copy } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { useCartStore } from "@/store/cart";
import type { Book } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { Toast } from "./Toast";

interface BookDetailClientProps {
  book: Book;
  deliveryDate: string;
}

export function BookDetailClient({ book, deliveryDate }: BookDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [wishlisted, setWishlisted] = useState(false);

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, show: false }));
  }, []);

  const handleAddToCart = () => {
    addItem({
      bookId: book.id,
      quantity: 1,
      selectedFormat: book.format,
      priceAtAdd: book.price,
    });
    setToast({ show: true, message: `"${book.title}" added to cart` });
  };

  const handleWishlist = () => {
    setWishlisted((w) => !w);
    setToast({
      show: true,
      message: wishlisted ? "Removed from Wishlist" : `"${book.title}" added to Wishlist`,
    });
  };

  const discount =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  return (
    <>
      {/* ── Cover + details ── */}
      <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
        {/* Cover image */}
        <div className="shrink-0 mx-auto sm:mx-0">
          <div className="relative w-44 sm:w-48 md:w-56 shadow-2xl">
            <BookCover
              src={book.coverImage}
              title={book.title}
              author={book.author}
              className="w-full h-full object-cover"
              aspectRatio="aspect-[3/4]"
              priority
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
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
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-tight">
            {book.title}
          </h1>

          {/* Author */}
          <p className="text-base text-zinc-400">
            by <span className="text-zinc-200 font-medium">{book.author}</span>
          </p>

          {/* Publisher + Format */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="#"
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors underline-offset-2 hover:underline"
            >
              {book.publisher}
            </a>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-200 border border-zinc-600">
              <BookOpen className="w-3 h-3" />
              {book.format}
            </span>
            {book.language && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-200 border border-zinc-600">
                <Globe className="w-3 h-3" />
                {book.language}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-3xl font-extrabold text-zinc-100">
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <>
                <span className="text-lg text-zinc-500 line-through">
                  {formatPrice(book.originalPrice)}
                </span>
                {discount !== null && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>

          {/* Delivery */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            <Truck className="w-4 h-4 shrink-0 text-zinc-500" />
            <span>
              Delivery by{" "}
              <span className="text-zinc-200 font-medium">{deliveryDate}</span>
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-yellow-400 text-zinc-900 hover:bg-yellow-300 active:scale-95 transition-all shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                wishlisted
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30"
                  : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-700"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${wishlisted ? "fill-rose-400 text-rose-400" : ""}`}
              />
              {wishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-4 flex-wrap pt-1 border-t border-zinc-800 mt-3">
            {book.language && (
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Globe className="w-4 h-4 text-zinc-500" />
                <span>{book.language}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <StarRating value={book.rating} size="sm" />
              <span className="text-sm text-zinc-300 font-medium">
                {book.rating.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-500">
                ({book.reviewCount.toLocaleString("en-IN")} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <Copy className="w-4 h-4 text-zinc-500" />
              <span>
                <span className="text-zinc-200 font-medium">
                  {book.copiesSold.toLocaleString("en-IN")}
                </span>{" "}
                copies sold
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast.message} show={toast.show} onClose={dismissToast} />
    </>
  );
}
