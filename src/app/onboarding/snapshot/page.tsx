import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { SnapshotStudio } from "@/executive-snapshot-studio/wizard";
import { requireAppSession } from "@/services/session";

/**
 * Executive Snapshot Studio — first Design Partner wow workflow.
 * /onboarding/snapshot
 */
export default async function ExecutiveSnapshotStudioPage() {
  await requireAppAccess({ requireOnboarding: false });
  const session = await requireAppSession();

  return (
    <AppFrame title="Executive Snapshot Studio" density="default">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <SnapshotStudio
          organisationId={session.company.id}
          organisationName={session.company.name}
          profileId={session.profile.id}
          actorId={session.userId}
          productId="executiveos"
        />
      </div>
    </AppFrame>
  );
}
