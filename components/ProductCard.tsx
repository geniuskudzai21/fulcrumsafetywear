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
    <article className="group rounded-2xl border border-mist bg-white p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-coal/10 sm:p-3">
      <button
        type="button"
        onClick={() => openQuickView(product.id)}
        className="relative block aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-mist to-[#e8e9eb]"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-contain p-3 mix-blend-multiply transition-transform duration-500 motion-safe:group-hover:scale-105 sm:p-5"
        />
        {product.tag ? (
          <span className="absolute left-2 top-2 rounded-md bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink shadow-sm sm:text-xs">
            {product.tag}
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute right-2 top-2 rounded-md bg-ink px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
            Out of stock
          </span>
        ) : null}
        <span className="absolute bottom-2 right-2 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
      </button>
      <div className="px-1 pb-1 pt-3 sm:px-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-coal/45 sm:text-xs">
          {product.category.name}
        </p>
        <h3 className="mt-1 min-h-10 font-bold leading-snug">
          <Link
            href={`/products/${product.slug}`}
            className="decoration-gold decoration-2 underline-offset-2 transition hover:underline"
          >
          {product.name}
          </Link>
        </h3>
        <div className="mt-3 flex min-h-7 items-center justify-between gap-2">
          <span className="text-lg font-extrabold tracking-tight">
            {formatMoney(product.price, currency)}
          </span>
          <span
            className="flex gap-1"
            aria-label={`${product.colors.length} available colour options`}
          >
            {product.colors.slice(0, 5).map((color) => (
              <i
                key={color.name}
                className="sw"
                style={{
                  backgroundColor: color.hex,
                  opacity: color.inStock ? 1 : 0.35,
                }}
                title={
                  color.inStock ? color.name : `${color.name} — out of stock`
                }
              />
            ))}
            {product.colors.length > 5 ? (
              <span className="self-center text-[10px] font-semibold text-coal/50">
                +{product.colors.length - 5}
              </span>
            ) : null}
          </span>
        </div>
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-gold hover:text-ink focus-visible:outline-offset-2"
        >
          {product.inStock ? "Choose options" : "View availability"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </article>
  );
}
