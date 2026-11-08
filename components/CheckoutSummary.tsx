"use client";

import Image from "next/image";
import Link from "next/link";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/store/cart";
import { formatMoney } from "@/lib/money";
import { deliveryFeeForQuantity } from "@/lib/shipping";
import { useStore } from "./StoreProvider";

export default function CheckoutSummary() {
  const items = useCartStore((state) => state.items);
  const { openCheckout } = useStore();
  const subtotal = cartSubtotal(items);
  const deliveryFee = deliveryFeeForQuantity(cartCount(items));

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
                {item.qty} x {formatMoney(item.price, "USD")}
              </p>
            </div>
            <p className="font-bold">
              {formatMoney(item.price * item.qty, "USD")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2 border-t border-mist pt-4 text-sm">
        <div className="flex justify-between">
          <span>Items subtotal</span>
          <span>{formatMoney(subtotal, "USD")}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery ({cartCount(items)} items)</span>
          <span>{formatMoney(deliveryFee, "USD")}</span>
        </div>
        <p className="text-xs text-coal/60">
          Delivery is $5, with 50% off for orders of 6 or more items.
        </p>
        <div className="flex justify-between border-t border-mist pt-3 text-lg font-bold">
          <span>Total</span>
          <span>{formatMoney(subtotal + deliveryFee, "USD")}</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-coal/60">
        Paynow charges in USD.
      </p>

      <button
        type="button"
        onClick={openCheckout}
        className="mt-4 w-full bg-ink text-gold font-bold py-3 rounded"
      >
        Continue to payment
      </button>
      <p className="mt-3 text-xs text-coal/60">
        Pay securely with EcoCash, InnBucks or Zimswitch via Paynow.
      </p>
    </div>
  );
}
