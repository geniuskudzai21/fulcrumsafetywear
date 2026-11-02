"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { CartItem } from "@/lib/cart";
import { createClient } from "@/lib/supabase/server";
import {
  cartLineSchema,
  cartVariantSchema,
  mergeCartSchema,
} from "@/lib/validation/cart";

type Client = SupabaseClient<Database>;
type CartActionResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string };

type RawCartRow = {
  variant_id: string;
  qty: number;
  variants: {
    color_name: string;
    size: string;
    price_override: number | string | null;
    products: {
      name: string;
      slug: string;
      image_path: string | null;
      base_price: number | string;
    } | null;
  } | null;
};

async function currentUser(supabase: Client) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getOrCreateCart(
  supabase: Client,
  userId: string,
): Promise<string> {
  const { data: existing, error: readError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (retry) return retry.id;
    }

    throw new Error(error.message);
  }

  return data.id;
}

async function findCart(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

function productImageUrl(supabase: Client, path: string | null) {
  if (!path) return "/images/logo2.jpeg";
  if (/^https?:\/\//.test(path)) return path;
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
}

async function loadCartItems(
  supabase: Client,
  cartId: string,
): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
        variant_id,
        qty,
        variants!inner (
          color_name,
          size,
          price_override,
          products!inner (name, slug, image_path, base_price)
        )
      `,
    )
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawCartRow[];

  return rows.flatMap((row) => {
    const variant = row.variants;
    const product = variant?.products;
    if (!variant || !product) return [];

    return [
      {
        variantId: row.variant_id,
        productSlug: product.slug,
        name: product.name,
        imageUrl: productImageUrl(supabase, product.image_path),
        color: variant.color_name,
        size: variant.size,
        price: Number(variant.price_override ?? product.base_price),
        qty: row.qty,
      },
    ];
  });
}

async function variantStock(supabase: Client, variantId: string) {
  const { data, error } = await supabase
    .from("variants")
    .select("stock")
    .eq("id", variantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.stock ?? null;
}

async function successfulCart(supabase: Client, cartId: string) {
  return {
    ok: true as const,
    items: await loadCartItems(supabase, cartId),
  };
}

export async function getCartAction(): Promise<CartActionResult> {
  const supabase = await createClient();
  const user = await currentUser(supabase);

  if (!user) return { ok: false, error: "Sign in to sync your cart." };

  try {
    const cartId = await findCart(supabase, user.id);
    if (!cartId) return { ok: true, items: [] };
    return await successfulCart(supabase, cartId);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not load cart.",
    };
  }
}

export async function addCartItemAction(input: {
  variantId: string;
  qty: number;
}): Promise<CartActionResult> {
  const parsed = cartLineSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid cart item." };
  }

  const supabase = await createClient();
  const user = await currentUser(supabase);

  if (!user) return { ok: false, error: "Sign in to add items to your cart." };

  try {
    const stock = await variantStock(supabase, parsed.data.variantId);
    if (stock === null) return { ok: false, error: "That variant is unavailable." };
    if (stock < 1) return { ok: false, error: "That variant is out of stock." };

    const cartId = await getOrCreateCart(supabase, user.id);
    const { data: existing, error: readError } = await supabase
      .from("cart_items")
      .select("qty")
      .eq("cart_id", cartId)
      .eq("variant_id", parsed.data.variantId)
      .maybeSingle();

    if (readError) throw new Error(readError.message);

    const qty = (existing?.qty ?? 0) + parsed.data.qty;
    if (qty > stock) {
      return {
        ok: false,
        error: `Only ${stock} left in stock for this size.`,
      };
    }

    const { error } = await supabase.from("cart_items").upsert(
      { cart_id: cartId, variant_id: parsed.data.variantId, qty },
      { onConflict: "cart_id,variant_id" },
    );

    if (error) throw new Error(error.message);
    return await successfulCart(supabase, cartId);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update cart.",
    };
  }
}

export async function updateCartItemAction(input: {
  variantId: string;
  qty: number;
}): Promise<CartActionResult> {
  const parsed = cartLineSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid cart item." };
  }

  const supabase = await createClient();
  const user = await currentUser(supabase);

  if (!user) return { ok: false, error: "Sign in to update your cart." };

  try {
    const stock = await variantStock(supabase, parsed.data.variantId);
    if (stock === null) return { ok: false, error: "That variant is unavailable." };
    if (parsed.data.qty > stock) {
      return {
        ok: false,
        error: `Only ${stock} left in stock for this size.`,
      };
    }

    const cartId = await getOrCreateCart(supabase, user.id);
    const { error } = await supabase.from("cart_items").upsert(
      { cart_id: cartId, variant_id: parsed.data.variantId, qty: parsed.data.qty },
      { onConflict: "cart_id,variant_id" },
    );

    if (error) throw new Error(error.message);
    return await successfulCart(supabase, cartId);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update cart.",
    };
  }
}

export async function removeCartItemAction(input: {
  variantId: string;
}): Promise<CartActionResult> {
  const parsed = cartVariantSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid cart item." };
  }

  const supabase = await createClient();
  const user = await currentUser(supabase);

  if (!user) return { ok: false, error: "Sign in to update your cart." };

  try {
    const cartId = await findCart(supabase, user.id);
    if (!cartId) return { ok: true, items: [] };

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("variant_id", parsed.data.variantId);

    if (error) throw new Error(error.message);
    return await successfulCart(supabase, cartId);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update cart.",
    };
  }
}

export async function clearCartAction(): Promise<CartActionResult> {
  const supabase = await createClient();
  const user = await currentUser(supabase);

  if (!user) return { ok: false, error: "Sign in to update your cart." };

  try {
    const cartId = await findCart(supabase, user.id);
    if (!cartId) return { ok: true, items: [] };

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) throw new Error(error.message);
    return { ok: true, items: [] };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update cart.",
    };
  }
}

export async function mergeGuestCartAction(input: {
  variantId: string;
  qty: number;
}[]): Promise<CartActionResult> {
  const parsed = mergeCartSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid cart." };
  }

  const supabase = await createClient();
  const user = await currentUser(supabase);

  if (!user) return { ok: false, error: "Sign in to sync your cart." };

  try {
    const cartId = await getOrCreateCart(supabase, user.id);
    const { data: existingRows, error: readError } = await supabase
      .from("cart_items")
      .select("variant_id, qty")
      .eq("cart_id", cartId);

    if (readError) throw new Error(readError.message);

    const current = new Map(
      (existingRows ?? []).map((row) => [row.variant_id, row.qty]),
    );
    const incoming = new Map<string, number>();

    for (const line of parsed.data) {
      incoming.set(line.variantId, (incoming.get(line.variantId) ?? 0) + line.qty);
    }

    for (const [variantId, qty] of incoming) {
      const stock = await variantStock(supabase, variantId);
      if (stock === null || stock < 1) continue;

      const nextQty = Math.min((current.get(variantId) ?? 0) + qty, stock);
      if (nextQty < 1) continue;

      const { error } = await supabase.from("cart_items").upsert(
        { cart_id: cartId, variant_id: variantId, qty: nextQty },
        { onConflict: "cart_id,variant_id" },
      );

      if (error) throw new Error(error.message);
    }

    return await successfulCart(supabase, cartId);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not merge cart.",
    };
  }
}
