"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useStore } from "@/components/StoreProvider";
import { deleteCustomerAction } from "@/lib/actions/admin/customers";

export default function CustomerDeleteButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const { toast } = useStore();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  function remove() {
    const label = customerName || "this customer";

    if (
      !window.confirm(
        `Delete ${label}? This permanently removes their account. Their past orders are kept but will no longer be linked to them.`,
      )
    ) {
      return;
    }

    setBusy(true);
    startTransition(async () => {
      const result = await deleteCustomerAction({ id: customerId });
      setBusy(false);

      if (!result.ok) {
        toast(result.error ?? "Could not delete customer.");
        return;
      }

      toast(result.message ?? "Customer deleted.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={`Delete ${customerName || "customer"}`}
      title="Delete customer"
      className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
