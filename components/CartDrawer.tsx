"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney, useCurrencyStore } from "@/lib/money";
import { cartSubtotal, useCartStore } from "@/lib/store/cart";
import { useStore } from "./StoreProvider";

export default function CartDrawer() {
  const { panel, closeAll, openCheckout } = useStore();
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const currency = useCurrencyStore((state) => state.currency);
  const open = panel === "cart";

  return (
    <aside
      id="drawer"
      className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white flex flex-col ${
        open ? "" : "translate-x-full"
      }`}
      aria-label="Cart"
    >
      <div className="flex items-center justify-between p-5 border-b border-mist">
        <h2 className="d text-xl">Your cart</h2>
        <button
          type="button"
          onClick={closeAll}
          className="p-2 text-2xl leading-none"
          aria-label="Close cart"
        >
          &times;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {items.length ? (
          items.map((item, index) => {
            return (
              <div key={item.variantId} className="flex gap-3">
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="w-20 h-20 bg-mist rounded object-contain p-1 mix-blend-multiply"
                />
                <div className="flex-1 text-sm">
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={closeAll}
                    className="font-bold hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-coal/60">
                    {item.color}, {item.size}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border border-steel rounded">
                      <button
                        type="button"
                        onClick={() => decrement(index)}
                        className="px-2.5 py-1"
                        aria-label="Less"
                      >
                        &minus;
                      </button>
                      <span className="w-7 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => increment(index)}
                        className="px-2.5 py-1"
                        aria-label="More"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold">
                      {formatMoney(item.price * item.qty, currency)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-1 text-xs underline text-coal/60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <p className="font-bold">Your cart is empty</p>
            <p className="text-sm text-coal/60 mt-1">
              Add workwear from the shop to get started.
            </p>
          </div>
        )}
      </div>
      <div className="p-5 border-t border-mist">
        <div className="flex justify-between font-bold text-lg">
          <span>Subtotal</span>
          <span>{formatMoney(cartSubtotal(items), currency)}</span>
        </div>
        <p className="text-xs text-coal/60 mt-1">
          Delivery fee is confirmed at checkout by city.
        </p>
        <button
          type="button"
          onClick={openCheckout}
          disabled={!items.length}
          className="mt-4 w-full bg-ink text-gold font-bold py-3 rounded disabled:opacity-40"
        >
          Checkout
        </button>
      </div>
    </aside>
  );
}
