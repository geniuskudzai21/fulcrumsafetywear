"use client";

import Link from "next/link";
import { useActionState } from "react";
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

      <div className="my-4 flex items-center gap-3 text-xs text-coal/50">
        <span className="h-px flex-1 bg-mist" />
        or use your email
        <span className="h-px flex-1 bg-mist" />
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="next" value={next} />

        <label className="block text-sm font-semibold">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-1.5 font-normal"
          />
          <FieldError message={state.fieldErrors?.email} />
        </label>

        <label className="block text-sm font-semibold">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-1.5 font-normal"
          />
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

      <p className="mt-4 text-sm text-coal/65">
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
