import Link from "next/link";
import StockEditor from "@/components/admin/StockEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type InventoryRow = {
  id: string;
  color_name: string;
  color_hex: string;
  size: string;
  sku: string;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
    active: boolean;
  } | null;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const lowOnly = first(params.low) === "1";

  let query = supabase
    .from("variants")
    .select(
      "id, color_name, color_hex, size, sku, stock, product:products(id, name, slug, active)",
    );

  if (lowOnly) {
    query = query.lte("stock", LOW_STOCK_THRESHOLD);
  }

  const { data, error } = await query
    .order("stock", { ascending: true })
    .limit(250)
    .returns<InventoryRow[]>();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="d text-2xl sm:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-coal/60">
            Low stock means {LOW_STOCK_THRESHOLD} units or fewer.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/inventory"
            className={`rounded border px-3 py-2 text-sm font-semibold ${
              lowOnly ? "border-steel bg-white" : "border-ink bg-ink text-gold"
            }`}
          >
            All stock
          </Link>
          <Link
            href="/admin/inventory?low=1"
            className={`rounded border px-3 py-2 text-sm font-semibold ${
              lowOnly ? "border-ink bg-ink text-gold" : "border-steel bg-white"
            }`}
          >
            Low stock
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load inventory: {error.message}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-mist text-coal/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Colour</th>
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">State</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((variant) => {
                const low = variant.stock <= LOW_STOCK_THRESHOLD;

                return (
                  <tr key={variant.id} className="border-t border-mist">
                    <td className="px-4 py-3">
                      <Link
                        href={
                          variant.product
                            ? `/admin/products/${variant.product.id}`
                            : "/admin/products"
                        }
                        className="font-semibold hover:underline"
                      >
                        {variant.product?.name ?? "Unknown product"}
                      </Link>
                      {variant.product && !variant.product.active ? (
                        <span className="ml-2 rounded bg-mist px-2 py-0.5 text-xs font-semibold text-coal/60">
                          Inactive
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-black/20"
                          style={{ backgroundColor: variant.color_hex }}
                        />
                        {variant.color_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">{variant.size}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {variant.sku}
                    </td>
                    <td className="px-4 py-3">
                      <StockEditor
                        variantId={variant.id}
                        stock={variant.stock}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          low
                            ? "bg-red-100 text-red-900"
                            : "bg-green-100 text-green-900"
                        }`}
                      >
                        {low ? "Low" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-coal/60">
                  No variants match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
