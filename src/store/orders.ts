// ─────────────────────────────────────────────────────────────
//  Orders Store – Zustand (persisted)
// ─────────────────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order, OrderStatus } from "@/lib/types";
import { mockOrders } from "@/lib/mock-data";

// ── Stale-data detection ───────────────────────────────────────
// Titles that existed only in obsolete mock datasets and must
// never appear in a clean store.
const LEGACY_TITLES = new Set(["The Art of Focus", "The Joy of Minimalism"]);

// Fresh seed – re-evaluated at module load time so timestamps
// are always relative to "now".
const freshSeed = (): Order[] =>
  mockOrders.map((o) => ({
    ...o,
    createdAt: new Date(o.createdAt),
    canCancelUntil: new Date(o.canCancelUntil),
  }));

interface OrdersStore {
  orders: Order[];

  /** Add a newly placed order */
  addOrder: (order: Order) => void;

  /** Update an order's status (e.g. CONFIRMED → CANCELLED) */
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  /** Hard-reset back to the canonical seed data */
  resetOrders: () => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      // Pre-seed with the sample historical orders for demo purposes
      orders: freshSeed(),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        })),

      resetOrders: () => set({ orders: freshSeed() }),
    }),
    {
      // ── Bumping the key name immediately invalidates every
      //    browser cache that stored the old "bookworm-orders" key.
      name: "bookworm-orders-v2",
      storage: createJSONStorage(() => localStorage),

      // ── Schema version – increment whenever the persisted shape
      //    changes so migrate() can transform or wipe old data.
      version: 2,

      migrate: (persistedState: unknown, version: number) => {
        // Any cache written before v2 (or with no version at all)
        // is considered stale – replace it with a clean seed.
        if (!persistedState || version < 2) {
          return { orders: freshSeed() };
        }
        return persistedState as OrdersStore;
      },

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // ── 1. Revive Date strings back to Date objects ──────────
        state.orders = state.orders.map((o) => ({
          ...o,
          createdAt: new Date(o.createdAt),
          canCancelUntil: new Date(o.canCancelUntil),
        }));

        // ── 2. Purge any lingering legacy mock books ─────────────
        const hasLegacyData = state.orders.some((order) =>
          order.items.some((item) => LEGACY_TITLES.has(item.title))
        );
        if (hasLegacyData) {
          state.resetOrders();
        }
      },
    }
  )
);
