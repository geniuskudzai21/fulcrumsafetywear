"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCartActions } from "./CartProvider";
import { usePaymentStatus } from "@/lib/hooks/usePaymentStatus";

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
};

const ORDER_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function PaymentReturn({
  paymentId,
}: {
  paymentId: string | null;
}) {
  const { data, loading, error } = usePaymentStatus(paymentId);
  const { clear } = useCartActions();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (data?.status !== "paid" || clearedRef.current) return;

    clearedRef.current = true;
    void clear();
  }, [data?.status, clear]);

  if (!paymentId) {
    return (
      <div className="mt-6 rounded-xl border border-mist bg-white p-8 text-center">
        <p className="font-bold">No payment selected</p>
        <p className="mt-1 text-sm text-coal/60">
          Open this page from your Paynow return link or check your account.
        </p>
        <Link
          href="/account"
          className="mt-5 inline-block rounded bg-ink px-5 py-3 font-bold text-gold"
        >
          Go to account
        </Link>
      </div>
    );
  }

  const status = data?.status ?? "pending";
  const orderStatus = data?.orderStatus ?? "pending";
  const paid = status === "paid";
  const failed = status === "failed";
  const cancelled = orderStatus === "cancelled";

  return (
    <div className="mt-6 rounded-xl border border-mist bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-coal/45">
            Payment status
          </p>
          <p className="d mt-2 text-2xl">
            {STATUS_LABELS[status] ?? status}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            paid
              ? "bg-green-100 text-green-900"
              : failed
                ? "bg-red-100 text-red-900"
                : "bg-amber-100 text-amber-900"
          }`}
        >
          {paid ? "Paid" : failed ? "Failed" : "Pending"}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase text-coal/45">Order</dt>
          <dd className="mt-1 font-semibold">
            {ORDER_LABELS[orderStatus] ?? orderStatus}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase text-coal/45">Amount</dt>
          <dd className="mt-1 font-semibold">
            {data ? `USD ${Number(data.amount).toFixed(2)}` : "-"}
          </dd>
        </div>
      </dl>

      {paid && cancelled ? (
        <p className="mt-5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Payment was received, but this order was cancelled. Contact our team
          so we can help with a refund.
        </p>
      ) : paid ? (
        <p className="mt-5 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Payment received. We will prepare your order for delivery.
        </p>
      ) : failed ? (
        <p className="mt-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          This payment did not complete. Return to checkout to try again.
        </p>
      ) : cancelled ? (
        <p className="mt-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          This order was cancelled before payment was confirmed. If you were
          charged, contact our team.
        </p>
      ) : (
        <p className="mt-5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {loading
            ? "Checking with Paynow..."
            : "This page updates automatically. If you have already paid, it may take a few seconds to confirm."}
        </p>
      )}

      {error ? (
        <p className="mt-3 text-xs text-red-700" role="status">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/account"
          className="rounded bg-ink px-4 py-2 text-sm font-bold text-gold"
        >
          View orders
        </Link>
        <Link
          href="/#shop"
          className="rounded border border-steel px-4 py-2 text-sm font-semibold"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
