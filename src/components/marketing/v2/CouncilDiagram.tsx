"use client";

import { Reveal } from "@/components/marketing/v2/Reveal";

const COUNCIL = [
  { id: "ceo", title: "CEO", lens: "Enterprise" },
  { id: "cfo", title: "CFO", lens: "Capital" },
  { id: "coo", title: "COO", lens: "Operations" },
  { id: "cro", title: "CRO", lens: "Commercial" },
  { id: "cso", title: "CSO", lens: "Strategy" },
] as const;

const ADVISORS = [
  "Demand",
  "Inventory",
  "Production",
  "Dealer",
  "Quality",
] as const;

export function CouncilDiagram() {
  return (
    <div className="mk-v2-council" aria-label="Executive Council relationship diagram">
      <Reveal>
        <p className="mk-v2-council-label">Domain Advisors · evidence & challenge</p>
        <div className="mk-v2-advisor-row">
          {ADVISORS.map((name) => (
            <span key={name} className="mk-v2-advisor-chip">
              {name}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mk-v2-council-flow" aria-hidden="true">
        <span />
      </div>

      <Reveal delayMs={120}>
        <p className="mk-v2-council-label">Executive Council · permanent seats</p>
        <div className="mk-v2-council-ring">
          {COUNCIL.map((role, index) => (
            <article
              key={role.id}
              className="mk-v2-council-seat"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <strong>{role.title}</strong>
              <span>{role.lens}</span>
            </article>
          ))}
        </div>
      </Reveal>

      <div className="mk-v2-council-flow" aria-hidden="true">
        <span />
      </div>

      <Reveal delayMs={220}>
        <div className="mk-v2-council-outcome">
          <div>
            <p className="mk-v2-council-label">Consensus</p>
            <p>Prepared recommendation with dissent preserved</p>
          </div>
          <div>
            <p className="mk-v2-council-label">Confidence</p>
            <div className="mk-v2-confidence">
              <i style={{ width: "72%" }} />
            </div>
          </div>
          <div>
            <p className="mk-v2-council-label">You decide</p>
            <p>AI advises. Authority stays human.</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
