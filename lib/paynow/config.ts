import "server-only";
import { Paynow } from "paynow";
import { SITE_URL } from "@/lib/site";

type PaynowConfig = {
  integrationId: string;
  integrationKey: string;
  resultUrl: string;
  returnUrl: string;
};

function absoluteUrl(value: string, label: string): string {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${label} must be an absolute URL`);
  }
}

export function getPaynowConfig(): PaynowConfig {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  const siteUrl = SITE_URL;

  if (!integrationId || !integrationKey) {
    throw new Error(
      "Missing PAYNOW_INTEGRATION_ID or PAYNOW_INTEGRATION_KEY",
    );
  }

  const resultUrl = absoluteUrl(
    process.env.PAYNOW_RESULT_URL ?? `${siteUrl}/api/paynow/webhook`,
    "PAYNOW_RESULT_URL",
  );
  const returnUrl = absoluteUrl(
    process.env.PAYNOW_RETURN_URL ?? `${siteUrl}/checkout/return`,
    "PAYNOW_RETURN_URL",
  );

  return { integrationId, integrationKey, resultUrl, returnUrl };
}

export function paymentReturnUrl(base: string, paymentId: string): string {
  const url = new URL(base);
  url.searchParams.set("payment", paymentId);
  return url.toString();
}

export function createPaynowClient(paymentId?: string) {
  const config = getPaynowConfig();
  const returnUrl = paymentId
    ? paymentReturnUrl(config.returnUrl, paymentId)
    : config.returnUrl;

  const paynow = new Paynow(
    config.integrationId,
    config.integrationKey,
    config.resultUrl,
    returnUrl,
  );

  return { paynow, config };
}
