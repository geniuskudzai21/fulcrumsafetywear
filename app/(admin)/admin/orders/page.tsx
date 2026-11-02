import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { ORDERS_PAGE_SIZE } from "@/lib/admin/config";
import {
  formatAdminDateTime,
  formatAdminMoney,
} from "@/lib/admin/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  isOrderStatus,
} from "@/lib/admin/orders";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type OrderRow = {
  id: string;
  name: string;
  phone: string;
  city: string;
  status: string;
  total: number | string;
  currency: string;
  created_at: string;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const status = first(params.status) ?? "";
  const from = first(params.from) ?? "";
  const to = first(params.to) ?? "";
  const page = Math.max(1, Number(first(params.page) ?? "1") || 1);
  const offset = (page - 1) * ORDERS_PAGE_SIZE;
  const safeQuery = q.replace(/[(),]/g, " ").trim();

  let query = supabase
    .from("orders")
    .select(
      "id, name, phone, city, status, total, currency, created_at",
      { count: "exact" },
    );

  if (isOrderStatus(status)) {
    query = query.eq("status", status);
  }

  if (safeQuery) {
    query = query.or(
      `name.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%`,
    );
  }

  if (from) {
    query = query.gte("created_at", `${from}T00:00:00`);
  }

  if (to) {
    query = query.lte("created_at", `${to}T23:59:59.999`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ORDERS_PAGE_SIZE - 1)
    .returns<OrderRow[]>();

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
    if (nextPage > 1) search.set("page", String(nextPage));
    const value = search.toString();
    return value ? `/admin/orders?${value}` : "/admin/orders";
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="d text-2xl sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-coal/60">
            {total} order{total === 1 ? "" : "s"} match the current filters.
          </p>
        </div>
      </div>

      <form
        action="/admin/orders"
        className="mt-5 grid gap-3 rounded-xl border border-mist bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs font-semibold">
          Customer
          <input
            name="q"
            defaultValue={q}
            placeholder="Name or phone"
            className="mt-1 w-full rounded border border-steel px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="text-xs font-semibold">
          Status
          <select
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded border border-steel bg-white px-3 py-2 text-sm font-normal"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          From
          <input
            name="from"
            type="date"
            defaultValue={from}
            className="mt-1 w-full rounded border border-steel px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="text-xs font-semibold">
          To
          <input
            name="to"
            type="date"
            defaultValue={to}
            className="mt-1 w-full rounded border border-steel px-3 py-2 text-sm font-normal"
          />
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded bg-ink px-4 py-2 text-sm font-bold text-gold">
            Filter
          </button>
          <Link
            href="/admin/orders"
            className="px-2 py-2 text-sm font-semibold underline"
          >
            Reset
          </Link>
        </div>
      </form>

      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load orders: {error.message}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full min-w-[840px] text-left text-sm">
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
            {data?.length ? (
              data.map((order) => (
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
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <p className="text-coal/55">
          Page {page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded border border-steel bg-white px-3 py-1.5 font-semibold ${
              page <= 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Previous
          </Link>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= pageCount}
            className={`rounded border border-steel bg-white px-3 py-1.5 font-semibold ${
              page >= pageCount ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
