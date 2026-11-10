"use server";

import type { Json } from "@/lib/database.types";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify } from "@/lib/admin/format";
import {
  adminImageSchema,
  adminProductColorsSchema,
  adminProductSchema,
  adminProductSizesSchema,
} from "@/lib/admin/validation";

export type ProductFormState = {
  error?: string;
  success?: string;
  productId?: string;
  fieldErrors?: Record<string, string>;
};

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function toFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }

  return result;
}

function revalidateProductPaths(productId: string, slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function saveProductAction(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase, user } = await requireAdmin();
  const editingProductId = String(formData.get("id") ?? "").trim();
  let variants: {
    id: string;
    colorName: string;
    colorHex: string;
    size: string;
    sku: string;
    stock: number;
    priceOverride: number | string | null;
  }[] = [];

  if (editingProductId) {
    const { data: existing, error: variantsError } = await supabase
      .from("variants")
      .select("id, color_name, color_hex, size, sku, stock, price_override")
      .eq("product_id", editingProductId)
      .order("created_at", { ascending: true });

    if (variantsError) {
      return {
        error: `Could not load product variants: ${variantsError.message}`,
      };
    }

    variants = (existing ?? []).map((variant) => ({
      id: variant.id,
      colorName: variant.color_name,
      colorHex: variant.color_hex,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      priceOverride: variant.price_override,
    }));
  }

  if (!variants.length) {
    const name = String(formData.get("name") ?? "").trim();
    const slug =
      slugify(String(formData.get("slug") ?? "").trim() || name) || "product";

    if (editingProductId) {
      const rawStock = formData.get("initialStock");
      const stock = Number(rawStock ?? 0);

      if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
        return {
          fieldErrors: { initialStock: "Enter a valid stock quantity." },
        };
      }

      variants = [
        {
          id: "",
          colorName: "Standard",
          colorHex: "#000000",
          size: "One Size",
          sku: `${slug.slice(0, 60)}-${crypto.randomUUID().slice(0, 8)}`,
          stock,
          priceOverride: null,
        },
      ];
    } else {
      let rawColors: unknown;

      try {
        rawColors = JSON.parse(String(formData.get("colors") ?? "[]"));
      } catch {
        return { fieldErrors: { variants: "Choose valid product colours." } };
      }

      const colorsResult = adminProductColorsSchema.safeParse(rawColors);
      if (!colorsResult.success) {
        return {
          fieldErrors: {
            variants:
              colorsResult.error.issues[0]?.message ??
              "Choose valid product colours.",
          },
        };
      }

      const sizesResult = adminProductSizesSchema.safeParse(
        formData.getAll("sizes").map(String),
      );
      if (!sizesResult.success) {
        return {
          fieldErrors: {
            variants:
              sizesResult.error.issues[0]?.message ??
              "Choose at least one size.",
          },
        };
      }

      const colors = colorsResult.data;
      const sizes = sizesResult.data;
      if (colors.length * sizes.length > 100) {
        return {
          fieldErrors: {
            variants: "Choose fewer colour and size combinations.",
          },
        };
      }

      for (const color of colors) {
        for (const size of sizes) {
          const colorKey = color.hex.slice(1).toLowerCase();
          const sizeKey = size.toLowerCase().replace(/[^a-z0-9]/g, "-");
          const rawStock = formData.get(`stock_${colorKey}_${sizeKey}`);
          const stock = Number(rawStock);

          if (
            rawStock === null ||
            rawStock === "" ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            stock > 1_000_000
          ) {
            return {
              fieldErrors: {
                variants: `Enter a valid stock quantity for ${color.name}, ${size}.`,
              },
            };
          }

          const colorKeyForSku =
            slugify(color.name).slice(0, 12) || colorKey.slice(0, 12);
          const sizeKeyForSku = slugify(size).slice(0, 8) || "size";
          variants.push({
            id: "",
            colorName: color.name,
            colorHex: color.hex,
            size,
            sku: `${slug.slice(0, 40)}-${colorKeyForSku}-${sizeKeyForSku}-${crypto.randomUUID().slice(0, 8)}`,
            stock,
            priceOverride: null,
          });
        }
      }
    }
  }

  const parsed = adminProductSchema.safeParse({
    id: formData.get("id") || null,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    basePrice: formData.get("basePrice"),
    tag: formData.get("tag"),
    imagePath: formData.get("currentImagePath") ?? "",
    active: formData.get("active") === "on",
    variants,
  });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const currentImage = String(formData.get("currentImagePath") ?? "").trim();
  const removeImage = formData.get("removeImage") === "on";
  let imagePath = removeImage ? "" : currentImage;
  let uploadedPath: string | null = null;

  const image = formData.get("image");

  if (image instanceof File && image.size > 0) {
    const imageCheck = adminImageSchema.safeParse({
      type: image.type,
      size: image.size,
    });

    if (!imageCheck.success) {
      return { error: imageCheck.error.issues[0]?.message ?? "Invalid image." };
    }

    const extension = IMAGE_TYPES[image.type];
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, image, {
        contentType: image.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Image upload failed: ${uploadError.message}` };
    }

    uploadedPath = path;
    imagePath = path;
  }

  const { data: productId, error } = await supabase.rpc(
    "admin_save_product",
    {
      p_product_id: parsed.data.id as string,
      p_name: parsed.data.name,
      p_slug: parsed.data.slug,
      p_description: parsed.data.description,
      p_category_id: parsed.data.categoryId,
      p_base_price: parsed.data.basePrice,
      p_tag: parsed.data.tag,
      p_image_path: imagePath,
      p_active: parsed.data.active,
      p_variants: parsed.data.variants.map((variant) => ({
        id: variant.id,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        size: variant.size,
        sku: variant.sku,
        stock: variant.stock,
        priceOverride: variant.priceOverride,
      })) as Json,
    },
  );

  if (error || !productId) {
    if (uploadedPath) {
      await supabase.storage.from("products").remove([uploadedPath]);
    }

    return { error: error?.message ?? "Could not save product." };
  }

  if (uploadedPath) {
    await supabase.from("audit_log").insert({
      admin_id: user.id,
      action: "upload",
      entity: "storage",
      entity_id: null,
    });
  }

  if (currentImage && currentImage !== imagePath) {
    await supabase.storage.from("products").remove([currentImage]);
  }

  const { data: saved } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  revalidateProductPaths(productId, saved?.slug);

  return {
    success: "Product saved.",
    productId,
  };
}

export async function toggleProductActiveAction(input: {
  productId: string;
  active: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ active: input.active })
    .eq("id", input.productId);

  if (error) return { ok: false, error: error.message };

  revalidateProductPaths(input.productId);

  return { ok: true };
}
