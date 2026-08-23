"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completeSalesforceConnect,
  disconnectSalesforce,
  runSalesforceSync,
  replaySalesforceCdc,
} from "@/providers/salesforce/configuration/actions";

type SalesforceAdminControlsProps = {
  connected: boolean;
};

export function SalesforceAdminControls({
  connected,
}: SalesforceAdminControlsProps) {
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
              const result = await completeSalesforceConnect({
                orgId: "northline-sf",
                userId: "admin@executiveos.test",
              });
              setMessage(result.message);
              router.refresh();
            });
          }}
        >
          Connect Salesforce
        </button>
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await runSalesforceSync({ mode: "incremental" });
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
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await runSalesforceSync({ mode: "cdc" });
                setMessage(result.message);
                router.refresh();
              });
            }}
          >
            CDC sync
          </button>
          <button
            type="button"
            disabled={pending}
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await replaySalesforceCdc();
                setMessage(result.message);
                router.refresh();
              });
            }}
          >
            Replay
          </button>
          <button
            type="button"
            disabled={pending}
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                await disconnectSalesforce();
                setMessage("Disconnected safely");
                router.refresh();
              });
            }}
          >
            Disconnect
          </button>
        </>
      )}
      {message ? <p className="text-xs text-zinc-500">{message}</p> : null}
    </div>
  );
}
