"use client";

import type { FormEvent } from "react";
import { formatMoney, useCurrencyStore } from "@/lib/money";
import { WHATSAPP_NUMBER } from "@/lib/site";
import { cartSubtotal, useCartStore } from "@/lib/store/cart";
import { useCartActions } from "./CartProvider";
import { useStore } from "./StoreProvider";

export default function CheckoutForm() {
  const { panel, closeAll, toast } = useStore();
  const items = useCartStore((state) => state.items);
  const { clear } = useCartActions();
  const currency = useCurrencyStore((state) => state.currency);

  if (panel !== "checkout") return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;

    const lines = items
      .map(
        (item) =>
          `${item.qty} x ${item.name} (${item.color}, ${item.size})`,
      )
      .join("%0A");

    const message = `New order from ${data.name}%0A${lines}%0ATotal: ${formatMoney(
      cartSubtotal(items),
      currency,
    )}%0APay: ${data.pay}%0ACity: ${data.city}%0AAddress: ${data.addr}%0APhone: ${
      data.phone
    }`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
      "_blank",
    );

    await clear();
    closeAll();
    form.reset();
    toast("Order sent. We will confirm on WhatsApp.");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto bg-white rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex justify-between">
          <h3 className="d text-2xl">Checkout</h3>
          <button
            type="button"
            onClick={closeAll}
            className="text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Full name
            <input
              required
              name="name"
              className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Phone (WhatsApp)
            <input
              required
              name="phone"
              inputMode="tel"
              placeholder="077 000 0000"
              className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
            />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          City
          <select
            required
            name="city"
            className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
          >
            <option value="">Select city</option>
            <option>Harare</option>
            <option>Bulawayo</option>
            <option>Mutare</option>
            <option>Gweru</option>
            <option>Masvingo</option>
            <option>Kwekwe</option>
            <option>Chitungwiza</option>
            <option>Other</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Delivery address
          <textarea
            required
            name="addr"
            rows={2}
            className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
          ></textarea>
        </label>
        <fieldset className="text-sm">
          <legend className="font-semibold">Payment method</legend>
          <div className="mt-2 grid gap-2">
            <label className="flex gap-3 border border-steel rounded p-3">
              <input
                type="radio"
                name="pay"
                value="EcoCash (Paynow)"
                defaultChecked
              />{" "}
              EcoCash or OneMoney via Paynow
            </label>
            <label className="flex gap-3 border border-steel rounded p-3">
              <input type="radio" name="pay" value="Card (Stripe)" /> Visa or
              Mastercard
            </label>
            <label className="flex gap-3 border border-steel rounded p-3">
              <input type="radio" name="pay" value="Cash on delivery" /> Cash on
              delivery
            </label>
          </div>
        </fieldset>
        <div className="flex justify-between font-bold text-lg border-t border-mist pt-4">
          <span>Total</span>
          <span>{formatMoney(cartSubtotal(items), currency)}</span>
        </div>
        <button className="w-full bg-ink text-gold font-bold py-3 rounded">
          Place order
        </button>
        <p className="text-xs text-coal/60">
          Demo only: this sends your order to WhatsApp. Replace with Supabase
          and Paynow or Stripe.
        </p>
      </form>
    </div>
  );
}
