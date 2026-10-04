// ─────────────────────────────────────────────────────────────
//  Wishlist Store – Zustand
// ─────────────────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  bookIds: string[];
  addBook: (bookId: string) => void;
  removeBook: (bookId: string) => void;
  toggleBook: (bookId: string) => void;
  hasBook: (bookId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      bookIds: [],

      addBook: (bookId) =>
        set((s) =>
          s.bookIds.includes(bookId) ? s : { bookIds: [...s.bookIds, bookId] }
        ),

      removeBook: (bookId) =>
        set((s) => ({ bookIds: s.bookIds.filter((id) => id !== bookId) })),

      toggleBook: (bookId) => {
        if (get().hasBook(bookId)) {
          get().removeBook(bookId);
        } else {
          get().addBook(bookId);
        }
      },

      hasBook: (bookId) => get().bookIds.includes(bookId),

      clear: () => set({ bookIds: [] }),
    }),
    { name: "bookworm-wishlist" }
  )
);
