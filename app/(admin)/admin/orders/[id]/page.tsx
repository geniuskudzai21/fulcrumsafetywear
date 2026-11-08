import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import {
  formatAdminDateTime,
  formatAdminMoney,
} from "@/lib/admin/format";
import { nextStatuses } from "@/lib/admin/orders";

type Props = {
  params: Promise<{ id: string }>;
};

type OrderItem = {
  id: string;
  qty: number;
  unit_price: number | string;
  variant: {
    id: string;
    color_name: string;
    color_hex: string;
    size: string;
    sku: string;
    product: {
      id: string;
      name: string;
      slug: string;
    } | null;
  } | null;
};

type OrderDetail = {
  id: string;
  user_id: string | null;
  status: string;
  total: number | string;
  delivery_fee: number | string;
  currency: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, total, delivery_fee, currency, name, phone, city, address, payment_method, created_at, order_items(id, qty, unit_price, variant:variants(id, color_name, color_hex, size, sku, product:products(id, name, slug)))",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<OrderDetail | null>();

  if (!order) notFound();

  const { data: profile } = order.user_id
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", order.user_id)
        .maybeSingle()
    : { data: null };

  const items = order.order_items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.qty,
    0,
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold underline"
          >
            Back to orders
          </Link>
          <h1 className="d mt-2 text-2xl sm:text-3xl">
            Order {order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-coal/60">
            Placed {formatAdminDateTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="overflow-x-auto rounded-xl border border-mist bg-white">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-mist text-coal/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Variant</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Unit price
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Line</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-mist">
                    <td className="px-4 py-3 font-semibold">
                      {item.variant?.product ? (
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          target="_blank"
                          className="hover:underline"
                        >
                          {item.variant.product.name}
                        </Link>
                      ) : (
                        "Unknown product"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.variant ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/20"
                            style={{
                              backgroundColor: item.variant.color_hex,
                            }}
                          />
                          {item.variant.color_name} / {item.variant.size}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.variant?.sku ?? "-"}
                    </td>
                    <td className="px-4 py-3">{item.qty}</td>
                    <td className="px-4 py-3 text-right">
                      {formatAdminMoney(item.unit_price, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatAdminMoney(
                        Number(item.unit_price) * item.qty,
                        order.currency,
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-coal/60"
                    >
                      This order has no items.
                    </td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot className="border-t border-mist bg-mist/40">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right font-semibold">
                    Items subtotal
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatAdminMoney(subtotal, order.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right font-semibold">
                    Delivery
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatAdminMoney(order.delivery_fee, order.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right font-bold">
                    Order total
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {formatAdminMoney(order.total, order.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="rounded-xl border border-mist bg-white p-5">
            <h2 className="d text-lg">Delivery</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Recipient
                </dt>
                <dd className="mt-1 font-semibold">{order.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Phone
                </dt>
                <dd className="mt-1">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  City
                </dt>
                <dd className="mt-1">{order.city}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Payment method
                </dt>
                <dd className="mt-1">{order.payment_method}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Address
                </dt>
                <dd className="mt-1">{order.address}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-mist bg-white p-5">
            <h2 className="d text-lg">Status</h2>
            <div className="mt-3">
              <OrderStatusForm
                orderId={order.id}
                options={nextStatuses(order.status)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-mist bg-white p-5">
            <h2 className="d text-lg">Customer</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Name
                </dt>
                <dd className="mt-1 font-semibold">
                  {profile?.full_name || order.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Account email
                </dt>
                <dd className="mt-1 break-all">
                  {profile?.email || "Guest checkout"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-coal/45">
                  Order ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs">{order.id}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
