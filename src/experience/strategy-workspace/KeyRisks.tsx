import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwRisk } from "@/experience/strategy-workspace/types";

type Props = {
  risks: SwRisk[];
};

export function KeyRisks({ risks }: Props) {
  return (
    <Reveal delay={4}>
      <section
        id="key-risks"
        aria-label="Key Risks"
        className="scroll-mt-6"
      >
        <ExsSectionHeader
          label="Key Risks"
          icon={EXECUTIVE_ICONS.critical_risks}
        />
        {risks.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:1rem]">No strategic risks elevated</p>
            <p className="exs-body mt-1">
              Risk posture is contained relative to Organisation Health.
            </p>
          </article>
        ) : (
          <ul className="space-y-2">
            {risks.map((risk) => (
              <li key={risk.id}>
                <article className="exs-card">
                  <header className="flex items-start justify-between gap-3">
                    <p className="exs-title text-[length:0.95rem]">{risk.risk}</p>
                    <ExsOpenLink href={risk.href}>Open Risk →</ExsOpenLink>
                  </header>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-4">
                    <Field label="Likelihood" value={risk.likelihood} />
                    <Field label="Impact" value={risk.impact} />
                    <Field label="Owner" value={risk.owner} />
                    <Field label="Mitigation" value={risk.mitigation} />
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="exs-label">{label}</dt>
      <dd className="exs-body mt-0.5 line-clamp-2 text-[length:0.8rem]">
        {value}
      </dd>
    </div>
  );
}
