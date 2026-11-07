export function logPaymentEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  const safeDetails: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    if (
      key.toLowerCase().includes("key") ||
      key.toLowerCase().includes("secret") ||
      key.toLowerCase().includes("hash")
    ) {
      continue;
    }

    safeDetails[key] = value;
  }

  console.error(`[paynow] ${event}`, JSON.stringify(safeDetails));
}
