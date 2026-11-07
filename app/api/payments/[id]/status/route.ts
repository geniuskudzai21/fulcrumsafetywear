import { NextResponse } from "next/server";
import { createPaynowClient } from "@/lib/paynow/config";
import { logPaymentEvent } from "@/lib/paynow/log";
import { normalizePaynowStatus } from "@/lib/paynow/status";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { paymentIdSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to check a payment." },
      { status: 401 },
    );
  }

  const params = await context.params;
  const parsed = paymentIdSchema.safeParse(params.id);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: payment, error: paymentError } = await service
    .from("payments")
    .select(
      "id, order_id, reference, poll_url, method, amount, status, updated_at",
    )
    .eq("id", parsed.data)
    .maybeSingle();

  if (paymentError) {
    logPaymentEvent("status_read_failed", {
      paymentId: parsed.data,
      error: paymentError.message,
    });

    return NextResponse.json(
      { error: "Could not load this payment." },
      { status: 500 },
    );
  }

  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  const { data: order, error: orderError } = await service
    .from("orders")
    .select("user_id, status")
    .eq("id", payment.order_id)
    .maybeSingle();

  if (orderError) {
    logPaymentEvent("status_order_read_failed", {
      paymentId: payment.id,
      error: orderError.message,
    });

    return NextResponse.json(
      { error: "Could not load this payment." },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      // Do not reveal whether another user's payment exists.
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 },
      );
    }
  }

  let paymentStatus = payment.status;
  let orderStatus = order.status;
  let updatedAt = payment.updated_at;

  if (payment.poll_url && payment.status === "pending") {
    try {
      const { paynow } = createPaynowClient();
      const response = await paynow.pollTransaction(payment.poll_url);
      const rawStatus = response?.status ?? null;
      const normalized = normalizePaynowStatus(rawStatus);
      const pollUrl = response?.pollUrl ?? payment.poll_url;

      if (response && response.redirectUrl) {
        // Defensive: a poll response must never be treated as a redirect.
        logPaymentEvent("status_unexpected_redirect", {
          paymentId: payment.id,
        });
      }

      if (normalized === "paid" || normalized === "failed") {
        const { data: finalized, error: finalizeError } = await service.rpc(
          "finalize_paynow_payment",
          {
            p_reference: payment.reference ?? "",
            p_status: normalized,
            p_poll_url: pollUrl,
            p_amount: Number(payment.amount),
            p_raw_status: rawStatus ?? undefined,
          },
        );

        if (finalizeError) {
          logPaymentEvent("status_finalize_failed", {
            paymentId: payment.id,
            error: finalizeError.message,
          });
        } else {
          const result = finalized?.[0];

          if (result) {
            paymentStatus = result.payment_status;
            orderStatus = result.order_status;
            updatedAt = new Date().toISOString();
          }
        }
      }
    } catch (error) {
      logPaymentEvent("status_poll_failed", {
        paymentId: payment.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    status: paymentStatus,
    orderStatus,
    method: payment.method,
    amount: payment.amount,
    updatedAt,
  });
}
