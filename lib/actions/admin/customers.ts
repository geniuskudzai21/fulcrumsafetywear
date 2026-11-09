"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";

export type AdminActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidateCustomers() {
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
}

export async function deleteCustomerAction(input: {
  id: string;
}): Promise<AdminActionResult> {
  const { supabase, user } = await requireAdmin();
  const id = input.id?.trim() ?? "";

  if (!UUID_PATTERN.test(id)) {
    return { ok: false, error: "Invalid customer." };
  }

  if (id === user.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  if (!profile) {
    return { ok: false, error: "Customer not found." };
  }

  if (profile.role === "admin") {
    return { ok: false, error: "Admin accounts cannot be deleted here." };
  }

  let service;

  try {
    service = createServiceClient();
  } catch {
    return {
      ok: false,
      error: "Customer deletion is not configured on this server.",
    };
  }

  const { error } = await service.auth.admin.deleteUser(id);

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.from("audit_log").insert({
    admin_id: user.id,
    action: "delete",
    entity: "profiles",
    entity_id: id,
  });

  revalidateCustomers();

  return { ok: true, message: "Customer deleted." };
}
