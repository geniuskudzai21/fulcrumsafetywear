"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";
import AuthCard from "./AuthCard";
import FieldError from "./FieldError";
import GoogleForm from "./GoogleForm";
import SubmitButton from "./SubmitButton";

const initial: AuthFormState = {};

export default function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const error = state.error ?? initialError;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to sync your cart and view your orders."
    >
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {error}
        </p>
      ) : null}

      <GoogleForm next={next} />

      <div className="my-3 flex items-center gap-3 text-xs text-coal/50">
        <span className="h-px flex-1 bg-mist" />
        or use your email
        <span className="h-px flex-1 bg-mist" />
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="next" value={next} />

        <label className="block text-sm font-semibold">
          Email
          <div className="relative mt-1">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coal/40"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full border border-steel rounded pl-9 pr-3 py-1.5 font-normal outline-none focus:outline-none focus-visible:outline-none"
            />
          </div>
          <FieldError message={state.fieldErrors?.email} />
        </label>

        <label className="block text-sm font-semibold">
          Password
          <div className="relative mt-1">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coal/40"
            >
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="w-full border border-steel rounded pl-9 pr-10 py-1.5 font-normal outline-none focus:outline-none focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-coal/40 transition hover:text-coal"
            >
              {showPassword ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.3 4.2" />
                  <path d="M6.6 6.6C3.8 8.6 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.2-.9" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <FieldError message={state.fieldErrors?.password} />
        </label>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold underline"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton>{pending ? "Signing in..." : "Sign in"}</SubmitButton>
      </form>

      <p className="mt-3 text-sm text-coal/65">
        New here?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold underline"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
