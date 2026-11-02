"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useStore } from "@/components/StoreProvider";
import {
  updateOrderStatusAction,
  type OrderStatusState,
} from "@/lib/actions/admin/orders";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/admin/orders";

const initial: OrderStatusState = {};

export default function OrderStatusForm({
  orderId,
  options,
}: {
  orderId: string;
  options: OrderStatus[];
}) {
  const router = useRouter();
  const { toast } = useStore();
  const [state, action, pending] = useActionState(
    updateOrderStatusAction,
    initial,
  );

  useEffect(() => {
    if (state.success) {
      toast(state.success);
      router.refresh();
    }
  }, [router, state, toast]);

  if (!options.length) {
    return (
      <p className="rounded-lg bg-mist px-3 py-2 text-sm text-coal/60">
        This order is in a final state. No further status changes are allowed.
      </p>
    );
  }

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const selected = new FormData(event.currentTarget).get("status");
        if (
          selected === "cancelled" &&
          !window.confirm(
            "Cancel this order and restore its stock? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
      className="space-y-3"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-sm font-semibold">
        Move to status
        <select
          name="status"
          defaultValue={options[0]}
          className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 font-normal"
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ink px-4 py-2 text-sm font-bold text-gold disabled:opacity-50"
      >
        {pending ? "Updating..." : "Update status"}
      </button>
    </form>
  );
}
