"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completeSimproConnect,
  disconnectSimpro,
  runSimproSync,
} from "@/providers/simpro/configuration/actions";

type SimproAdminControlsProps = {
  connected: boolean;
};

export function SimproAdminControls({ connected }: SimproAdminControlsProps) {
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
              const result = await completeSimproConnect({
                companyId: "northline-simpro",
                userId: "admin@executiveos.test",
              });
              setMessage(result.message);
              router.refresh();
            });
          }}
        >
          Connect Simpro
        </button>
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await runSimproSync({ mode: "incremental" });
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
                await disconnectSimpro();
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
