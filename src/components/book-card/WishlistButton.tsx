"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  bookId: string;
}

export function WishlistButton({ bookId }: WishlistButtonProps) {
  const { toggleBook, hasBook } = useWishlistStore();

  // Guard against hydration mismatch (persisted store)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const saved = mounted && hasBook(bookId);

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggleBook(bookId); }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors",
        saved
          ? "bg-red-500/90 text-white hover:bg-red-600/90"
          : "bg-black/40 text-zinc-300 hover:bg-black/60 hover:text-white"
      )}
    >
      <Heart className={cn("w-3.5 h-3.5", saved && "fill-white")} />
    </button>
  );
}
