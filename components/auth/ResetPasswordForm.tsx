"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resetPasswordAction,
  type AuthFormState,
} from "@/lib/actions/auth";
import AuthCard from "./AuthCard";
import FieldError from "./FieldError";
import SubmitButton from "./SubmitButton";

const initial: AuthFormState = {};

export default function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initial);

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Use at least 8 characters. You will be signed in after saving."
    >
      {state.error ? (
        <p
          role="alert"
          className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <form action={action} className="space-y-4">
        <label className="block text-sm font-semibold">
          New password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal outline-none focus:outline-none focus-visible:outline-none"
          />
          <FieldError message={state.fieldErrors?.password} />
        </label>

        <label className="block text-sm font-semibold">
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full border border-steel rounded px-3 py-2 font-normal outline-none focus:outline-none focus-visible:outline-none"
          />
          <FieldError message={state.fieldErrors?.confirmPassword} />
        </label>

        <SubmitButton>Save password</SubmitButton>
      </form>

      <p className="mt-5 text-sm text-coal/65">
        <Link href="/forgot-password" className="font-semibold underline">
          Request a new reset link
        </Link>
      </p>
    </AuthCard>
  );
}
