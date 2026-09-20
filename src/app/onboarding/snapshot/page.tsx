import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { SnapshotStudio } from "@/executive-snapshot-studio/wizard";
import { requireAppSession } from "@/services/session";
import { getDataSourceByIdDurable } from "@/verified-evidence/data-sources/supabase-store";
import { getDataSource } from "@/verified-evidence/data-sources/store";
import { useMemoryWeeklyIngestion } from "@/verified-evidence/data-sources/backend";
import { requireStudioActor } from "@/executive-snapshot-studio/server/auth";

/**
 * Executive Snapshot Studio — first Design Partner wow workflow
 * and Phase 37C recurring upload (?source=&mode=recurring).
 */
export default async function ExecutiveSnapshotStudioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAppAccess({ requireOnboarding: false });
  const session = await requireAppSession();
  const params = searchParams ? await searchParams : {};
  const sourceParam = params.source;
  const modeParam = params.mode;
  const dataSourceId =
    typeof sourceParam === "string" ? sourceParam.trim() : "";
  const recurring = modeParam === "recurring" || Boolean(dataSourceId);

  let recurringSourceName: string | undefined;
  if (dataSourceId) {
    const actor = await requireStudioActor(session.company.id);
    if (actor.ok) {
      if (useMemoryWeeklyIngestion()) {
        const row = getDataSource(dataSourceId);
        if (row && row.organizationId === actor.organisationId) {
          recurringSourceName = row.name;
        }
      } else {
        const row = await getDataSourceByIdDurable(
          actor.organisationId,
          dataSourceId,
        );
        if (row) recurringSourceName = row.name;
      }
    }
  }

  return (
    <AppFrame
      title={
        recurring
          ? recurringSourceName
            ? `Upload · ${recurringSourceName}`
            : "Upload New Data"
          : "Executive Snapshot Studio"
      }
      density="default"
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <SnapshotStudio
          organisationId={session.company.id}
          organisationName={session.company.name}
          profileId={session.profile.id}
          actorId={session.userId}
          productId="executiveos"
          recurringDataSourceId={dataSourceId || undefined}
          recurringSourceName={recurringSourceName}
          recurringMode={recurring}
        />
      </div>
    </AppFrame>
  );
}
