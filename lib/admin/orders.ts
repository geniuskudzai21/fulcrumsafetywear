export const ORDER_STATUSES = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: string, to: string): boolean {
  if (!isOrderStatus(from) || !isOrderStatus(to)) return false;
  return ORDER_TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: string): OrderStatus[] {
  return isOrderStatus(from) ? ORDER_TRANSITIONS[from] : [];
}
