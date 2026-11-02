import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminNewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="d text-2xl sm:text-3xl">New product</h1>
          <p className="mt-1 text-sm text-coal/60">
            Create the product, then add its variants.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold underline"
        >
          Back to products
        </Link>
      </div>

      <div className="mt-6">
        <ProductForm
          key="new"
          product={{
            id: null,
            name: "",
            slug: "",
            description: "",
            categoryId: categories?.[0]?.id ?? "",
            basePrice: 0,
            tag: "",
            imagePath: "",
            active: true,
            variants: [],
          }}
          categories={categories ?? []}
          imageUrl="/images/logo2.jpeg"
        />
      </div>
    </div>
  );
}
