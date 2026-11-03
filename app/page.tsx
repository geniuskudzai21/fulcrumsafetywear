import BrandBand from "@/components/BrandBand";
import CartDrawer from "@/components/CartDrawer";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import QuickView from "@/components/QuickView";
import { StoreProvider } from "@/components/StoreProvider";
import TrustStrip from "@/components/TrustStrip";
import {
  getCategories,
  getProducts,
  parseSort,
} from "@/lib/queries/products";

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

  return (
    <StoreProvider>
      <Header initialQuery={q} />
      <main id="top">
        <Hero />
        <TrustStrip />
        <ProductGrid
          products={products}
          categories={categories}
          category={category}
          q={q}
          sort={sort}
        />
        <BrandBand />
      </main>
      <Footer />
      <CartDrawer />
      <QuickView products={products} />
      <CheckoutForm />
    </StoreProvider>
  );
}
