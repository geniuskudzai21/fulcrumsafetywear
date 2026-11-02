"use client";

import { useState } from "react";
import type { CatalogColor, CatalogProduct } from "@/lib/queries/products";
import { formatMoney, useCurrencyStore } from "@/lib/money";
import { useCartActions } from "./CartProvider";
import { useStore } from "./StoreProvider";

export default function ProductOptions({
  product,
}: {
  product: CatalogProduct;
}) {
  const { toast, openCart } = useStore();
  const { addItem } = useCartActions();
  const currency = useCurrencyStore((state) => state.currency);

  const firstColor =
    product.colors.find((color) => color.inStock) ?? product.colors[0] ?? null;
  const [colorName, setColorName] = useState(firstColor?.name ?? "");
  const [sizeId, setSizeId] = useState(
    firstColor?.sizes.find((size) => size.inStock)?.id ??
      firstColor?.sizes[0]?.id ??
      "",
  );
  const [qty, setQty] = useState(1);

  const color =
    product.colors.find((item) => item.name === colorName) ?? firstColor;
  const variant = color?.sizes.find((size) => size.id === sizeId) ?? null;
  const price = variant?.price ?? product.price;
  const showSizes = !(
    product.sizes.length === 1 && product.sizes[0] === "One Size"
  );

  const outColors = product.colors
    .filter((item) => !item.inStock)
    .map((item) => item.name);
  const outSizes =
    color?.sizes.filter((size) => !size.inStock).map((size) => size.size) ?? [];

  function selectColor(nextColor: CatalogColor) {
    setColorName(nextColor.name);
    const nextSize =
      nextColor.sizes.find((size) => size.inStock) ?? nextColor.sizes[0] ?? null;
    setSizeId(nextSize?.id ?? "");
    setQty(1);
  }

  function selectSize(nextSizeId: string) {
    setSizeId(nextSizeId);
    setQty(1);
  }

  async function addToCart() {
    if (!product.inStock) {
      toast("Out of stock");
      return;
    }

    if (!color) {
      toast("Choose a colour first");
      return;
    }

    if (!variant) {
      toast("Choose an available size first");
      return;
    }

    if (variant.stock === 0) {
      toast("Out of stock");
      return;
    }

    const result = await addItem({
      variantId: variant.id,
      productSlug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      color: color.name,
      size: variant.size,
      price: variant.price,
      qty: Math.min(qty, variant.stock),
    });

    if (!result.ok) {
      toast(result.error);
      return;
    }

    toast("Added to cart");
    openCart();
  }

  return (
    <div>
      <p className="mt-2 text-xl font-bold">{formatMoney(price, currency)}</p>
      {!product.inStock ? (
        <p className="mt-1 text-sm font-bold text-red-700">Out of stock</p>
      ) : null}

      <div className="mt-5">
        <p className="font-semibold text-sm">
          Colour:{" "}
          <span className="font-normal">{color?.name ?? "Unavailable"}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {product.colors.map((item) => (
            <button
              key={item.name}
              type="button"
              title={item.inStock ? item.name : `${item.name} — out of stock`}
              aria-label={
                item.inStock ? item.name : `${item.name} — out of stock`
              }
              disabled={!item.inStock}
              className={`sw disabled:cursor-not-allowed ${
                item.name === color?.name ? "on" : ""
              }`}
              style={{
                backgroundColor: item.hex,
                width: 26,
                height: 26,
                opacity: item.inStock ? 1 : 0.35,
              }}
              onClick={() => selectColor(item)}
            />
          ))}
        </div>
        {outColors.length ? (
          <p className="mt-2 text-xs font-semibold text-red-700">
            Out of stock: {outColors.join(", ")}
          </p>
        ) : null}
      </div>

      {showSizes ? (
        <div className="mt-5">
          <p className="font-semibold text-sm">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {color?.sizes.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.inStock ? item.size : `${item.size} — out of stock`}
                aria-label={
                  item.inStock ? item.size : `${item.size} — out of stock`
                }
                disabled={!item.inStock}
                className={`sz border border-steel rounded px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                  item.id === variant?.id ? "on" : ""
                }`}
                onClick={() => selectSize(item.id)}
              >
                {item.size}
              </button>
            ))}
          </div>
          {outSizes.length ? (
            <p className="mt-2 text-xs font-semibold text-red-700">
              Out of stock: {outSizes.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-4">
        <div className="flex items-center border border-steel rounded">
          <button
            type="button"
            onClick={() => setQty((value) => (value > 1 ? value - 1 : value))}
            className="px-3 py-2 disabled:opacity-40"
            disabled={!product.inStock}
            aria-label="Less"
          >
            &minus;
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            type="button"
            onClick={() =>
              setQty((value) =>
                Math.min(value + 1, Math.max(variant?.stock ?? 1, 1)),
              )
            }
            className="px-3 py-2 disabled:opacity-40"
            disabled={!product.inStock || qty >= (variant?.stock ?? 0)}
            aria-label="More"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={!product.inStock || !variant}
          className="flex-1 bg-gold text-ink font-bold py-3 rounded hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
}
