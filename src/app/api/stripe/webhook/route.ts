import { handleStripeWebhookEvent } from "@/lib/billing/webhooks";
import { verifyStripeWebhookSignature } from "@/lib/billing/stripe";
import { BillingError } from "@/lib/billing/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const event = verifyStripeWebhookSignature(payload, signature);

    await handleStripeWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 500 },
    );
  }
}
