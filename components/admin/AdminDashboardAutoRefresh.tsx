"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL = 15_000;

export default function AdminDashboardAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const interval = window.setInterval(
      refreshIfVisible,
      REFRESH_INTERVAL,
    );
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [router]);

  return (
    <p className="mt-1 text-xs text-coal/50">
      Dashboard refreshes automatically every 15 seconds.
    </p>
  );
}
