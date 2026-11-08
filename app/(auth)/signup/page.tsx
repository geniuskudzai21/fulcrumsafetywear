import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeNext(first(params.next));

  return <SignupForm next={next} initialError={first(params.error)} />;
}
