import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/config";
import {
  formatAdminDateTime,
  formatAdminMoney,
} from "@/lib/admin/format";

type RecentOrder = {
  id: string;
  name: string;
  phone: string;
  city: string;
  status: string;
  total: number | string;
  currency: string;
  created_at: string;
};

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ data: stats, error: statsError }, { data: orders }] =
    await Promise.all([
      supabase.rpc("admin_dashboard_stats", {
        p_low_stock: LOW_STOCK_THRESHOLD,
      }),
      supabase
        .from("orders")
        .select("id, name, phone, city, status, total, currency, created_at")
        .order("created_at", { ascending: false })
        .limit(8)
        .returns<RecentOrder[]>(),
    ]);

  const summary = stats?.[0];

  const cards = [
    {
      label: "Orders today",
      value: summary?.orders_today ?? 0,
      detail: "Orders placed since midnight",
      href: "/admin/orders",
    },
    {
      label: "Revenue this month",
      value: formatAdminMoney(summary?.revenue_this_month ?? 0),
      detail: "Paid, packed, shipped and delivered",
      href: "/admin/orders",
    },
    {
      label: "Low stock",
      value: summary?.low_stock_count ?? 0,
      detail: `${LOW_STOCK_THRESHOLD} units or fewer`,
      href: "/admin/inventory?low=1",
    },
    {
      label: "New customers",
      value: summary?.new_customers ?? 0,
      detail: "Profiles created this month",
      href: "/admin/customers",
    },
    {
      label: "Total customers",
      value: summary?.total_customers ?? 0,
      detail: "Registered customer accounts",
      href: "/admin/customers",
    },
    {
      label: "All orders",
      value: summary?.total_orders ?? 0,
      detail: "Orders across all statuses",
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="d text-2xl sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-coal/60">
            Store performance and recent orders.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-semibold underline"
        >
          View all orders
        </Link>
      </div>

      {statsError ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load dashboard stats: {statsError.message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-mist bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-coal/45">
              {card.label}
            </p>
            <p className="d mt-3 text-2xl">{card.value}</p>
            <p className="mt-1 text-xs text-coal/55">{card.detail}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="d text-xl">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold underline">
            All orders
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-mist bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-mist text-coal/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-mist align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs font-semibold underline"
                      >
                        {order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{order.name}</p>
                      <p className="text-xs text-coal/55">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3">{order.city}</td>
                    <td className="px-4 py-3 text-xs text-coal/65">
                      {formatAdminDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatAdminMoney(order.total, order.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-coal/60">
                    No orders yet. Orders will appear here after customers place them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
