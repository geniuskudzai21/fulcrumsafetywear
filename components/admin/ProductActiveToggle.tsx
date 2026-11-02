"use client";

import { useTransition } from "react";
import { toggleProductActiveAction } from "@/lib/actions/admin/products";
import { useStore } from "@/components/StoreProvider";

export default function ProductActiveToggle({
  productId,
  active,
  name,
}: {
  productId: string;
  active: boolean;
  name: string;
}) {
  const { toast } = useStore();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !active;

    if (
      !next &&
      !window.confirm(
        `Deactivate "${name}"? It will disappear from the storefront.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await toggleProductActiveAction({
        productId,
        active: next,
      });

      if (!result.ok) {
        toast(result.error ?? "Could not update product.");
        return;
      }

      toast(next ? "Product activated." : "Product deactivated.");
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Deactivate product" : "Activate product"}
      disabled={pending}
      onClick={toggle}
      className={`inline-flex w-20 items-center justify-center rounded-full px-2 py-1 text-xs font-bold disabled:opacity-50 ${
        active ? "bg-green-100 text-green-900" : "bg-mist text-coal/60"
      }`}
    >
      {pending ? "Saving..." : active ? "Active" : "Inactive"}
    </button>
  );
}
