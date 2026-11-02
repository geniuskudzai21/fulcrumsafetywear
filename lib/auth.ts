import { SITE_URL } from "@/lib/site";

export function safeNext(value: unknown, fallback = "/account"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  return value;
}

export function siteOrigin(origin?: string | null): string {
  return (origin || SITE_URL).replace(/\/+$/, "");
}

export function authCallbackUrl(next = "/account", origin?: string | null) {
  return `${siteOrigin(origin)}/auth/callback?next=${encodeURIComponent(
    safeNext(next),
  )}`;
}
