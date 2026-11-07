export type NormalizedPaymentStatus = "pending" | "paid" | "failed";

const PAID_STATUSES = new Set([
  "paid",
  "awaiting delivery",
  "delivered",
]);

const FAILED_STATUSES = new Set(["cancelled", "canceled", "failed"]);

export function normalizePaynowStatus(
  raw: string | null | undefined,
): NormalizedPaymentStatus {
  const status = (raw ?? "").trim().toLowerCase();

  if (PAID_STATUSES.has(status)) return "paid";
  if (FAILED_STATUSES.has(status)) return "failed";
  return "pending";
}
