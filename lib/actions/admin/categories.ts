"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify } from "@/lib/admin/format";
import { adminCategorySchema } from "@/lib/admin/validation";

export type AdminActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

function revalidateCategories() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function saveCategoryAction(input: {
  id?: string;
  name: string;
  slug?: string;
}): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = adminCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid category.",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return { ok: false, error: "Enter a category name." };
  }

  if (parsed.data.id) {
    const { error } = await supabase
      .from("categories")
      .update({ name: parsed.data.name, slug })
      .eq("id", parsed.data.id);

    if (error) {
      return {
        ok: false,
        error:
          error.code === "23505"
            ? "That slug is already used by another category."
            : error.message,
      };
    }

    revalidateCategories();
    return { ok: true, message: "Category updated." };
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name: parsed.data.name, slug });

  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "That slug is already used by another category."
          : error.message,
    };
  }

  revalidateCategories();
  return { ok: true, message: "Category created." };
}

export async function deleteCategoryAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", input.id);

  if (error) {
    return {
      ok: false,
      error:
        error.code === "23503"
          ? "This category still has products. Move or deactivate them first."
          : error.message,
    };
  }

  revalidateCategories();
  return { ok: true, message: "Category deleted." };
}
