const PRODUCTION_URL = "https://fulcrumindustrial.co.zw";
const LOCAL_URL = "http://localhost:3000";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? PRODUCTION_URL : LOCAL_URL)
).replace(/\/+$/, "");

export const SITE_NAME = "Fulcrum Safety Wear";

export const SITE_TITLE = "Fulcrum Wear | Safety workwear in Zimbabwe";

export const SITE_DESCRIPTION =
  "Industrial workwear and PPE for mining, construction and site crews across Zimbabwe. Shop hi-vis, overalls, boots and safety gear with delivery nationwide.";

export const SITE_KEYWORDS = [
  "workwear Zimbabwe",
  "safety wear Zimbabwe",
  "PPE Zimbabwe",
  "hi-vis clothing",
  "industrial workwear",
  "safety boots Harare",
  "overalls Zimbabwe",
  "protective clothing",
  "Fulcrum Safety Wear",
  "Fulcrum Wear",
];

export const CONTACT_PHONE = "+263785737355";

export const WHATSAPP_NUMBER = "263785737355";

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Fulcrum%20Wear`;

export const SUPPORT_EMAIL = "sales@fulcrumindustrial.co.zw";

export const BUSINESS_ADDRESS = {
  locality: "Harare",
  region: "Harare",
  country: "ZW",
} as const;

export const SOCIAL_LINKS = {
  x: "https://x.com/fulcrumwear",
  instagram: "https://www.instagram.com/fulcrumwear",
  facebook: "https://www.facebook.com/fulcrumwear",
  tiktok: "https://www.tiktok.com/@fulcrumwear",
} as const;

export const SOCIAL_PROFILES = Object.values(SOCIAL_LINKS);
