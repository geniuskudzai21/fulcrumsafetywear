import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your account | Fulcrum Wear",
  robots: { index: false },
};

type OrderRow = {
  id: string;
  status: string;
  total: number | string;
  currency: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatOrderTotal(total: number | string, currency: string) {
  return `${currency} ${Number(total).toFixed(2)}`;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id, status, total, currency, created_at")
      .order("created_at", { ascending: false })
      .returns<OrderRow[]>(),
  ]);

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    "Fulcrum customer";

  return (
    <ShopShell>
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-sm text-coal/60">Your account</p>
        <h1 className="d text-3xl md:text-4xl mt-1">Hi, {fullName}</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-mist bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-coal/50">
              Profile
            </p>
            <p className="mt-3 font-semibold">{fullName}</p>
            <p className="text-sm text-coal/65">{user.email}</p>
            <p className="mt-3 text-sm text-coal/65">
              Member since{" "}
              {formatDate(profile?.created_at ?? user.created_at)}
            </p>
          </div>
          <div className="rounded-xl border border-mist bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-coal/50">
              Account actions
            </p>
            <p className="mt-3 text-sm text-coal/65">
              Your saved cart follows you when you sign in on another device.
            </p>
            <Link
              href="/#shop"
              className="mt-4 inline-block bg-gold text-ink font-bold py-2 px-4 rounded"
            >
              Continue shopping
            </Link>
            {profile?.role === "admin" ? (
              <Link
                href="/admin"
                className="mt-3 block text-sm font-semibold underline"
              >
                Open admin dashboard
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="d text-xl">Order history</h2>
          {orders?.length ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-mist bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-mist text-coal/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-mist">
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 capitalize">{order.status}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatOrderTotal(order.total, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-mist bg-white p-8 text-center">
              <p className="font-bold">No orders yet</p>
              <p className="mt-1 text-sm text-coal/60">
                When you place an order it will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </ShopShell>
  );
}
