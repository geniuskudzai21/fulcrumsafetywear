"use client";

import { useState, useTransition } from "react";
import { useStore } from "@/components/StoreProvider";
import { updateVariantStockAction } from "@/lib/actions/admin/inventory";

export default function StockEditor({
  variantId,
  stock,
}: {
  variantId: string;
  stock: number;
}) {
  const { toast } = useStore();
  const [value, setValue] = useState(String(stock));
  const [savedStock, setSavedStock] = useState(stock);
  const [pending, startTransition] = useTransition();
  const dirty = Number(value) !== savedStock;

  function save() {
    startTransition(async () => {
      const result = await updateVariantStockAction({
        variantId,
        stock: Number(value),
      });

      if (!result.ok) {
        toast(result.error ?? "Could not update stock.");
        return;
      }

      setSavedStock(Number(value));
      toast(result.message ?? "Stock updated.");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-24 rounded border border-steel px-2 py-1.5 text-sm"
        aria-label="Stock quantity"
      />
      <button
        type="button"
        onClick={save}
        disabled={pending || !dirty || value === ""}
        className="rounded bg-ink px-3 py-1.5 text-xs font-bold text-gold transition-colors hover:bg-coal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-mist disabled:text-coal/70"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
