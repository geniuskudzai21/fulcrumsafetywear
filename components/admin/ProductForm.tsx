"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useStore } from "@/components/StoreProvider";
import {
  saveProductAction,
  type ProductFormState,
} from "@/lib/actions/admin/products";
import { slugify } from "@/lib/admin/format";

type Category = { id: string; name: string };

type VariantInitial = {
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: number;
  priceOverride: number | null;
};

type ProductInitial = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  tag: string;
  imagePath: string;
  active: boolean;
  variants: VariantInitial[];
};

type VariantRow = {
  key: string;
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: string;
  priceOverride: string;
};

const initial: ProductFormState = {};

function newRow(): VariantRow {
  return {
    key: crypto.randomUUID(),
    id: "",
    colorName: "",
    colorHex: "#fcc419",
    size: "",
    sku: "",
    stock: "0",
    priceOverride: "",
  };
}

export default function ProductForm({
  product,
  categories,
  imageUrl,
}: {
  product: ProductInitial;
  categories: Category[];
  imageUrl: string;
}) {
  const router = useRouter();
  const { toast } = useStore();
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(product.slug));
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>(
    product.variants.length
      ? product.variants.map((variant) => ({
          key: variant.id || crypto.randomUUID(),
          id: variant.id,
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          size: variant.size,
          sku: variant.sku,
          stock: String(variant.stock),
          priceOverride:
            variant.priceOverride === null ? "" : String(variant.priceOverride),
        }))
      : [newRow()],
  );
  const previewUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!state.success) return;
    toast(state.success);

    if (state.productId && !product.id) {
      router.replace(`/admin/products/${state.productId}`);
    } else {
      router.refresh();
    }
  }, [product.id, router, state, toast]);

  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  function handleName(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSlug(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  function updateVariant(
    key: string,
    field: keyof Omit<VariantRow, "key">,
    value: string,
  ) {
    setVariants((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  function removeVariant(row: VariantRow) {
    if (
      !window.confirm(
        row.id
          ? "Remove this variant? If it has order history the save will be rejected."
          : "Remove this variant row?",
      )
    ) {
      return;
    }

    setVariants((rows) => rows.filter((entry) => entry.key !== row.key));
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }

    const url = URL.createObjectURL(file);
    previewUrl.current = url;
    setPreview(url);
    setRemoveImage(false);
  }

  const currentImage = removeImage ? "/images/logo2.jpeg" : preview ?? imageUrl;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={product.id ?? ""} />
      <input
        type="hidden"
        name="currentImagePath"
        value={product.imagePath}
      />
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          variants.map((variant) => ({
            id: variant.id,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            size: variant.size,
            sku: variant.sku,
            stock: Number(variant.stock) || 0,
            priceOverride: variant.priceOverride,
          })),
        )}
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.fieldErrors ? (
        <ul className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {Object.entries(state.fieldErrors).map(([field, message]) => (
            <li key={field}>
              <span className="font-semibold">{field}:</span> {message}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="rounded-xl border border-mist bg-white p-5">
        <h2 className="d text-lg">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Name
            <input
              name="name"
              value={name}
              onChange={(event) => handleName(event.target.value)}
              required
              className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
            />
          </label>

          <label className="block text-sm font-semibold">
            Slug
            <input
              name="slug"
              value={slug}
              onChange={(event) => handleSlug(event.target.value)}
              placeholder="auto-generated from name"
              className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
            />
            <span className="mt-1 block text-xs font-normal text-coal/50">
              Duplicate slugs get a numeric suffix automatically.
            </span>
          </label>

          <label className="block text-sm font-semibold">
            Category
            <select
              name="categoryId"
              defaultValue={product.categoryId || categories[0]?.id || ""}
              required
              className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Base price (USD)
            <input
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product.basePrice}
              required
              className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
            />
          </label>

          <label className="block text-sm font-semibold">
            Tag
            <input
              name="tag"
              defaultValue={product.tag}
              placeholder="Best seller"
              className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
            />
          </label>

          <label className="flex items-center gap-3 self-end text-sm font-semibold">
            <input
              name="active"
              type="checkbox"
              defaultChecked={product.active}
              className="h-4 w-4"
            />
            Visible in the storefront
          </label>

          <label className="block text-sm font-semibold sm:col-span-2">
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={product.description}
              className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-mist bg-white p-5">
        <h2 className="d text-lg">Product image</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <Image
            src={currentImage}
            alt=""
            width={140}
            height={140}
            className="h-36 w-36 rounded bg-mist object-contain p-2 mix-blend-multiply"
          />
          <div className="space-y-3">
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              className="block w-full max-w-xs text-sm"
            />
            <p className="text-xs text-coal/55">
              JPEG, PNG or WebP. Maximum 2 MB. A new upload replaces the current
              image.
            </p>
            {product.imagePath ? (
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="removeImage"
                  checked={removeImage}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                />
                Remove current image
              </label>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-mist bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="d text-lg">Variants</h2>
            <p className="text-xs text-coal/55">
              Colour, size, SKU, stock and optional price override.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVariants((rows) => [...rows, newRow()])}
            className="rounded border border-steel px-3 py-2 text-sm font-semibold hover:bg-mist"
          >
            Add variant
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.key}
              className="rounded-lg border border-mist bg-mist/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold">Variant {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeVariant(variant)}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-xs font-semibold">
                  Colour name
                  <input
                    value={variant.colorName}
                    onChange={(event) =>
                      updateVariant(
                        variant.key,
                        "colorName",
                        event.target.value,
                      )
                    }
                    required
                    className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>

                <label className="block text-xs font-semibold">
                  Hex colour
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-9 w-9 shrink-0 rounded border border-steel"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                    <input
                      value={variant.colorHex}
                      onChange={(event) =>
                        updateVariant(
                          variant.key,
                          "colorHex",
                          event.target.value,
                        )
                      }
                      pattern="^#[0-9a-fA-F]{6}$"
                      required
                      className="w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
                    />
                  </div>
                </label>

                <label className="block text-xs font-semibold">
                  Size
                  <input
                    value={variant.size}
                    onChange={(event) =>
                      updateVariant(variant.key, "size", event.target.value)
                    }
                    required
                    className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>

                <label className="block text-xs font-semibold">
                  SKU
                  <input
                    value={variant.sku}
                    onChange={(event) =>
                      updateVariant(variant.key, "sku", event.target.value)
                    }
                    required
                    className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>

                <label className="block text-xs font-semibold">
                  Stock
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(variant.key, "stock", event.target.value)
                    }
                    required
                    className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>

                <label className="block text-xs font-semibold">
                  Price override (optional)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.priceOverride}
                    onChange={(event) =>
                      updateVariant(
                        variant.key,
                        "priceOverride",
                        event.target.value,
                      )
                    }
                    className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !variants.length}
          className="bg-ink text-gold font-bold py-3 px-6 rounded disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save product"}
        </button>
        <Link
          href="/admin/products"
          className="text-sm font-semibold underline"
        >
          Back to products
        </Link>
        {!categories.length ? (
          <span className="text-sm font-semibold text-red-700">
            Create a category before adding a product.
          </span>
        ) : null}
      </div>
    </form>
  );
}
