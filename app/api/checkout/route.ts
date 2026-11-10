import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createPaynowClient } from "@/lib/paynow/config";
import { logPaymentEvent } from "@/lib/paynow/log";
import { rateLimit } from "@/lib/paynow/rate-limit";
import { SUPPORT_EMAIL } from "@/lib/site";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

const PAYNOW_EMAIL = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// The Paynow SDK rejects some valid addresses (for example plus-addressing).
// authemail is informational, so fall back to a deliverable-looking address.
function paynowAuthEmail(email: string) {
  const override = process.env.PAYNOW_AUTH_EMAIL?.trim();

  // Paynow test mode requires authemail to be the merchant login email.
  if (override && PAYNOW_EMAIL.test(override)) return override;

  const at = email.lastIndexOf("@");
  const local = at > 0 ? email.slice(0, at).replace(/[^a-zA-Z0-9._-]/g, "") : "";
  const domain = at > 0 ? email.slice(at + 1) : "";
  const sanitized = local && domain ? `${local}@${domain}` : "";

  return PAYNOW_EMAIL.test(sanitized) ? sanitized : SUPPORT_EMAIL;
}

function checkoutErrorMessage(message?: string) {
  if (!message) {
    return "Checkout is temporarily unavailable. Please try again later.";
  }

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("create_paynow_order_with_delivery") ||
    normalizedMessage.includes("schema cache")
  ) {
    return "Checkout setup is incomplete. Please contact support.";
  }

  if (message.includes("Insufficient stock")) {
    return "Some items are no longer in stock. Please update your cart.";
  }

  if (message.includes("no longer available")) {
    return "Some items are no longer available. Please update your cart.";
  }

  if (message.includes("cart is empty")) {
    return "Your cart is empty.";
  }

  if (message.includes("details are required")) {
    return "Please check your delivery details.";
  }

  if (message.includes("Amount") || message.includes("total")) {
    return "We could not calculate your order total. Please try again.";
  }

  return "Checkout is temporarily unavailable. Please try again later.";
}

function providerErrorMessage(message: string | undefined) {
  const details = message?.replace(/[\u0000-\u001f\u007f]/g, " ").trim();

  if (!details) {
    return "Paynow did not return a response. Check the server logs and confirm the Paynow integration credentials and selected payment method are configured correctly.";
  }

  return `Paynow rejected the payment: ${details.slice(0, 240)}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to continue to checkout." },
      { status: 401 },
    );
  }

  const userLimit = rateLimit(`checkout:user:${user.id}`, 5, 60_000);
  const ipLimit = rateLimit(`checkout:ip:${clientIp(request)}`, 20, 60_000);

  if (!userLimit.ok || !ipLimit.ok) {
    const retryAfter = Math.max(
      userLimit.ok ? 0 : userLimit.retryAfter,
      ipLimit.ok ? 0 : ipLimit.retryAfter,
    );

    return NextResponse.json(
      {
        error: "Too many checkout attempts. Please wait a moment and try again.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid checkout request." },
      { status: 400 },
    );
  }

  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Check your checkout details.",
      },
      { status: 400 },
    );
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "Your account needs an email address for Paynow payments." },
      { status: 400 },
    );
  }

  const { items, name, phone, city, address, method, mobilePhone } =
    parsed.data;
  const reference = `FW-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const service = createServiceClient();

  const { data: created, error: createError } = await service.rpc(
    "create_paynow_order_with_delivery",
    {
      p_user_id: user.id,
      p_reference: reference,
      p_name: name,
      p_phone: phone,
      p_city: city,
      p_address: address,
      p_method: method,
      p_items: items,
    },
  );

  const order = created?.[0];

  if (createError || !order) {
    logPaymentEvent("checkout_create_failed", {
      userId: user.id,
      reference,
      error: createError?.message ?? "No order returned",
    });

    return NextResponse.json(
      { error: checkoutErrorMessage(createError?.message) },
      { status: 400 },
    );
  }

  const amount = Number(order.total);
  const deliveryFee = Number(order.delivery_fee);

  async function failPayment(reason: string) {
    const { error } = await service.rpc("finalize_paynow_payment", {
      p_reference: reference,
      p_status: "failed",
      p_amount: amount,
      p_raw_status: reason,
    });

    if (error) {
      logPaymentEvent("checkout_fail_update_failed", {
        reference,
        error: error.message,
      });
    }
  }

  try {
    const { paynow } = createPaynowClient(order.payment_id);
    const payment = paynow.createPayment(
      reference,
      paynowAuthEmail(user.email),
    );
    payment.add(`Fulcrum order ${reference}`, amount, 1);

    const response =
      method === "ecocash"
        ? await paynow.sendMobile(payment, mobilePhone ?? phone, method)
        : await paynow.send(payment);

    if (!response || !response.success) {
      const reason = response?.error ?? "Paynow initiation failed";

      logPaymentEvent("checkout_initiation_failed", {
        userId: user.id,
        reference,
        method,
        error: reason,
      });

      await failPayment("initiation_failed");

      return NextResponse.json(
        {
          error: providerErrorMessage(response?.error),
        },
        { status: 502 },
      );
    }

    const pollUrl = response.pollUrl ?? null;
    const redirectUrl = response.redirectUrl ?? null;
    const innbucks = response.innbucks_info?.[0];
    const innbucksInfo = innbucks
      ? {
          code: innbucks.authorizationcode,
          deepLink: innbucks.deep_link_url,
          expiresAt: innbucks.expires_at,
        }
      : undefined;
    const instructions =
      response.instructions ??
      (innbucksInfo
        ? `InnBucks code ${innbucksInfo.code}${
            innbucksInfo.expiresAt
              ? ` (expires ${innbucksInfo.expiresAt})`
              : ""
          }`
        : null);

    const { error: updateError } = await service
      .from("payments")
      .update({ poll_url: pollUrl, instructions })
      .eq("id", order.payment_id);

    if (updateError) {
      logPaymentEvent("checkout_save_poll_url_failed", {
        reference,
        error: updateError.message,
      });
    }

    if (method !== "ecocash") {
      if (!redirectUrl || !/^https?:\/\//i.test(redirectUrl)) {
        logPaymentEvent("checkout_missing_redirect", {
          userId: user.id,
          reference,
          method,
        });

        await failPayment("missing_redirect");
        return NextResponse.json(
          { error: "Paynow did not return a payment page. Please try again." },
          { status: 502 },
        );
      }

      return NextResponse.json(
        {
          ok: true,
          paymentId: order.payment_id,
          reference,
          method,
          status: "pending",
          amount,
          deliveryFee,
          redirectUrl,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        paymentId: order.payment_id,
        reference,
        method,
        status: "pending",
        amount,
        deliveryFee,
        innbucks: innbucksInfo,
        instructions:
          instructions ??
          "Approve the payment prompt on your phone to complete the order.",
      },
      { status: 201 },
    );
  } catch (error) {
    logPaymentEvent("checkout_initiation_exception", {
      userId: user.id,
      reference,
      method,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    await failPayment("initiation_exception");

    return NextResponse.json(
      {
        error: providerErrorMessage(
          error instanceof Error ? error.message : undefined,
        ),
      },
      { status: 502 },
    );
  }
}
