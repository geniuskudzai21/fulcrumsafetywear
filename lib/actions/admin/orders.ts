"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { canTransition } from "@/lib/admin/orders";
import { adminOrderStatusSchema } from "@/lib/admin/validation";

export type OrderStatusState = {
  error?: string;
  success?: string;
};

export async function updateOrderStatusAction(
  _previous: OrderStatusState,
  formData: FormData,
): Promise<OrderStatusState> {
  const { supabase } = await requireAdmin();
  const parsed = adminOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid order status.",
    };
  }

  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (readError) return { error: readError.message };
  if (!order) return { error: "Order not found." };

  if (!canTransition(order.status, parsed.data.status)) {
    return {
      error: `Cannot move an order from ${order.status} to ${parsed.data.status}.`,
    };
  }

  const { error } = await supabase.rpc("admin_set_order_status", {
    p_order_id: parsed.data.orderId,
    p_status: parsed.data.status,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/");

  return {
    success:
      parsed.data.status === "cancelled"
        ? "Order cancelled and stock restored."
        : `Order marked ${parsed.data.status}.`,
  };
}
