import Link from "next/link";
import type { CategoryOption, ProductSort } from "@/lib/queries/products";

type Props = {
  categories: CategoryOption[];
  current: string;
  q?: string;
  sort: ProductSort;
};

function hrefFor(
  category: string,
  q: string | undefined,
  sort: ProductSort,
) {
  const params = new URLSearchParams();

  if (category !== "All") params.set("category", category);
  if (q) params.set("q", q);
  if (sort !== "feat") params.set("sort", sort);

  const search = params.toString();
  return search ? `/?${search}#shop` : "/#shop";
}

export default function CategoryChips({
  categories,
  current,
  q,
  sort,
}: Props) {
  const items: CategoryOption[] = [{ name: "All", slug: "All" }, ...categories];

  return (
    <div id="chips" className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={hrefFor(item.slug, q, sort)}
          className={`chip border border-steel rounded-full px-4 py-1.5 text-sm font-semibold ${
            item.slug === current ? "on" : ""
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
