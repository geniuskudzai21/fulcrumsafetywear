"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
      <h2 className="d text-xl">Something went wrong</h2>
      <p className="mt-2 text-sm text-coal/65">
        The admin request could not be completed. Try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 bg-ink text-gold font-bold py-2.5 px-4 rounded"
      >
        Try again
      </button>
    </div>
  );
}
