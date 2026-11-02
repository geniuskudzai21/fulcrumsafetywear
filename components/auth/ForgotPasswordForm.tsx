"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  type AuthFormState,
} from "@/lib/actions/auth";
import AuthCard from "./AuthCard";
import FieldError from "./FieldError";
import SubmitButton from "./SubmitButton";

const initial: AuthFormState = {};

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initial);

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email you use for Fulcrum Wear and we will send a reset link."
    >
      {state.error ? (
        <p
          role="alert"
          className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          {state.success}
        </p>
      ) : null}

      <form action={action} className="space-y-4">
        <label className="block text-sm font-semibold">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal"
          />
          <FieldError message={state.fieldErrors?.email} />
        </label>

        <SubmitButton>Send reset link</SubmitButton>
      </form>

      <p className="mt-5 text-sm text-coal/65">
        <Link href="/login" className="font-semibold underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
