import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createProfile,
  getAuthRedirectPath,
  getProfile,
} from "@/lib/auth/profile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const existingProfile = await getProfile(user.id);

    if (!existingProfile) {
      try {
        await createProfile(user.id);
      } catch {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }

    const redirectPath = await getAuthRedirectPath(user.id);
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
