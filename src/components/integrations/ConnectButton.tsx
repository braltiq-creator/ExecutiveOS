"use client";

import { useTransition } from "react";
import { connectIntegrationAction } from "@/lib/integrations/actions";
import type { ProviderId } from "@/lib/integrations/types";

type ConnectButtonProps = {
  providerId: ProviderId;
  disabled?: boolean;
  label?: string;
  onError?: (message: string) => void;
};

const buttonClassName =
  "inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60";

export function ConnectButton({
  providerId,
  disabled = false,
  label = "Connect",
  onError,
}: ConnectButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    startTransition(async () => {
      const result = await connectIntegrationAction({ providerId });

      if (result.error) {
        onError?.(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={disabled || isPending}
      className={buttonClassName}
    >
      {isPending ? "Connecting..." : label}
    </button>
  );
}
