"use client";

import { useEffect, useState } from "react";

export type PaymentStatusResult = {
  status: string;
  orderStatus: string;
  method: string | null;
  amount: number | string;
  updatedAt: string;
};

const TERMINAL = new Set(["paid", "failed"]);

export function usePaymentStatus(
  paymentId: string | null,
  enabled = true,
  intervalMs = 5000,
) {
  const [data, setData] = useState<PaymentStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId || !enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function check() {
      setLoading(true);

      try {
        const response = await fetch(`/api/payments/${paymentId}/status`, {
          cache: "no-store",
        });
        const body = (await response.json().catch(() => null)) as
          | (PaymentStatusResult & { error?: string })
          | null;

        if (cancelled) return;

        if (!response.ok) {
          setError(body?.error ?? "Could not check payment status.");

          if (response.status !== 401 && response.status !== 404) {
            timer = setTimeout(check, intervalMs);
          }

          return;
        }

        setError(null);
        setData(body as PaymentStatusResult);

        const done =
          !body ||
          TERMINAL.has(body.status) ||
          body.orderStatus === "cancelled";

        if (!done) {
          timer = setTimeout(check, intervalMs);
        }
      } catch {
        if (cancelled) return;
        setError("Could not check payment status.");
        timer = setTimeout(check, intervalMs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void check();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [paymentId, enabled, intervalMs]);

  return { data, loading, error };
}
