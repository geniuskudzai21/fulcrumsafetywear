import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNext, siteOrigin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function redirectWithCleanup(url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.delete("fw-auth-next");
  return response;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const cookieStore = await cookies();
  const code = searchParams.get("code");
  const next = safeNext(
    searchParams.get("next") ?? cookieStore.get("fw-auth-next")?.value,
  );
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          return redirectWithCleanup(`${siteOrigin(origin)}/admin`);
        }
      }

      return redirectWithCleanup(`${siteOrigin(origin)}${next}`);
    }
  }

  const message =
    providerError ?? "We could not sign you in. Please try again.";

  return redirectWithCleanup(
    `${siteOrigin(origin)}/login?error=${encodeURIComponent(message)}`,
  );
}
