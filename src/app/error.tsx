"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message: "Global app error",
        error: {
          name: error.name,
          message: error.message,
          digest: error.digest,
        },
      }),
    );
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body className="flex min-h-screen items-center justify-center bg-canvas p-6 font-sans text-foreground">
        <div className="w-full max-w-lg">
          <ErrorState
            title="ExecutiveOS encountered an error"
            message={error.message || "An unexpected error occurred."}
          />
          <div className="mt-4 flex justify-center">
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
