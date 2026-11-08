"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  CatalogProduct,
  CategoryOption,
  ProductSort,
} from "@/lib/queries/products";
import CategoryChips from "./CategoryChips";
import ProductCard from "./ProductCard";
import SortSelect from "./SortSelect";

type Props = {
  products: CatalogProduct[];
  categories: CategoryOption[];
  category: string;
  q: string;
  sort: ProductSort;
  onExpand?: () => void;
};

const INITIAL_PAGE = 8;

function useColumnCount() {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)");
    const medium = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      setColumns(wide.matches ? 4 : medium.matches ? 3 : 2);
    };

    update();
    wide.addEventListener("change", update);
    medium.addEventListener("change", update);

    return () => {
      wide.removeEventListener("change", update);
      medium.removeEventListener("change", update);
    };
  }, []);

  return columns;
}

export default function ProductGrid({
  products,
  categories,
  category,
  q,
  sort,
  onExpand,
}: Props) {
  const columns = useColumnCount();
  const pageSize = columns * 2;
  const [visible, setVisible] = useState(INITIAL_PAGE);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) setVisible(pageSize);
  }, [pageSize, expanded]);

  const shown = products.slice(0, visible);
  const hasMore = visible < products.length;

  function handleLoadMore() {
    setExpanded(true);
    setVisible((count) => Math.min(count + pageSize, products.length));
    onExpand?.();
  }

  return (
    <section
      id="shop"
      className="scroll-mt-32 px-4 py-12 max-w-7xl 2xl:max-w-[90rem] mx-auto md:scroll-mt-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="d text-3xl">
          {q ? `Results for "${q}"` : "Shop workwear"}
        </h2>
        <SortSelect sort={sort} category={category} q={q || undefined} />
      </div>
      <CategoryChips
        categories={categories}
        current={category}
        q={q || undefined}
        sort={sort}
      />
      <p id="results" className="mt-4 text-sm text-coal/60" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {q ? ` found for "${q}"` : ""}
      </p>
      {products.length > 0 ? (
        <>
          <div
            id="grid"
            className="mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex w-full max-w-md items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-steel/60" />
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-coal/40">
                  Showing {shown.length} of {products.length}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-steel/60" />
              </div>
              <button
                type="button"
                onClick={handleLoadMore}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-bold text-white shadow-lg shadow-coal/20 transition duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-ink hover:shadow-xl focus-visible:outline-offset-4"
              >
                Load more products
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div id="empty" className="text-center py-20">
          <p className="font-bold text-lg">No products match your search</p>
          <p className="mt-1 text-sm text-coal/60">
            Try a different category or search term.
          </p>
          <Link href="/#shop" className="mt-3 inline-block underline">
            Clear search and filters
          </Link>
        </div>
      )}
    </section>
  );
}
