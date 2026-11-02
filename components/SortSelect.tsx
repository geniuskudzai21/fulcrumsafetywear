"use client";

import { useRouter } from "next/navigation";
import type { ProductSort } from "@/lib/queries/products";

type Props = {
  sort: ProductSort;
  category: string;
  q?: string;
};

export default function SortSelect({ sort, category, q }: Props) {
  const router = useRouter();

  function handleChange(value: ProductSort) {
    const params = new URLSearchParams();

    if (category !== "All") params.set("category", category);
    if (q) params.set("q", q);
    if (value !== "feat") params.set("sort", value);

    const search = params.toString();
    router.push(search ? `/?${search}#shop` : "/#shop");
  }

  return (
    <label className="text-sm">
      Sort by
      <select
        id="sort"
        value={sort}
        onChange={(event) => handleChange(event.target.value as ProductSort)}
        className="ml-2 border border-steel rounded px-3 py-2"
      >
        <option value="feat">Featured</option>
        <option value="lo">Price, low to high</option>
        <option value="hi">Price, high to low</option>
      </select>
    </label>
  );
}
