"use client";

import { create } from "zustand";

export const ZWG_RATE = 27;

export type Currency = "USD" | "ZWG";

type CurrencyStore = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currency: "USD",
  setCurrency: (currency) => set({ currency }),
}));

export function formatMoney(value: number, currency: Currency): string {
  return currency === "USD"
    ? "$" + value.toFixed(2)
    : "ZiG " + Math.round(value * ZWG_RATE).toLocaleString();
}
