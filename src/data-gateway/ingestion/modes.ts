import type { UdgIngestionMode } from "../contracts";
import { UDG_INGESTION_MODES } from "../contracts";

/**
 * Future ingestion modes — architecture supports without redesign.
 * v1 implements `upload` (+ api-shaped requests). Others are contracted.
 */
export const UDG_MODE_CONTRACTS: Record<
  UdgIngestionMode,
  { implemented: boolean; description: string }
> = {
  upload: {
    implemented: true,
    description: "Interactive / file upload into the gateway.",
  },
  scheduled: {
    implemented: false,
    description: "Cron / cadence-driven connector pulls.",
  },
  webhook: {
    implemented: false,
    description: "Push events from source systems.",
  },
  api: {
    implemented: true,
    description: "Programmatic ingestion via the same pipeline contract.",
  },
  streaming: {
    implemented: false,
    description: "Continuous event streams — same canonical snapshot boundary.",
  },
};

export function assertSupportedMode(mode: UdgIngestionMode): void {
  if (!UDG_INGESTION_MODES.includes(mode)) {
    throw new Error(`Unknown ingestion mode: ${mode}`);
  }
  const contract = UDG_MODE_CONTRACTS[mode];
  if (!contract.implemented) {
    throw new Error(
      `Ingestion mode "${mode}" is contracted but not implemented in UDG v1.`,
    );
  }
}
