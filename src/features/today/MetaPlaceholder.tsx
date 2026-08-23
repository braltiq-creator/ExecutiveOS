import { SectionShell } from "@/components/shared/SectionShell";
import { isMockMode } from "@/lib/mock/mode";

export function MetaPlaceholder() {
  const mock = isMockMode();

  return (
    <SectionShell
      id="today-meta"
      label="Meta"
      description="Sync honesty, Trust gaps, and Briefing freshness — never configuration ransom."
    >
      <dl className="grid max-w-xl gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Session</dt>
          <dd className="mt-0.5 text-foreground">
            {mock ? "Mock authentication" : "Supabase session"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Briefing engine</dt>
          <dd className="mt-0.5 text-foreground">Shell only · Sprint 1</dd>
        </div>
        <div>
          <dt className="text-muted">Trust</dt>
          <dd className="mt-0.5 text-foreground">
            Connectors deferred — gaps remain honest
          </dd>
        </div>
        <div>
          <dt className="text-muted">Freshness</dt>
          <dd className="mt-0.5 text-foreground">Mock portfolio · local</dd>
        </div>
      </dl>
    </SectionShell>
  );
}
