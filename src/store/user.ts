// ─────────────────────────────────────────────────────────────
//  User Session Store – Zustand
// ─────────────────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, User } from "@/lib/types";
import { mockUser } from "@/lib/mock-data";

interface UserStore {
  currentUser: User | null;
  isAuthenticated: boolean;

  login: (user: User) => void;
  logout: () => void;
  updateGiftPoints: (delta: number) => void;
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Pre-seed the default registered user for demo purposes
      currentUser: mockUser,
      isAuthenticated: true,

      login: (user) => set({ currentUser: user, isAuthenticated: true }),

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      updateGiftPoints: (delta) =>
        set((state) => {
          if (!state.currentUser) return {};
          return {
            currentUser: {
              ...state.currentUser,
              giftPointsBalance: Math.max(
                0,
                state.currentUser.giftPointsBalance + delta
              ),
            },
          };
        }),

      addAddress: (address) =>
        set((state) => {
          if (!state.currentUser) return {};
          return {
            currentUser: {
              ...state.currentUser,
              savedAddresses: [
                ...state.currentUser.savedAddresses,
                address,
              ],
            },
          };
        }),

      removeAddress: (addressId) =>
        set((state) => {
          if (!state.currentUser) return {};
          return {
            currentUser: {
              ...state.currentUser,
              savedAddresses: state.currentUser.savedAddresses.filter(
                (a) => a.id !== addressId
              ),
            },
          };
        }),
    }),
    {
      name: "bookworm-user",
    }
  )
);
