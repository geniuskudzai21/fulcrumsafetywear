"use client";

import { useState } from "react";
import type {
  CatalogProduct,
  CategoryOption,
  ProductSort,
} from "@/lib/queries/products";
import BrandBand from "./BrandBand";
import Hero from "./Hero";
import ProductGrid from "./ProductGrid";
import TrustStrip from "./TrustStrip";

type Props = {
  products: CatalogProduct[];
  categories: CategoryOption[];
  category: string;
  q: string;
  sort: ProductSort;
  isSearching: boolean;
};

export default function ShopView({
  products,
  categories,
  category,
  q,
  sort,
  isSearching,
}: Props) {
  const [browsing, setBrowsing] = useState(false);
  const showShowcase = !isSearching && !browsing;

  return (
    <>
      {showShowcase ? (
        <>
          <Hero />
          <TrustStrip />
        </>
      ) : null}
      <ProductGrid
        products={products}
        categories={categories}
        category={category}
        q={q}
        sort={sort}
        onExpand={() => setBrowsing(true)}
      />
      {showShowcase ? <BrandBand /> : null}
    </>
  );
}
