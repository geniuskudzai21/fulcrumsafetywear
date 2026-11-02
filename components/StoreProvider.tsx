"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCartStore } from "@/lib/store/cart";

type Panel = "cart" | "quickview" | "checkout" | null;

type StoreValue = {
  panel: Panel;
  quickViewId: string | null;
  openCart: () => void;
  openQuickView: (id: string) => void;
  openCheckout: () => void;
  closeAll: () => void;
  toast: (message: string) => void;
  toastMessage: string;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const closeAll = useCallback(() => {
    setPanel(null);
    setQuickViewId(null);
  }, []);

  const openCart = useCallback(() => {
    setPanel("cart");
  }, []);

  const openQuickView = useCallback((id: string) => {
    setQuickViewId(id);
    setPanel("quickview");
  }, []);

  const openCheckout = useCallback(() => {
    setPanel("checkout");
  }, []);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToastMessage(""), 2000);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeAll]);

  useEffect(
    () => () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    },
    [],
  );

  return (
    <StoreContext.Provider
      value={{
        panel,
        quickViewId,
        openCart,
        openQuickView,
        openCheckout,
        closeAll,
        toast,
        toastMessage,
      }}
    >
      {children}
      {panel && (
        <div
          onClick={closeAll}
          className="fixed inset-0 z-40 bg-black/60"
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-ink text-white px-5 py-3 rounded-full text-sm pointer-events-none transition-opacity ${
          toastMessage ? "opacity-100" : "opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
