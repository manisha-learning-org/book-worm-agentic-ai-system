// ─────────────────────────────────────────────────────────────
//  Cart Store – Zustand
// ─────────────────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookFormat, CartItem, Coupon } from "@/lib/types";

interface CartStore {
  items: CartItem[];
  coupon: Coupon | null;

  addItem: (item: CartItem) => void;
  removeItem: (bookId: string, format: BookFormat) => void;
  updateQuantity: (
    bookId: string,
    format: BookFormat,
    quantity: number
  ) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;

  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.bookId === newItem.bookId &&
              i.selectedFormat === newItem.selectedFormat
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.bookId === newItem.bookId &&
                i.selectedFormat === newItem.selectedFormat
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (bookId, format) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.bookId === bookId && i.selectedFormat === format)
          ),
        })),

      updateQuantity: (bookId, format, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.bookId === bookId && i.selectedFormat === format)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.bookId === bookId && i.selectedFormat === format
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      clearCart: () => set({ items: [], coupon: null }),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.priceAtAdd * item.quantity,
          0
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "bookworm-cart",
    }
  )
);
