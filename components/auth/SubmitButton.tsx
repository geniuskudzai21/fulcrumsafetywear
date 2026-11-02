"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        variant === "primary"
          ? "w-full bg-ink text-gold font-bold py-3 rounded disabled:opacity-50"
          : "w-full border border-steel bg-white text-coal font-bold py-3 rounded hover:bg-mist disabled:opacity-50"
      }
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}
