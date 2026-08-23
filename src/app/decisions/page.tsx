import { Suspense } from "react";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { DecisionEngineProviders } from "@/components/providers/DecisionEngineProviders";
import { DecisionWorkspace } from "@/experience/decision-workspace";

export default async function DecisionsPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <DecisionEngineProviders>
      <AppFrame title="Decisions" density="snapshot">
        <Suspense fallback={<DecisionWorkspaceFallback />}>
          <DecisionWorkspace />
        </Suspense>
      </AppFrame>
    </DecisionEngineProviders>
  );
}

function DecisionWorkspaceFallback() {
  return (
    <div
      className="mx-auto w-full max-w-[1200px] space-y-4 pb-16"
      aria-hidden="true"
    >
      <div className="ex-skeleton h-24 w-full" />
      <div className="ex-skeleton h-40 w-full" />
      <div className="ex-skeleton h-48 w-full" />
    </div>
  );
}
