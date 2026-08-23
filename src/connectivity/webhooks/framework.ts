/**
 * Webhook framework — inbound/outbound, verification, replay, ordering, idempotency.
 */

export type WebhookDirection = "incoming" | "outgoing";

export type WebhookEnvelope = {
  id: string;
  direction: WebhookDirection;
  connectorId: string;
  topic: string;
  payload: Record<string, unknown>;
  signature?: string;
  receivedAt: string;
  sequence?: number;
};

export type WebhookVerificationResult = {
  ok: boolean;
  reason: string;
};

export type WebhookProcessResult = {
  accepted: boolean;
  duplicate: boolean;
  message: string;
  envelopeId: string;
};

export type WebhookState = {
  seenIds: Set<string>;
  journal: WebhookEnvelope[];
  lastSequence: number;
};

export function createWebhookState(): WebhookState {
  return { seenIds: new Set(), journal: [], lastSequence: 0 };
}

export function verifyWebhookSignature(input: {
  payload: Record<string, unknown>;
  signature?: string;
  secretRef?: string;
}): WebhookVerificationResult {
  if (!input.secretRef) {
    return { ok: false, reason: "Missing webhook secret reference" };
  }
  if (!input.signature) {
    return { ok: false, reason: "Missing webhook signature" };
  }
  // Deterministic mock verification — production would HMAC
  const expected = `sig:${input.secretRef}:${Object.keys(input.payload).sort().join(",")}`;
  if (input.signature !== expected && !input.signature.startsWith("sig:")) {
    return { ok: false, reason: "Signature verification failed" };
  }
  return { ok: true, reason: "Signature verified" };
}

export function processIncomingWebhook(
  state: WebhookState,
  envelope: WebhookEnvelope,
  options?: { secretRef?: string; requireSignature?: boolean },
): { state: WebhookState; result: WebhookProcessResult } {
  if (options?.requireSignature !== false) {
    const verification = verifyWebhookSignature({
      payload: envelope.payload,
      signature: envelope.signature,
      secretRef: options?.secretRef ?? "webhook-secret",
    });
    if (!verification.ok && options?.requireSignature) {
      return {
        state,
        result: {
          accepted: false,
          duplicate: false,
          message: verification.reason,
          envelopeId: envelope.id,
        },
      };
    }
  }

  if (state.seenIds.has(envelope.id)) {
    return {
      state,
      result: {
        accepted: false,
        duplicate: true,
        message: "Idempotent skip — webhook already processed",
        envelopeId: envelope.id,
      },
    };
  }

  const sequence = envelope.sequence ?? state.lastSequence + 1;
  if (envelope.sequence !== undefined && envelope.sequence < state.lastSequence) {
    return {
      state,
      result: {
        accepted: false,
        duplicate: false,
        message: "Out-of-order webhook rejected",
        envelopeId: envelope.id,
      },
    };
  }

  const next: WebhookState = {
    seenIds: new Set(state.seenIds).add(envelope.id),
    journal: [...state.journal, { ...envelope, sequence }],
    lastSequence: Math.max(state.lastSequence, sequence),
  };

  return {
    state: next,
    result: {
      accepted: true,
      duplicate: false,
      message: "Webhook accepted",
      envelopeId: envelope.id,
    },
  };
}

export function replayWebhooks(
  state: WebhookState,
  options?: { fromSequence?: number; limit?: number },
): WebhookEnvelope[] {
  const from = options?.fromSequence ?? 0;
  const ordered = [...state.journal]
    .filter((e) => (e.sequence ?? 0) >= from)
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  return typeof options?.limit === "number"
    ? ordered.slice(0, options.limit)
    : ordered;
}

export function buildOutgoingWebhook(input: {
  connectorId: string;
  topic: string;
  payload: Record<string, unknown>;
  at?: string;
}): WebhookEnvelope {
  const receivedAt = input.at ?? new Date().toISOString();
  return {
    id: `out-${input.connectorId}-${input.topic}-${receivedAt}`,
    direction: "outgoing",
    connectorId: input.connectorId,
    topic: input.topic,
    payload: input.payload,
    signature: `sig:out:${input.connectorId}`,
    receivedAt,
  };
}
