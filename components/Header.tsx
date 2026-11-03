"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { cartCount, useCartStore } from "@/lib/store/cart";
import { useCurrencyStore, type Currency } from "@/lib/money";
import { useAuth } from "./auth/AuthProvider";
import { useStore } from "./StoreProvider";

function SearchBar({
  id,
  query,
  onChange,
  onSubmit,
  className = "",
}: {
  id: string;
  query: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`flex h-11 min-w-0 overflow-hidden rounded-lg bg-white text-coal ring-2 ring-transparent transition focus-within:ring-gold ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Fulcrum Wear"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-coal/45"
      />
      <button
        type="submit"
        aria-label="Search"
        className="grid w-12 shrink-0 place-items-center bg-gold text-ink transition-colors hover:bg-[#f5b91a]"
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      </button>
    </form>
  );
}

export default function Header({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const { openCart } = useStore();
  const { user } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const items = useCartStore((state) => state.items);
  const count = cartCount(items);
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    user?.email ||
    "";
  const initials = displayName.includes("@")
    ? displayName.slice(0, 2).toUpperCase()
    : displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

  useEffect(
    () => () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    },
    [],
  );

  function handleSearch(value: string) {
    setQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      navigateSearch(value.trim());
    }, 300);
  }

  function navigateSearch(term: string) {
    if (pathname === "/") {
      const params = new URLSearchParams(window.location.search);

      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      const search = params.toString();
      router.replace(search ? `/?${search}` : "/", { scroll: false });
      return;
    }

    const params = new URLSearchParams();
    if (term) params.set("q", term);
    const search = params.toString();
    router.push(search ? `/?${search}#shop` : "/#shop");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    navigateSearch(query.trim());
  }

  return (
    <>
      <div className="bg-gold text-ink text-sm font-semibold text-center py-2 px-3">
        Delivery across Zimbabwe. Pay with EcoCash, card or cash on delivery.
      </div>

      <header className="sticky top-0 z-30 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" aria-label="Fulcrum Wear home">
            <Image
              src="/images/logo2.jpeg"
              alt="Fulcrum Safety Wear"
              width={1280}
              height={853}
              className="h-12 w-auto"
            />
          </Link>
          <SearchBar
            id="q"
            query={query}
            onChange={handleSearch}
            onSubmit={submitSearch}
            className="hidden md:flex flex-1 max-w-2xl"
          />
          <div className="ml-auto flex items-center gap-3">
            <select
              id="cur"
              aria-label="Currency"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value as Currency)
              }
              className="bg-white/10 rounded px-2 py-1.5 text-sm"
            >
              <option className="text-black" value="USD">
                USD
              </option>
              <option className="text-black" value="ZWG">
                ZiG
              </option>
            </select>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  className="w-9 h-9 rounded-full bg-gold text-ink text-xs font-bold grid place-items-center hover:brightness-95"
                >
                  {initials || "U"}
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-11 w-52 bg-white text-coal rounded-lg shadow-xl border border-mist py-2 z-50">
                    <p className="px-4 py-1 text-xs text-coal/60 truncate">
                      {user.email}
                    </p>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold hover:bg-mist"
                    >
                      Account
                    </Link>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-mist"
                      >
                        Log out
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold hover:text-gold"
              >
                Log in
              </Link>
            )}
            <button
              id="openCart"
              onClick={openCart}
              className="relative p-2 rounded hover:bg-white/10"
              aria-label="Open cart"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M6 6h15l-2 9H8L6 6zm0 0L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span
                id="count"
                className="absolute -top-0.5 -right-0.5 bg-gold text-ink text-xs font-bold rounded-full min-w-5 h-5 grid place-items-center px-1"
              >
                {count}
              </span>
            </button>
          </div>
        </div>
        <div className="md:hidden px-4 pb-3">
          <SearchBar
            id="q2"
            query={query}
            onChange={handleSearch}
            onSubmit={submitSearch}
            className="w-full"
          />
        </div>
        <div className="tape"></div>
      </header>
    </>
  );
}
