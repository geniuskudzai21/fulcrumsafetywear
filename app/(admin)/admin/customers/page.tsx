import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { formatAdminDate } from "@/lib/admin/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";

  const { data, error } = await supabase.rpc("admin_customers", {
    p_search: q || undefined,
  });

  return (
    <div>
      <div>
        <h1 className="d text-2xl sm:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-coal/60">
          Read-only customer accounts and order counts.
        </p>
      </div>

      <form action="/admin/customers" className="mt-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="w-full max-w-sm rounded border border-steel bg-white px-3 py-2 text-sm"
        />
        <button className="rounded border border-steel bg-white px-4 py-2 text-sm font-semibold">
          Search
        </button>
        {q ? (
          <Link
            href="/admin/customers"
            className="self-center text-sm font-semibold underline"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load customers: {error.message}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-mist text-coal/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 text-right font-semibold">Orders</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((customer) => (
                <tr key={customer.id} className="border-t border-mist">
                  <td className="px-4 py-3 font-semibold">
                    {customer.full_name || "Unnamed customer"}
                  </td>
                  <td className="px-4 py-3 break-all">
                    {customer.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-coal/65">
                    {formatAdminDate(customer.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {customer.order_count}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-coal/60">
                  {q ? "No customers match this search." : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-coal/50">
        Showing up to 200 customers. Guest orders are not counted here.
      </p>
    </div>
  );
}
