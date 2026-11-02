"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  imageUrl: string;
  color: string;
  size: string;
  price: number;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  increment: (index: number) => void;
  decrement: (index: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
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
      increment: (index) =>
        set((state) => {
          const items = [...state.items];
          if (!items[index]) return state;
          items[index] = { ...items[index], qty: items[index].qty + 1 };
          return { items };
        }),
      decrement: (index) =>
        set((state) => {
          const items = [...state.items];
          const item = items[index];
          if (!item) return state;

          if (item.qty > 1) {
            items[index] = { ...item, qty: item.qty - 1 };
            return { items };
          }

          return { items: items.filter((_, itemIndex) => itemIndex !== index) };
        }),
      remove: (index) =>
        set((state) => ({
          items: state.items.filter((_, itemIndex) => itemIndex !== index),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "fw-cart",
      version: 2,
      skipHydration: true,
    },
  ),
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
}
