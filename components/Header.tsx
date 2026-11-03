"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import fulcrumLogo from "@/images/logo.png";
import { signOutAction } from "@/lib/actions/auth";
import { cartCount, useCartStore } from "@/lib/store/cart";
import { useAuth } from "./auth/AuthProvider";
import { useStore } from "./StoreProvider";

function SearchBar({
  id,
  query,
  onChange,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  className = "",
}: {
  id: string;
  query: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  onFocus: () => void;
  onBlur: () => void;
  className?: string;
}) {
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`flex h-9 min-w-0 items-center overflow-hidden rounded-full bg-white pl-4 pr-1 text-coal ring-2 ring-transparent transition focus-within:ring-gold ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="text"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search workwear, hi-vis, PPE"
        autoComplete="off"
        enterKeyHint="search"
        className="min-w-0 flex-1 appearance-none bg-transparent text-sm outline-none focus-visible:outline-none placeholder:text-coal/40"
      />
      {query ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-coal/40 transition-colors hover:bg-mist hover:text-coal"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
      <button
        type="submit"
        aria-label="Search"
        className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-ink transition hover:brightness-95"
      >
        <svg
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
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
  const items = useCartStore((state) => state.items);
  const count = cartCount(items);
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchFocused = useRef(false);

  useEffect(() => {
    if (!searchFocused.current) setQuery(initialQuery);
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

  function navigateSearch(term: string, mode: "push" | "replace" = "push") {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    const search = params.toString();
    const url = search ? `/?${search}#shop` : "/";

    if (mode === "replace" && pathname === "/") {
      router.replace(url);
    } else {
      router.push(url);
    }
  }

  function handleSearch(value: string) {
    setQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      navigateSearch(value.trim(), "replace");
    }, 350);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    navigateSearch(query.trim());
  }

  function clearSearch() {
    setQuery("");
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    navigateSearch("");
  }

  return (
    <>
      <div className="bg-gold text-ink">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide sm:text-xs">
          Delivery across Zimbabwe &middot; Pay with EcoCash, card or cash on
          delivery
        </p>
      </div>

      <header className="sticky top-0 z-30 bg-ink/95 text-white shadow-sm backdrop-blur">
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
          <Link href="/" aria-label="Fulcrum Wear home" className="shrink-0">
            <Image
              src={fulcrumLogo}
              alt="Fulcrum Safety Wear"
              priority
              className="h-11 w-[68px] object-contain sm:w-[78px]"
            />
          </Link>
          <SearchBar
            id="q"
            query={query}
            onChange={handleSearch}
            onSubmit={submitSearch}
            onClear={clearSearch}
            onFocus={() => {
              searchFocused.current = true;
            }}
            onBlur={() => {
              searchFocused.current = false;
            }}
            className="hidden w-full max-w-xl justify-self-center md:flex"
          />
          <div className="flex items-center gap-1.5 sm:gap-2.5 justify-self-end">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gold text-[11px] font-bold text-ink transition hover:brightness-95"
                >
                  {initials || "U"}
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-10 w-52 rounded-lg border border-mist bg-white py-2 text-coal shadow-xl z-50">
                    <p className="truncate px-4 py-1 text-xs text-coal/60">
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
                        className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-mist"
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
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-gold hover:text-gold"
              >
                Log in
              </Link>
            )}
            <button
              id="openCart"
              onClick={openCart}
              className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Open cart"
            >
              <svg
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M6 6h15l-2 9H8L6 6zm0 0L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {count > 0 ? (
                <span
                  id="count"
                  className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink"
                >
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
        <div className="px-4 pb-2.5 md:hidden">
          <SearchBar
            id="q2"
            query={query}
            onChange={handleSearch}
            onSubmit={submitSearch}
            onClear={clearSearch}
            onFocus={() => {
              searchFocused.current = true;
            }}
            onBlur={() => {
              searchFocused.current = false;
            }}
            className="w-full"
          />
        </div>
        <div className="tape"></div>
      </header>
    </>
  );
}
