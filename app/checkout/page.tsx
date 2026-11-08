import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutSummary from "@/components/CheckoutSummary";
import ShopShell from "@/components/ShopShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  return (
    <ShopShell>
      <section className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-sm text-coal/60">Secure checkout</p>
        <h1 className="d text-3xl md:text-4xl mt-1">Review your order</h1>
        <p className="mt-2 text-sm text-coal/65">
          Confirm your items and pay securely with EcoCash, InnBucks or
          Zimswitch via Paynow. Your order is sent to our team once payment is
          confirmed.
        </p>
        <CheckoutSummary />
      </section>
    </ShopShell>
  );
}
