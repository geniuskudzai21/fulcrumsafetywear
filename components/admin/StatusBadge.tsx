import {
  ORDER_STATUS_LABELS,
  isOrderStatus,
} from "@/lib/admin/orders";

const COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  paid: "bg-blue-100 text-blue-900",
  packed: "bg-purple-100 text-purple-900",
  shipped: "bg-indigo-100 text-indigo-900",
  delivered: "bg-green-100 text-green-900",
  cancelled: "bg-red-100 text-red-900",
};

export default function StatusBadge({ status }: { status: string }) {
  const label = isOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
        COLORS[status] ?? "bg-mist text-coal"
      }`}
    >
      {label}
    </span>
  );
}
