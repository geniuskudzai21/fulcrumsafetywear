import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/admin/orders";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().min(0, "Price cannot be negative.").nullable(),
);

export const adminVariantSchema = z.object({
  id: z.string().uuid().or(z.literal("")).optional().default(""),
  colorName: z.string().trim().min(1, "Colour is required.").max(60),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #fcc419."),
  size: z.string().trim().min(1, "Size is required.").max(40),
  sku: z.string().trim().min(1, "SKU is required.").max(80),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(1_000_000),
  priceOverride: optionalNumber,
});

export const adminProductSchema = z.object({
  id: z.string().uuid().nullable(),
  name: z.string().trim().min(2, "Name is required.").max(160),
  slug: z.string().trim().max(160).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  categoryId: z.uuid("Choose a category."),
  basePrice: z.coerce
    .number()
    .min(0, "Base price cannot be negative.")
    .max(10_000_000),
  tag: z.string().trim().max(80).optional().default(""),
  imagePath: z.string().trim().max(500).optional().default(""),
  active: z.boolean(),
  variants: z
    .array(adminVariantSchema)
    .min(1, "Add at least one variant.")
    .max(100),
});

export const adminCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: z.string().trim().max(100).optional().default(""),
});

export const adminStockSchema = z.object({
  variantId: z.uuid("Choose a valid variant."),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(1_000_000),
});

export const adminOrderStatusSchema = z.object({
  orderId: z.uuid("Choose a valid order."),
  status: z.enum(ORDER_STATUSES),
});

export const adminImageSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().max(2 * 1024 * 1024, "Image must be 2 MB or smaller."),
});
