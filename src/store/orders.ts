// ─────────────────────────────────────────────────────────────
//  Orders Store – Zustand (persisted)
// ─────────────────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus } from "@/lib/types";
import { mockOrders } from "@/lib/mock-data";

interface OrdersStore {
  orders: Order[];

  /** Add a newly placed order */
  addOrder: (order: Order) => void;

  /** Update an order's status (e.g. CONFIRMED → CANCELLED) */
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      // Pre-seed with the sample historical order for demo purposes
      orders: mockOrders.map((o) => ({
        ...o,
        // Serialise Dates so persist round-trips work
        createdAt: new Date(o.createdAt),
        canCancelUntil: new Date(o.canCancelUntil),
      })),

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
    }),
    {
      name: "bookworm-orders",
      // Revive Date strings back to Date objects after hydration
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.orders = state.orders.map((o) => ({
          ...o,
          createdAt: new Date(o.createdAt),
          canCancelUntil: new Date(o.canCancelUntil),
        }));
      },
    }
  )
);
