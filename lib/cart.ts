export type CartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  imageUrl: string;
  color: string;
  size: string;
  price: number;
  qty: number;
};

export type CartActionResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string };

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
}
