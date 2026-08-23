import { NextResponse } from "next/server";
import { completeIntegrationOAuth } from "@/lib/integrations/service";
import { IntegrationError } from "@/lib/integrations/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(
        `/settings/integrations?error=${encodeURIComponent(oauthError)}`,
        request.url,
      ),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=missing_oauth_params", request.url),
    );
  }

  try {
    const result = await completeIntegrationOAuth({ code, state });
    return NextResponse.redirect(
      new URL(`${result.redirectPath}?connected=1`, request.url),
    );
  } catch (error) {
    const message =
      error instanceof IntegrationError
        ? error.message
        : "Unable to complete integration authorization.";

    return NextResponse.redirect(
      new URL(
        `/settings/integrations?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
