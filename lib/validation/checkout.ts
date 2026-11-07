import { z } from "zod";

export const PAYMENT_METHODS = ["ecocash", "onemoney", "zimswitch"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const ZIMBABWE_MOBILE = /^(?:\+263|0)7\d{8}$/;

function compactPhone(value: unknown) {
  return typeof value === "string" ? value.replace(/[\s-]/g, "") : value;
}

export function normalizePhone(value: string): string {
  const compact = value.replace(/[\s-]/g, "");

  if (compact.startsWith("+263")) return `0${compact.slice(4)}`;
  if (compact.startsWith("263")) return `0${compact.slice(3)}`;

  return compact;
}

const phone = z.preprocess(
  compactPhone,
  z
    .string()
    .regex(
      ZIMBABWE_MOBILE,
      "Enter a valid Zimbabwe mobile number, e.g. 0771234567.",
    )
    .transform(normalizePhone),
);

const optionalPhone = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const compact = compactPhone(value);
    return compact === "" ? undefined : compact;
  },
  z
    .string()
    .regex(
      ZIMBABWE_MOBILE,
      "Enter a valid Zimbabwe mobile number, e.g. 0771234567.",
    )
    .transform(normalizePhone)
    .optional(),
);

export const checkoutItemSchema = z.object({
  variantId: z.uuid("Choose a valid variant."),
  qty: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(99, "Quantity is too large."),
});

export const checkoutSchema = z
  .object({
    items: z
      .array(checkoutItemSchema)
      .min(1, "Your cart is empty.")
      .max(50, "Your cart has too many items."),
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(120, "Name is too long."),
    phone,
    city: z
      .string()
      .trim()
      .min(1, "Select your city.")
      .max(80, "City is too long."),
    address: z
      .string()
      .trim()
      .min(5, "Enter a delivery address.")
      .max(500, "Address is too long."),
    method: z.enum(PAYMENT_METHODS, "Choose a payment method."),
    mobilePhone: optionalPhone,
  })
  .superRefine((data, context) => {
    if (data.method !== "zimswitch" && !data.mobilePhone) {
      context.addIssue({
        code: "custom",
        path: ["mobilePhone"],
        message: "Enter the mobile money number.",
      });
    }
  });

export const paymentIdSchema = z.uuid("Choose a valid payment.");
