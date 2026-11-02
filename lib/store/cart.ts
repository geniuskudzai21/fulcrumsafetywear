"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/cart";

export type { CartItem } from "@/lib/cart";
export { cartCount, cartSubtotal } from "@/lib/cart";

type CartStore = {
  items: CartItem[];
  ownerId: string | null;
  setItems: (items: CartItem[], ownerId: string | null) => void;
  addItem: (item: CartItem) => void;
  increment: (variantId: string) => void;
  decrement: (variantId: string) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      ownerId: null,
      setItems: (items, ownerId) => set({ items, ownerId }),
      addItem: (item) =>
        set((state) => {
          const index = state.items.findIndex(
            (existing) => existing.variantId === item.variantId,
          );

          if (index >= 0) {
            const items = [...state.items];
            items[index] = { ...items[index], qty: items[index].qty + item.qty };
            return { items };
          }

          return { items: [...state.items, item] };
        }),
      increment: (variantId) =>
        set((state) => {
          const index = state.items.findIndex(
            (item) => item.variantId === variantId,
          );
          if (index < 0) return state;

          const items = [...state.items];
          items[index] = { ...items[index], qty: items[index].qty + 1 };
          return { items };
        }),
      decrement: (variantId) =>
        set((state) => {
          const index = state.items.findIndex(
            (item) => item.variantId === variantId,
          );
          if (index < 0) return state;

          const items = [...state.items];
          const item = items[index];

          if (item.qty > 1) {
            items[index] = { ...item, qty: item.qty - 1 };
            return { items };
          }

          return {
            items: items.filter((entry) => entry.variantId !== variantId),
          };
        }),
      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "fw-cart",
      version: 3,
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        ownerId: state.ownerId,
      }),
    },
  ),
);
