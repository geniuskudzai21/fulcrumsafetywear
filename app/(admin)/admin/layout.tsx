import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { StoreProvider } from "@/components/StoreProvider";
import { signOutAction } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin | Fulcrum Wear",
  robots: { index: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  return (
    <StoreProvider>
      <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="bg-ink text-white lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col">
          <div className="px-4 py-4 lg:px-5 lg:py-5">
            <Link href="/admin" aria-label="Admin dashboard">
              <Image
                src="/images/logo2.jpeg"
                alt="Fulcrum Safety Wear"
                width={1280}
                height={853}
                className="h-11 w-auto"
              />
            </Link>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gold">
              Admin
            </p>
          </div>
          <div className="px-3 pb-4 lg:flex-1">
            <AdminNav />
          </div>
          <div className="hidden border-t border-white/10 p-4 lg:block">
            <Link
              href="/"
              className="block text-sm font-semibold text-white/70 hover:text-white"
            >
              View storefront
            </Link>
            <form action={signOutAction} className="mt-2">
              <button
                type="submit"
                className="text-sm font-semibold text-white/70 hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-mist bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-coal/45">
                  Fulcrum Wear operations
                </p>
                <p className="font-semibold">
                  {profile?.full_name || user.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm font-semibold underline lg:hidden"
                >
                  View store
                </Link>
                <form action={signOutAction} className="lg:hidden">
                  <button
                    type="submit"
                    className="text-sm font-semibold underline"
                  >
                    Log out
                  </button>
                </form>
                <span className="hidden text-sm text-coal/55 sm:block">
                  {user.email}
                </span>
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </StoreProvider>
  );
}
