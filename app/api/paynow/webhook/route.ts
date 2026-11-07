import { NextResponse } from "next/server";
import { createPaynowClient } from "@/lib/paynow/config";
import { logPaymentEvent } from "@/lib/paynow/log";
import { normalizePaynowStatus } from "@/lib/paynow/status";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: string;

  try {
    body = await request.text();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  if (!body) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  let status;

  try {
    const { paynow } = createPaynowClient();
    status = paynow.parseStatusUpdate(body);
  } catch (error) {
    logPaymentEvent("webhook_hash_verification_failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return new NextResponse("Invalid signature", { status: 400 });
  }

  const reference = status.reference?.trim();

  if (!reference) {
    logPaymentEvent("webhook_missing_reference");
    return new NextResponse("Bad Request", { status: 400 });
  }

  const normalized = normalizePaynowStatus(status.status);

  if (normalized === "pending") {
    logPaymentEvent("webhook_ignored_status", {
      reference,
      paynowStatus: status.status,
    });

    return new NextResponse("OK", { status: 200 });
  }

  const amount = Number(status.amount);
  const amountValid = Number.isFinite(amount) && amount >= 0;

  if (normalized === "paid" && !amountValid) {
    logPaymentEvent("webhook_invalid_amount", {
      reference,
      amount: status.amount,
    });

    return new NextResponse("Bad Request", { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service.rpc("finalize_paynow_payment", {
    p_reference: reference,
    p_status: normalized,
    p_provider_ref: status.paynowReference ?? null,
    p_poll_url: status.pollUrl ?? null,
    p_amount: amountValid ? amount : undefined,
    p_raw_status: status.status ?? null,
  });

  if (error) {
    logPaymentEvent("webhook_finalize_failed", {
      reference,
      error: error.message,
    });

    return new NextResponse("Could not process payment", { status: 400 });
  }

  const result = data?.[0];

  if (!result) {
    logPaymentEvent("webhook_unknown_reference", { reference });
    return new NextResponse("OK", { status: 200 });
  }

  logPaymentEvent("webhook_processed", {
    reference,
    paynowStatus: status.status,
    normalized,
    paymentId: result.payment_id,
    changed: result.changed,
  });

  return new NextResponse("OK", { status: 200 });
}
