import Link from "next/link";
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
};

export default function ProductGrid({
  products,
  categories,
  category,
  q,
  sort,
}: Props) {
  return (
    <section id="shop" className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="d text-3xl">Shop workwear</h2>
        <SortSelect sort={sort} category={category} q={q || undefined} />
      </div>
      <CategoryChips
        categories={categories}
        current={category}
        q={q || undefined}
        sort={sort}
      />
      <p id="results" className="mt-4 text-sm text-coal/60">
        {products.length + (products.length === 1 ? " product" : " products")}
      </p>
      {products.length > 0 ? (
        <div
          id="grid"
          className="mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
