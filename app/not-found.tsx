import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-white px-4">
      <div className="text-center max-w-md">
        <p className="d text-6xl text-coal/20">404</p>
        <h1 className="d text-3xl mt-3">Page not found</h1>
        <p className="mt-3 text-coal/60">
          That page or product is not available. It may have been removed or
          the link may be wrong.
        </p>
        <Link
          href="/#shop"
          className="inline-block mt-6 bg-ink text-gold font-bold px-6 py-3 rounded"
        >
          Browse workwear
        </Link>
      </div>
    </main>
  );
}
