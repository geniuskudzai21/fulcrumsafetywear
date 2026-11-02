import CategoryManager, {
  type AdminCategory,
} from "@/components/admin/CategoryManager";
import { requireAdmin } from "@/lib/admin/auth";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  products: { id: string }[];
};

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, created_at, products(id)")
    .order("name", { ascending: true })
    .returns<CategoryRow[]>();

  const categories: AdminCategory[] = (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    created_at: category.created_at,
    productCount: category.products.length,
  }));

  return (
    <div>
      <div>
        <h1 className="d text-2xl sm:text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-coal/60">
          Categories group products across the storefront.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load categories: {error.message}
        </p>
      ) : null}

      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
