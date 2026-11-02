"use client";

import Image from "next/image";
import type { CatalogProduct } from "@/lib/queries/products";
import { useStore } from "./StoreProvider";
import ProductOptions from "./ProductOptions";

export default function QuickView({
  products,
}: {
  products: CatalogProduct[];
}) {
  const { panel, quickViewId } = useStore();

  if (panel !== "quickview" || quickViewId === null) return null;

  const product = products.find((item) => item.id === quickViewId);
  if (!product) return null;

  return <QuickViewDialog key={product.id} product={product} />;
}

function QuickViewDialog({ product }: { product: CatalogProduct }) {
  const { closeAll } = useStore();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
      <div
        role="dialog"
        aria-modal="true"
        className="pointer-events-auto bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto grid md:grid-cols-2"
      >
        <div className="bg-mist p-6 grid place-items-center">
          <div className="relative w-full aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-contain mix-blend-multiply"
            />
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-sm text-coal/60">{product.category.name}</p>
              <h3 className="d text-2xl">{product.name}</h3>
            </div>
            <button
              type="button"
              onClick={closeAll}
              className="text-2xl leading-none self-start"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <p className="mt-3 text-coal/75">{product.description}</p>
          <ProductOptions product={product} />
        </div>
      </div>
    </div>
  );
}
