"use client";

import Image from "next/image";
import Link from "next/link";
import { cartSubtotal, useCartStore } from "@/lib/store/cart";
import { formatMoney, useCurrencyStore } from "@/lib/money";
import { useStore } from "./StoreProvider";

export default function CheckoutSummary() {
  const items = useCartStore((state) => state.items);
  const currency = useCurrencyStore((state) => state.currency);
  const { openCheckout } = useStore();

  if (!items.length) {
    return (
      <div className="mt-6 rounded-xl border border-mist bg-white p-8 text-center">
        <p className="font-bold">Your cart is empty</p>
        <p className="mt-1 text-sm text-coal/60">
          Add workwear before continuing to checkout.
        </p>
        <Link
          href="/#shop"
          className="mt-5 inline-block bg-ink text-gold font-bold py-3 px-5 rounded"
        >
          Browse workwear
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-mist bg-white p-5 sm:p-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <Image
              src={item.imageUrl}
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] bg-mist rounded object-contain p-1 mix-blend-multiply"
            />
            <div className="flex-1 text-sm">
              <Link
                href={`/products/${item.productSlug}`}
                className="font-bold hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-coal/60">
                {item.color}, {item.size}
              </p>
              <p className="mt-1">
                {item.qty} x {formatMoney(item.price, currency)}
              </p>
            </div>
            <p className="font-bold">
              {formatMoney(item.price * item.qty, currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between border-t border-mist pt-4 text-lg font-bold">
        <span>Subtotal</span>
        <span>{formatMoney(cartSubtotal(items), currency)}</span>
      </div>
      <p className="mt-1 text-xs text-coal/60">
        Delivery is confirmed by city before payment.
      </p>

      <button
        type="button"
        onClick={openCheckout}
        className="mt-4 w-full bg-ink text-gold font-bold py-3 rounded"
      >
        Continue to order
      </button>
      <p className="mt-3 text-xs text-coal/60">
        Online payments are not enabled yet. Orders are confirmed on WhatsApp.
      </p>
    </div>
  );
}
