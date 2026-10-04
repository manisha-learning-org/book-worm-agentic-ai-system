"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { Book } from "@/lib/types";

interface AddToCartButtonProps {
  book: Book;
}

export function AddToCartButton({ book }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      bookId: book.id,
      quantity: 1,
      selectedFormat: book.format,
      priceAtAdd: book.price,
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-1 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold bg-yellow-400 text-zinc-900 hover:bg-yellow-300 active:scale-95 transition-all"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </button>
  );
}
