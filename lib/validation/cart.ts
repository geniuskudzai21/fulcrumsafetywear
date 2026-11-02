import { z } from "zod";

export const cartLineSchema = z.object({
  variantId: z.uuid("Choose a valid variant."),
  qty: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(99, "Quantity is too large."),
});

export const cartVariantSchema = z.object({
  variantId: z.uuid("Choose a valid variant."),
});

export const mergeCartSchema = z
  .array(cartLineSchema)
  .max(50, "Your cart has too many items.");
