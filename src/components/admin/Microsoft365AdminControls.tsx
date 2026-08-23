"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completeMicrosoft365Connect,
  disconnectMicrosoft365,
  runMicrosoft365Sync,
} from "@/providers/microsoft365/configuration/actions";

type Microsoft365AdminControlsProps = {
  connected: boolean;
};

export function Microsoft365AdminControls({
  connected,
}: Microsoft365AdminControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!connected ? (
        <button
          type="button"
          disabled={pending}
          className="border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={() => {
            startTransition(async () => {
              const result = await completeMicrosoft365Connect({
                microsoftTenantId: "northline-m365-tenant",
                code: "admin-consent-code",
                userId: "admin@executiveos.test",
              });
              setMessage(result.message);
              router.refresh();
            });
          }}
        >
          Connect Microsoft 365
        </button>
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await runMicrosoft365Sync({ mode: "incremental" });
                setMessage(result.message);
                router.refresh();
              });
            }}
          >
            Run sync
          </button>
          <button
            type="button"
            disabled={pending}
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                await disconnectMicrosoft365();
                setMessage("Disconnected safely");
                router.refresh();
              });
            }}
          >
            Disconnect safely
          </button>
        </>
      )}
      {message ? (
        <p className="text-xs text-zinc-500">{message}</p>
      ) : null}
    </div>
  );
}
