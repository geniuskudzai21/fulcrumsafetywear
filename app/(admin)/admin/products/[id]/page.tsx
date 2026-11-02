import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";

type Props = {
  params: Promise<{ id: string }>;
};

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  base_price: number | string;
  tag: string | null;
  image_path: string | null;
  active: boolean;
  variants: {
    id: string;
    color_name: string;
    color_hex: string;
    size: string;
    sku: string;
    stock: number;
    price_override: number | string | null;
    created_at: string;
  }[];
};

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, description, category_id, base_price, tag, image_path, active, variants(id, color_name, color_hex, size, sku, stock, price_override, created_at)",
      )
      .eq("id", id)
      .maybeSingle()
      .returns<ProductDetail | null>(),
    supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  if (!product) notFound();

  const imageUrl = product.image_path
    ? /^https?:\/\//.test(product.image_path)
      ? product.image_path
      : supabase.storage
          .from("products")
          .getPublicUrl(product.image_path).data.publicUrl
    : "/images/logo2.jpeg";

  const variants = [...(product.variants ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="d text-2xl sm:text-3xl">Edit product</h1>
          <p className="mt-1 font-mono text-xs text-coal/55">
            {product.slug}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="text-sm font-semibold underline"
          >
            View product
          </Link>
          <Link
            href="/admin/products"
            className="text-sm font-semibold underline"
          >
            Back to products
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm
          key={`${product.id}:${variants.map((variant) => variant.id).join(",")}`}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            categoryId: product.category_id,
            basePrice: Number(product.base_price),
            tag: product.tag ?? "",
            imagePath: product.image_path ?? "",
            active: product.active,
            variants: variants.map((variant) => ({
              id: variant.id,
              colorName: variant.color_name,
              colorHex: variant.color_hex,
              size: variant.size,
              sku: variant.sku,
              stock: variant.stock,
              priceOverride:
                variant.price_override === null
                  ? null
                  : Number(variant.price_override),
            })),
          }}
          categories={categories ?? []}
          imageUrl={imageUrl}
        />
      </div>
    </div>
  );
}
