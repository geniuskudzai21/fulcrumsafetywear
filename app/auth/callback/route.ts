import { NextResponse } from "next/server";
import { safeNext, siteOrigin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
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
          return NextResponse.redirect(`${siteOrigin(origin)}/admin`);
        }
      }

      return NextResponse.redirect(`${siteOrigin(origin)}${next}`);
    }
  }

  const message =
    providerError ?? "We could not sign you in. Please try again.";

  return NextResponse.redirect(
    `${siteOrigin(origin)}/login?error=${encodeURIComponent(message)}`,
  );
}
