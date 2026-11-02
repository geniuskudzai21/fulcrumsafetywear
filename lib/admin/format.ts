export function formatAdminMoney(
  value: number | string,
  currency = "USD",
): string {
  const amount = Number(value);

  if (currency === "ZWG") {
    return `ZiG ${amount.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatAdminDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-ZW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatAdminDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en-ZW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
