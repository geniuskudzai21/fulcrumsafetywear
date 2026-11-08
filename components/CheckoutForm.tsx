"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { usePaymentStatus } from "@/lib/hooks/usePaymentStatus";
import { formatMoney } from "@/lib/money";
import { cartSubtotal, useCartStore } from "@/lib/store/cart";
import type { PaymentMethod } from "@/lib/validation/checkout";
import { useCartActions } from "./CartProvider";
import { useStore } from "./StoreProvider";

type InnBucksInfo = {
  code: string;
  deepLink?: string;
  expiresAt?: string;
};

type CheckoutResult = {
  paymentId: string;
  reference: string;
  method: PaymentMethod;
  amount: number;
  instructions: string;
  innbucks?: InnBucksInfo;
};

type CheckoutResponse = CheckoutResult & {
  error?: string;
  redirectUrl?: string;
};

const METHODS: {
  value: PaymentMethod;
  title: string;
  detail: string;
}[] = [
  {
    value: "ecocash",
    title: "EcoCash",
    detail: "Approve the payment prompt on your phone.",
  },
  {
    value: "inbucks",
    title: "InnBucks",
    detail: "Get an InnBucks payment code and approve it in the app.",
  },
  {
    value: "zimswitch",
    title: "Zimswitch",
    detail: "Continue to the secure Paynow payment page.",
  },
];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  ecocash: "EcoCash",
  inbucks: "InnBucks",
  zimswitch: "Zimswitch",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Waiting for you to approve the payment",
  paid: "Payment received",
  failed: "Payment failed",
};

export default function CheckoutForm() {
  const { panel, closeAll, toast } = useStore();
  const items = useCartStore((state) => state.items);
  const { clear } = useCartActions();
  const [method, setMethod] = useState<PaymentMethod>("ecocash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const clearedRef = useRef(false);

  const payment = usePaymentStatus(
    result?.paymentId ?? null,
    Boolean(result),
  );

  useEffect(() => {
    if (payment.data?.status !== "paid" || clearedRef.current) return;

    clearedRef.current = true;
    void clear();
    toast("Payment received. Your order is confirmed.");
  }, [payment.data?.status, clear, toast]);

  if (panel !== "checkout") return null;

  function handleClose() {
    setError(null);
    setResult(null);
    clearedRef.current = false;
    closeAll();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            qty: item.qty,
          })),
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          city: String(formData.get("city") ?? ""),
          address: String(formData.get("address") ?? ""),
          method,
          mobilePhone:
            method === "zimswitch"
              ? undefined
              : String(formData.get("mobilePhone") ?? ""),
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | CheckoutResponse
        | null;

      if (!response.ok || !body) {
        setError(body?.error ?? "We could not start checkout. Please try again.");
        return;
      }

      if (body.redirectUrl) {
        window.location.assign(body.redirectUrl);
        return;
      }

      setResult({
        paymentId: body.paymentId,
        reference: body.reference,
        method: body.method,
        amount: body.amount,
        instructions:
          body.instructions ??
          "Approve the payment prompt on your phone to complete the order.",
        innbucks: body.innbucks,
      });
    } catch {
      setError("We could not reach the payment server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const paymentStatus = payment.data?.status ?? "pending";
  const paymentFailed = paymentStatus === "failed";
  const paymentPaid = paymentStatus === "paid";
  const orderCancelled = payment.data?.orderStatus === "cancelled";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between">
          <h3 className="d text-2xl">
            {result ? "Payment status" : "Checkout"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-mist bg-mist/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-coal/50">
                {STATUS_LABELS[paymentStatus] ?? paymentStatus}
              </p>
              <p className="mt-2 text-2xl font-bold">
                {paymentPaid ? "Paid" : paymentFailed ? "Failed" : "Pending"}
              </p>
              <p className="mt-1 text-sm text-coal/65">
                {METHOD_LABELS[result.method]} &middot; USD{" "}
                {Number(result.amount).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-coal/50">
                Reference {result.reference}
              </p>
            </div>

            {result.innbucks ? (
              <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm">
                <p className="font-bold">InnBucks payment code</p>
                <p className="mt-2 font-mono text-2xl font-black tracking-[0.18em] text-ink">
                  {result.innbucks.code}
                </p>
                {result.innbucks.expiresAt ? (
                  <p className="mt-1 text-xs text-coal/60">
                    Expires {result.innbucks.expiresAt}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-coal/60">
                  Open the InnBucks app and enter this code to approve the
                  payment.
                </p>
                {result.innbucks.deepLink ? (
                  <a
                    href={result.innbucks.deepLink}
                    className="mt-3 inline-block rounded-lg bg-ink px-4 py-2 text-xs font-bold text-gold"
                  >
                    Open InnBucks app
                  </a>
                ) : null}
              </div>
            ) : null}

            {paymentPaid && orderCancelled ? (
              <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Payment was received, but this order was cancelled. Contact our
                team so we can help with a refund.
              </p>
            ) : paymentPaid ? (
              <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                Your payment was confirmed. We will prepare your order for
                delivery.
              </p>
            ) : paymentFailed ? (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                This payment did not complete. No stock was taken. You can try
                again with a different number or method.
              </p>
            ) : orderCancelled ? (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                This order was cancelled. If you were charged, contact our team.
              </p>
            ) : (
              <>
                <p className="whitespace-pre-line rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {result.instructions}
                </p>
                <p className="text-xs text-coal/55">
                  {payment.loading
                    ? "Checking with Paynow..."
                    : "This updates automatically. Keep this window open until the payment is confirmed."}
                </p>
              </>
            )}

            {payment.error ? (
              <p className="text-xs text-red-700" role="status">
                {payment.error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {paymentFailed ? (
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    clearedRef.current = false;
                  }}
                  className="rounded bg-ink px-4 py-2 text-sm font-bold text-gold"
                >
                  Try again
                </button>
              ) : null}
              {paymentPaid ? (
                <Link
                  href="/account"
                  onClick={handleClose}
                  className="rounded bg-ink px-4 py-2 text-sm font-bold text-gold"
                >
                  View orders
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                className="rounded border border-steel px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm font-semibold">
                Full name
                <input
                  required
                  name="name"
                  autoComplete="name"
                  className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
                />
              </label>
              <label className="text-sm font-semibold">
                Contact phone
                <input
                  required
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
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
                name="address"
                rows={2}
                autoComplete="street-address"
                className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
              ></textarea>
            </label>

            <fieldset className="text-sm">
              <legend className="font-semibold">Payment method</legend>
              <div className="mt-2 grid gap-2">
                {METHODS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex gap-3 rounded border p-3 ${
                      method === option.value
                        ? "border-ink bg-mist/40"
                        : "border-steel"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={method === option.value}
                      onChange={() => setMethod(option.value)}
                    />
                    <span>
                      <span className="block font-semibold">
                        {option.title}
                      </span>
                      <span className="block text-xs text-coal/60">
                        {option.detail}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {method !== "zimswitch" ? (
              <label className="block text-sm font-semibold">
                {method === "ecocash" ? "EcoCash" : "InnBucks"} number
                <input
                  required
                  name="mobilePhone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="077 000 0000"
                  className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
                />
                <span className="mt-1 block text-xs font-normal text-coal/55">
                  Paynow sends a prompt to this number.
                </span>
              </label>
            ) : null}

            <div className="flex justify-between border-t border-mist pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatMoney(cartSubtotal(items), "USD")}</span>
            </div>

            {error ? (
              <p
                className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              disabled={submitting || !items.length}
              className="w-full bg-ink text-gold font-bold py-3 rounded disabled:opacity-50"
            >
              {submitting
                ? "Starting payment..."
                : method === "zimswitch"
                  ? "Continue to Paynow"
                  : method === "inbucks"
                    ? "Get InnBucks code"
                    : "Send payment prompt"}
            </button>
            <p className="text-xs text-coal/60">
              Payments are processed securely by Paynow. Your payment details
              never reach Fulcrum&apos;s servers.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
