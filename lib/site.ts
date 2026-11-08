export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const WHATSAPP_NUMBER = "263770000000";

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Fulcrum%20Wear`;

export const SUPPORT_EMAIL = "sales@fulcrumwear.co.zw";

export const SOCIAL_LINKS = {
  x: "https://x.com/fulcrumwear",
  instagram: "https://www.instagram.com/fulcrumwear",
  facebook: "https://www.facebook.com/fulcrumwear",
  tiktok: "https://www.tiktok.com/@fulcrumwear",
} as const;
