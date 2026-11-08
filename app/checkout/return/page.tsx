import type { Metadata } from "next";
import PaymentReturn from "@/components/PaymentReturn";
import ShopShell from "@/components/ShopShell";

export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const paymentId = first(params.payment) ?? null;

  return (
    <ShopShell>
      <section className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-coal/60">Secure payment</p>
        <h1 className="d mt-1 text-3xl md:text-4xl">Payment result</h1>
        <p className="mt-2 text-sm text-coal/65">
          This page only displays the status Paynow has confirmed. It never
          marks an order as paid.
        </p>
        <PaymentReturn paymentId={paymentId} />
      </section>
    </ShopShell>
  );
}
