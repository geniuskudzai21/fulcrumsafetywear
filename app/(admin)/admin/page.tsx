import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/config";
import { formatAdminMoney } from "@/lib/admin/format";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const { data: stats, error: statsError } = await supabase.rpc(
    "admin_dashboard_stats",
    {
      p_low_stock: LOW_STOCK_THRESHOLD,
    },
  );

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
      <div>
        <h1 className="d text-2xl sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-coal/60">
          Store performance at a glance.
        </p>
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
    </div>
  );
}
