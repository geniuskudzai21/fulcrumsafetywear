import type { Database } from "@/lib/database.types";
import { createPublicClient } from "@/lib/supabase/server";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type VariantRow = Database["public"]["Tables"]["variants"]["Row"];

export type ProductSort = "feat" | "lo" | "hi";

export type CatalogSize = {
  id: string;
  sku: string;
  size: string;
  stock: number;
  inStock: boolean;
  price: number;
};

export type CatalogColor = {
  name: string;
  hex: string;
  sizes: CatalogSize[];
  inStock: boolean;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: { name: string; slug: string };
  price: number;
  imagePath: string | null;
  imageUrl: string;
  tag: string | null;
  colors: CatalogColor[];
  sizes: string[];
  inStock: boolean;
  totalStock: number;
};

export type CategoryOption = {
  name: string;
  slug: string;
};

export type ProductFilters = {
  category?: string;
  q?: string;
  sort?: ProductSort;
};

type RawVariant = Pick<
  VariantRow,
  "id" | "color_name" | "color_hex" | "size" | "sku" | "stock" | "price_override"
>;

type RawProduct = Pick<
  ProductRow,
  "id" | "name" | "slug" | "description" | "base_price" | "image_path" | "tag"
> & {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  variants: RawVariant[];
};

const PRODUCT_SELECT = `
  id,
  name,
  slug,
  description,
  base_price,
  image_path,
  tag,
  category:categories!inner (id, name, slug),
  variants (id, color_name, color_hex, size, sku, stock, price_override)
`;

const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "One Size"];

function sizeRank(size: string) {
  const index = SIZE_ORDER.indexOf(size);
  return index === -1 ? SIZE_ORDER.length : index;
}

function sortSizes<T extends { size: string }>(sizes: T[]) {
  return [...sizes].sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
}

function mapProduct(row: RawProduct): CatalogProduct {
  const supabase = createPublicClient();
  const colors = new Map<string, CatalogColor>();
  const allSizes = new Set<string>();
  let totalStock = 0;

  for (const variant of row.variants ?? []) {
    const stock = variant.stock ?? 0;
    totalStock += stock;
    allSizes.add(variant.size);

    const color = colors.get(variant.color_name) ?? {
      name: variant.color_name,
      hex: variant.color_hex,
      sizes: [],
      inStock: false,
    };

    color.sizes.push({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      stock,
      inStock: stock > 0,
      price: variant.price_override ?? row.base_price,
    });
    color.inStock = color.inStock || stock > 0;
    colors.set(variant.color_name, color);
  }

  const colorList = [...colors.values()].map((color) => ({
    ...color,
    sizes: sortSizes(color.sizes),
  }));

  const imagePath = row.image_path;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    category: row.category
      ? { name: row.category.name, slug: row.category.slug }
      : { name: "", slug: "" },
    price: row.base_price,
    imagePath,
    imageUrl: imagePath
      ? /^https?:\/\//.test(imagePath)
        ? imagePath
        : supabase.storage.from("products").getPublicUrl(imagePath).data
            .publicUrl
      : "/images/logo2.jpeg",
    tag: row.tag,
    colors: colorList,
    sizes: sortSizes([...allSizes].map((size) => ({ size }))).map(
      (item) => item.size,
    ),
    inStock: colorList.some((color) => color.inStock),
    totalStock,
  };
}

export async function getProducts(
  { category, q, sort = "feat" }: ProductFilters = {},
): Promise<CatalogProduct[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true);

  if (category && category !== "All") {
    query = query.eq("categories.slug", category);
  }

  const term = q?.trim().replace(/[(),]/g, " ").replace(/\s+/g, " ");

  if (term) {
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (sort === "lo") {
    query = query.order("base_price", { ascending: true });
  } else if (sort === "hi") {
    query = query.order("base_price", { ascending: false });
  } else {
    query = query
      .order("created_at", { ascending: true })
      .order("name", { ascending: true });
  }

  const { data, error } = await query.returns<RawProduct[]>();

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return (data ?? []).map(mapProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product "${slug}": ${error.message}`);
  }

  return data ? mapProduct(data as unknown as RawProduct) : null;
}

export async function getProductSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load product slugs: ${error.message}`);
  }

  return (data ?? []).map((product) => product.slug);
}

export async function getCategories(): Promise<CategoryOption[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .order("created_at", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return data ?? [];
}

export function parseSort(value?: string): ProductSort {
  return value === "lo" || value === "hi" ? value : "feat";
}
