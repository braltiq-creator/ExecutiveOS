import { NextResponse } from "next/server";
import { processIntegrationWebhook } from "@/lib/integrations/sync";
import { IntegrationError } from "@/lib/integrations/types";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const integrationId = url.searchParams.get("integrationId");

  if (!integrationId) {
    return NextResponse.json(
      { error: "integrationId query parameter is required." },
      { status: 400 },
    );
  }

  let payload: Record<string, unknown> = {};

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  try {
    const job = await processIntegrationWebhook({
      integrationId,
      payload,
    });

    return NextResponse.json({
      ok: true,
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    const message =
      error instanceof IntegrationError
        ? error.message
        : "Webhook processing failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
