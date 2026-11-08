"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { adminStockSchema } from "@/lib/admin/validation";

export async function updateVariantStockAction(input: {
  variantId: string;
  stock: number;
}): Promise<{ ok: boolean; error?: string; message?: string }> {
  const { supabase } = await requireAdmin();
  const parsed = adminStockSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid stock value.",
    };
  }

  const { data, error } = await supabase
    .from("variants")
    .update({ stock: parsed.data.stock })
    .eq("id", parsed.data.variantId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Inventory item was not found." };

  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/");

  return { ok: true, message: "Stock updated." };
}
