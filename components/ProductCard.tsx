"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/queries/products";
import { formatMoney, useCurrencyStore } from "@/lib/money";
import { useStore } from "./StoreProvider";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const currency = useCurrencyStore((state) => state.currency);
  const { openQuickView } = useStore();

  return (
    <article className="group">
      <button
        type="button"
        onClick={() => openQuickView(product.id)}
        className="relative block w-full aspect-square bg-mist rounded-lg overflow-hidden"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-contain p-4 mix-blend-multiply transition-transform group-hover:scale-105"
        />
        {product.tag ? (
          <span className="absolute top-2 left-2 bg-gold text-ink text-xs font-bold px-2 py-1 rounded">
            {product.tag}
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute top-2 right-2 bg-ink text-white text-xs font-bold px-2 py-1 rounded">
            Out of stock
          </span>
        ) : null}
      </button>
      <p className="mt-3 text-xs text-coal/60">{product.category.name}</p>
      <h3 className="font-bold leading-snug">
        <Link href={`/products/${product.slug}`} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-bold">{formatMoney(product.price, currency)}</span>
        <span className="flex gap-1">
          {product.colors.slice(0, 5).map((color) => (
            <i
              key={color.name}
              className="sw"
              style={{
                backgroundColor: color.hex,
                opacity: color.inStock ? 1 : 0.35,
              }}
              title={color.inStock ? color.name : `${color.name} — out of stock`}
            />
          ))}
        </span>
      </div>
      <button
        type="button"
        onClick={() => openQuickView(product.id)}
        className="mt-3 w-full border-2 border-ink font-bold py-2 rounded hover:bg-ink hover:text-gold transition-colors"
      >
        {product.inStock ? "Choose options" : "View availability"}
      </button>
    </article>
  );
}
