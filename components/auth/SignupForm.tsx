"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type AuthFormState } from "@/lib/actions/auth";
import AuthCard from "./AuthCard";
import FieldError from "./FieldError";
import GoogleForm from "./GoogleForm";
import SubmitButton from "./SubmitButton";

const initial: AuthFormState = {};

export default function SignupForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const [state, action] = useActionState(signupAction, initial);
  const error = state.error ?? initialError;

  if (state.success) {
    return (
      <AuthCard
        title="Confirm your email"
        subtitle="One last step before you can sign in."
      >
        <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          {state.success}
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block font-semibold underline"
        >
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save your cart and keep track of orders across devices."
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
          Full name
          <input
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-1.5 font-normal"
          />
          <FieldError message={state.fieldErrors?.fullName} />
        </label>

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
            autoComplete="new-password"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-1.5 font-normal"
          />
          <FieldError message={state.fieldErrors?.password} />
        </label>

        <label className="block text-sm font-semibold">
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-1.5 font-normal"
          />
          <FieldError message={state.fieldErrors?.confirmPassword} />
        </label>

        <SubmitButton>Create account</SubmitButton>
      </form>

      <p className="mt-4 text-sm text-coal/65">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
