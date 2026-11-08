import type { Metadata } from "next";
import CartDrawer from "@/components/CartDrawer";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuickView from "@/components/QuickView";
import ShopView from "@/components/ShopView";
import { StoreProvider } from "@/components/StoreProvider";
import {
  getCategories,
  getProducts,
  parseSort,
} from "@/lib/queries/products";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const requestedCategory = first(params.category);
  const q = first(params.q)?.trim() ?? "";
  const sort = parseSort(first(params.sort));
  const [categories, requestedProducts] = await Promise.all([
    getCategories(),
    getProducts({
      category: requestedCategory,
      q: q || undefined,
      sort,
    }),
  ]);
  const category = categories.some((item) => item.slug === requestedCategory)
    ? requestedCategory!
    : "All";
  const products =
    requestedCategory && category === "All"
      ? await getProducts({ q: q || undefined, sort })
      : requestedProducts;
  const isSearching = q.length > 0;

  return (
    <StoreProvider>
      <Header initialQuery={q} />
      <main id="top">
        <ShopView
          key={`${category}:${q}:${sort}`}
          products={products}
          categories={categories}
          category={category}
          q={q}
          sort={sort}
          isSearching={isSearching}
        />
      </main>
      <Footer />
      <CartDrawer />
      <QuickView products={products} />
      <CheckoutForm />
    </StoreProvider>
  );
}
