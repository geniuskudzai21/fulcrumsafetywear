import Image from "next/image";
import Link from "next/link";
import ProductActiveToggle from "@/components/admin/ProductActiveToggle";
import { requireAdmin } from "@/lib/admin/auth";
import { PRODUCTS_PAGE_SIZE } from "@/lib/admin/config";
import { formatAdminMoney } from "@/lib/admin/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  base_price: number | string;
  image_path: string | null;
  active: boolean;
  category: { name: string } | null;
  variants: { id: string; stock: number }[];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const page = Math.max(1, Number(first(params.page) ?? "1") || 1);
  const from = (page - 1) * PRODUCTS_PAGE_SIZE;
  const to = from + PRODUCTS_PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, base_price, image_path, active, category:categories(name), variants(id, stock)",
      { count: "exact" },
    );

  if (q) {
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<ProductRow[]>();

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextPage > 1) search.set("page", String(nextPage));
    const value = search.toString();
    return value ? `/admin/products?${value}` : "/admin/products";
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="d text-2xl sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-coal/60">
            {total} product{total === 1 ? "" : "s"} in the catalogue.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-ink text-gold font-bold py-2.5 px-4 rounded"
        >
          New product
        </Link>
      </div>

      <form action="/admin/products" className="mt-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or slug"
          className="w-full max-w-sm rounded border border-steel bg-white px-3 py-2 text-sm"
        />
        <button className="rounded border border-steel bg-white px-4 py-2 text-sm font-semibold">
          Search
        </button>
        {q ? (
          <Link
            href="/admin/products"
            className="self-center text-sm font-semibold underline"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load products: {error.message}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-mist text-coal/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Base price</th>
              <th className="px-4 py-3 font-semibold">Variants</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Edit</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((product) => {
                const stock = product.variants.reduce(
                  (totalStock, variant) => totalStock + (variant.stock ?? 0),
                  0,
                );
                const imageUrl = product.image_path
                  ? /^https?:\/\//.test(product.image_path)
                    ? product.image_path
                    : product.image_path.startsWith("/")
                      ? product.image_path
                      : supabase.storage
                          .from("products")
                          .getPublicUrl(product.image_path).data.publicUrl
                  : "/images/logo2.jpeg";

                return (
                  <tr key={product.id} className="border-t border-mist align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={imageUrl}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded bg-mist object-contain p-0.5 mix-blend-multiply"
                        />
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="font-mono text-xs text-coal/50">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      {formatAdminMoney(product.base_price)}
                    </td>
                    <td className="px-4 py-3">{product.variants.length}</td>
                    <td className="px-4 py-3">{stock}</td>
                    <td className="px-4 py-3">
                      <ProductActiveToggle
                        productId={product.id}
                        active={product.active}
                        name={product.name}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-semibold underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-coal/60">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <p className="text-coal/55">
          Page {page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded border border-steel bg-white px-3 py-1.5 font-semibold ${
              page <= 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Previous
          </Link>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= pageCount}
            className={`rounded border border-steel bg-white px-3 py-1.5 font-semibold ${
              page >= pageCount ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
