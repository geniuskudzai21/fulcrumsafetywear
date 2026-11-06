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
};

const initial: ProductFormState = {};

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

          {product.id ? null : (
            <label className="block text-sm font-semibold">
              Stock
              <input
                name="initialStock"
                type="number"
                min="0"
                step="1"
                defaultValue={0}
                required
                className="mt-1 w-full rounded border border-steel px-3 py-2 font-normal"
              />
              <span className="mt-1 block text-xs font-normal text-coal/50">
                You can change stock later on the Inventory page.
              </span>
            </label>
          )}

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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
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
