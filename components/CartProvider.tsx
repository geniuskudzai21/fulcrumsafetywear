"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  addCartItemAction,
  clearCartAction,
  getCartAction,
  mergeGuestCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/actions/cart";
import type { CartActionResult, CartItem } from "@/lib/cart";
import { useCartStore } from "@/lib/store/cart";
import { useAuth } from "./auth/AuthProvider";

type CartActions = {
  syncing: boolean;
  addItem: (item: CartItem) => Promise<CartActionResult>;
  increment: (variantId: string) => Promise<CartActionResult>;
  decrement: (variantId: string) => Promise<CartActionResult>;
  remove: (variantId: string) => Promise<CartActionResult>;
  clear: () => Promise<CartActionResult>;
};

const CartContext = createContext<CartActions | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const userId = user?.id ?? null;
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;

    let cancelled = false;

    async function sync() {
      await useCartStore.persist.rehydrate();
      if (cancelled) return;

      const state = useCartStore.getState();

      if (!userId) {
        if (state.ownerId !== null) {
          state.setItems([], null);
        }
        return;
      }

      setSyncing(true);

      let result: CartActionResult;
      if (state.ownerId === userId) {
        result = await getCartAction();
      } else {
        const guestLines =
          state.ownerId === null
            ? state.items.map((item) => ({
                variantId: item.variantId,
                qty: item.qty,
              }))
            : [];
        result = await mergeGuestCartAction(guestLines);
      }

      if (cancelled) return;
      if (result.ok) {
        state.setItems(result.items, userId);
      }
      setSyncing(false);
    }

    void sync();

    return () => {
      cancelled = true;
    };
  }, [loading, pathname, userId]);

  const addItem = useCallback(
    async (item: CartItem): Promise<CartActionResult> => {
      if (!userId) {
        useCartStore.getState().addItem(item);
        return { ok: true, items: useCartStore.getState().items };
      }

      const result = await addCartItemAction({
        variantId: item.variantId,
        qty: item.qty,
      });
      if (result.ok) {
        useCartStore.getState().setItems(result.items, userId);
      }
      return result;
    },
    [userId],
  );

  const increment = useCallback(
    async (variantId: string): Promise<CartActionResult> => {
      const state = useCartStore.getState();

      if (!userId) {
        state.increment(variantId);
        return { ok: true, items: useCartStore.getState().items };
      }

      const item = state.items.find((entry) => entry.variantId === variantId);
      if (!item) return { ok: true, items: state.items };

      const result = await updateCartItemAction({
        variantId,
        qty: item.qty + 1,
      });
      if (result.ok) {
        useCartStore.getState().setItems(result.items, userId);
      }
      return result;
    },
    [userId],
  );

  const decrement = useCallback(
    async (variantId: string): Promise<CartActionResult> => {
      const state = useCartStore.getState();

      if (!userId) {
        state.decrement(variantId);
        return { ok: true, items: useCartStore.getState().items };
      }

      const item = state.items.find((entry) => entry.variantId === variantId);
      if (!item) return { ok: true, items: state.items };

      const result =
        item.qty <= 1
          ? await removeCartItemAction({ variantId })
          : await updateCartItemAction({ variantId, qty: item.qty - 1 });

      if (result.ok) {
        useCartStore.getState().setItems(result.items, userId);
      }
      return result;
    },
    [userId],
  );

  const remove = useCallback(
    async (variantId: string): Promise<CartActionResult> => {
      if (!userId) {
        useCartStore.getState().remove(variantId);
        return { ok: true, items: useCartStore.getState().items };
      }

      const result = await removeCartItemAction({ variantId });
      if (result.ok) {
        useCartStore.getState().setItems(result.items, userId);
      }
      return result;
    },
    [userId],
  );

  const clear = useCallback(async (): Promise<CartActionResult> => {
    if (!userId) {
      useCartStore.getState().clear();
      return { ok: true, items: [] };
    }

    const result = await clearCartAction();
    if (result.ok) {
      useCartStore.getState().setItems(result.items, userId);
    }
    return result;
  }, [userId]);

  return (
    <CartContext.Provider
      value={{ syncing, addItem, increment, decrement, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartActions() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartActions must be used within a CartProvider");
  }
  return context;
}
