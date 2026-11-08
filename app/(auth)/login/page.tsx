import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeNext(first(params.next));
  const error = first(params.error);

  return (
    <LoginForm
      next={next}
      initialError={
        error ??
        (first(params.next) && !next ? "That link was invalid." : undefined)
      }
    />
  );
}
