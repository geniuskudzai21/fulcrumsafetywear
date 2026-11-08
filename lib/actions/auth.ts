"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authCallbackBase, authCallbackUrl, safeNext } from "@/lib/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";

export type AuthFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }

  return result;
}

function mapAuthError(message: string): string {
  const text = message.toLowerCase();

  if (text.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (text.includes("email not confirmed")) {
    return "Confirm your email before signing in. Check your inbox.";
  }

  if (text.includes("user already registered")) {
    return "An account with this email already exists. Log in instead.";
  }

  if (text.includes("password should be at least")) {
    return "Password must be at least 8 characters.";
  }

  if (text.includes("email rate limit") || text.includes("over_email_send_rate_limit")) {
    return "Supabase has temporarily limited confirmation emails. Check Supabase Dashboard > Authentication > Rate Limits and your SMTP provider's sending limits. If you use Supabase's default email service, configure custom SMTP before retrying.";
  }

  if (text.includes("rate limit") || text.includes("too many")) {
    return "Supabase Auth has temporarily limited this request. Check Supabase Dashboard > Authentication > Logs for the specific rate limit before retrying.";
  }

  return message;
}

async function origin() {
  const headerStore = await headers();
  return headerStore.get("origin");
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      error:
        "You are signed in, but we couldn't verify your account role. Refresh the page and try again.",
    };
  }

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect(safeNext(parsed.data.next));
}

export async function signupAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const next = safeNext(parsed.data.next);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: authCallbackUrl(next, await origin()),
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (data.user?.identities?.length === 0) {
    return {
      error: "An account with this email already exists. Log in instead.",
    };
  }

  if (!data.session) {
    return {
      success:
        "Check your email to confirm your account. The link expires in 24 hours.",
    };
  }

  redirect(next);
}

export async function googleAction(formData: FormData): Promise<void> {
  const next = safeNext(formData.get("next"));
  const requestOrigin = await origin();
  const cookieStore = await cookies();

  // Keep the return path in a cookie instead of a query string so the OAuth
  // redirect URL exactly matches the Supabase allowlist entry.
  cookieStore.set("fw-auth-next", next, {
    httpOnly: true,
    sameSite: "lax",
    secure:
      requestOrigin?.startsWith("https://") ??
      process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackBase(requestOrigin),
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(
        error ? mapAuthError(error.message) : "Could not start Google sign in.",
      )}`,
    );
  }

  redirect(data.url);
}

export async function forgotPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: authCallbackUrl("/reset-password", await origin()),
    },
  );

  if (error && error.status === 429) {
    return { error: "Too many attempts. Try again in a moment." };
  }

  return {
    success:
      "If an account exists for that email, we sent a password reset link.",
  };
}

export async function resetPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "This reset link is invalid or has expired. Request a new password reset link.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  redirect("/account?reset=1");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
