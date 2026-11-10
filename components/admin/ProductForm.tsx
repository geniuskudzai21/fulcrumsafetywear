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
import {
  ADMIN_PRODUCT_SIZES,
  adminProductColorsSchema,
} from "@/lib/admin/validation";
import { slugify } from "@/lib/admin/format";

type Category = { id: string; name: string };
type ProductColor = { name: string; hex: string };

const COLOR_PRESETS: ProductColor[] = [
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#17234A" },
  { name: "Royal blue", hex: "#1D4ED8" },
  { name: "Sky blue", hex: "#7CC4F0" },
  { name: "Red", hex: "#E5242B" },
  { name: "Green", hex: "#228B22" },
  { name: "Yellow", hex: "#F7E015" },
  { name: "Orange", hex: "#FF6A1A" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Brown", hex: "#8B5E3C" },
  { name: "Pink", hex: "#FF6FB5" },
];

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
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "XL",
  ]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#1769AA");
  const [colorPickerError, setColorPickerError] = useState<string | null>(null);
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

  function toggleColor(color: ProductColor) {
    if (selectedColors.some((selected) => selected.hex === color.hex)) {
      setSelectedColors((current) =>
        current.filter((selected) => selected.hex !== color.hex),
      );
      setColorPickerError(null);
      return;
    }

    if (selectedColors.length >= 16) {
      setColorPickerError("You can select up to 16 colours.");
      return;
    }

    setSelectedColors((current) => [...current, color]);
    setColorPickerError(null);
  }

  function addCustomColor() {
    const parsedColor = adminProductColorsSchema.safeParse([
      { name: customColorName, hex: customColorHex },
    ]);

    if (!parsedColor.success) {
      setColorPickerError("Enter a colour name and choose a valid swatch.");
      return;
    }

    if (selectedColors.length >= 16) {
      setColorPickerError("You can select up to 16 colours.");
      return;
    }

    if (
      selectedColors.some(
        (color) =>
          color.name.toLowerCase() === customColorName.trim().toLowerCase() ||
          color.hex.toLowerCase() === customColorHex.toLowerCase(),
      )
    ) {
      setColorPickerError("That colour name or swatch is already selected.");
      return;
    }

    setSelectedColors((current) => [...current, parsedColor.data[0]]);
    setCustomColorName("");
    setColorPickerError(null);
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) => {
      if (size === "One Size") {
        return current.includes(size) ? [] : [size];
      }

      const apparelSizes = current.filter((item) => item !== "One Size");
      return apparelSizes.includes(size)
        ? apparelSizes.filter((item) => item !== size)
        : [...apparelSizes, size];
    });
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
      {!product.id ? (
        <>
          <input
            type="hidden"
            name="colors"
            value={JSON.stringify(selectedColors)}
          />
          {selectedSizes.map((size) => (
            <input key={size} type="hidden" name="sizes" value={size} />
          ))}
        </>
      ) : null}

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

      {!product.id ? (
        <section className="rounded-xl border border-mist bg-white p-5">
          <h2 className="d text-lg">Colours, sizes and stock</h2>
          <p className="mt-1 text-sm text-coal/60">
            Select one or more colours and sizes, then enter stock for each
            combination.
          </p>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Colours</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLOR_PRESETS.map((color) => {
                const isSelected = selectedColors.some(
                  (selected) => selected.hex === color.hex,
                );

                return (
                  <button
                    key={color.hex}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleColor(color)}
                    className={`flex items-center gap-2 rounded border p-2 text-left text-sm ${
                      isSelected
                        ? "border-ink bg-mist/50"
                        : "border-steel"
                    }`}
                  >
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block text-sm font-semibold">
                Custom colour name
                <input
                  value={customColorName}
                  onChange={(event) => setCustomColorName(event.target.value)}
                  maxLength={60}
                  className="mt-1 block rounded border border-steel px-3 py-2 font-normal"
                />
              </label>
              <label className="block text-sm font-semibold">
                Pick a colour
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(event) => setCustomColorHex(event.target.value)}
                  className="mt-1 block h-10 w-16 cursor-pointer rounded border border-steel p-1"
                />
              </label>
              <button
                type="button"
                onClick={addCustomColor}
                disabled={!customColorName.trim() || selectedColors.length >= 16}
                className="rounded border border-steel px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Add colour
              </button>
            </div>
            {colorPickerError ? (
              <p className="mt-2 text-sm text-red-700" role="alert">
                {colorPickerError}
              </p>
            ) : null}

            {selectedColors.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {selectedColors.map((color) => (
                  <li
                    key={`${color.name}-${color.hex}`}
                    className="flex items-center gap-2 rounded-full border border-steel px-3 py-1 text-sm"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                    <button
                      type="button"
                      onClick={() => toggleColor(color)}
                      aria-label={`Remove ${color.name}`}
                      className="ml-1 font-bold"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-coal/55">
                Select at least one colour.
              </p>
            )}
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Sizes</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ADMIN_PRODUCT_SIZES.map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 rounded border border-steel px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </fieldset>

          {selectedColors.length && selectedSizes.length ? (
            <div className="mt-5 space-y-4">
              {selectedColors.map((color) => (
                <fieldset
                  key={`${color.name}-${color.hex}`}
                  className="rounded-lg border border-mist p-3"
                >
                  <legend className="px-1 text-sm font-semibold">
                    {color.name} stock
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {selectedSizes.map((size) => {
                      const colorKey = color.hex.slice(1).toLowerCase();
                      const sizeKey = size
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "-");

                      return (
                        <label
                          key={size}
                          className="block text-xs font-semibold"
                        >
                          {size}
                          <input
                            name={`stock_${colorKey}_${sizeKey}`}
                            type="number"
                            min="0"
                            max="1000000"
                            step="1"
                            defaultValue={0}
                            required
                            className="mt-1 w-full rounded border border-steel px-3 py-2 text-sm font-normal"
                          />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          ) : null}

          {state.fieldErrors?.variants ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {state.fieldErrors.variants}
            </p>
          ) : null}
        </section>
      ) : (
        <section className="rounded-xl border border-mist bg-white p-5">
          <h2 className="d text-lg">Product variants</h2>
          <p className="mt-1 text-sm text-coal/60">
            Existing colour and size variants are preserved when you edit this
            product. Update their stock on the Inventory page.
          </p>
        </section>
      )}

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
