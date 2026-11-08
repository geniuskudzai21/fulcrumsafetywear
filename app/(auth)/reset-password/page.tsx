import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthCard
        title="Reset link expired"
        subtitle="Reset links can only be used once and expire after a short time."
      >
        <Link
          href="/forgot-password"
          className="inline-block bg-ink text-gold font-bold py-3 px-4 rounded"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return <ResetPasswordForm />;
}
