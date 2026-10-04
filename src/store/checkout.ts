// ─────────────────────────────────────────────────────────────
//  Checkout Store – Zustand
// ─────────────────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import type { Address, PaymentMethod } from "@/lib/types";

interface CheckoutStore {
  selectedAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  useGiftPoints: boolean;

  setSelectedAddress: (address: Address) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  toggleGiftPoints: () => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()((set) => ({
  selectedAddress: null,
  paymentMethod: null,
  useGiftPoints: false,

  setSelectedAddress: (address) => set({ selectedAddress: address }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  toggleGiftPoints: () =>
    set((state) => ({ useGiftPoints: !state.useGiftPoints })),
  reset: () =>
    set({ selectedAddress: null, paymentMethod: null, useGiftPoints: false }),
}));
