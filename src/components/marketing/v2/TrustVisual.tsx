import Link from "next/link";
import { MkIcon } from "@/components/marketing/v2/MkIcon";
import { Reveal } from "@/components/marketing/v2/Reveal";

const BADGES = [
  {
    title: "Tenant isolation",
    body: "Organisation-scoped executive context",
    icon: "system_health" as const,
  },
  {
    title: "Human authority",
    body: "AI advises. You decide.",
    icon: "people_health" as const,
  },
  {
    title: "Explainability",
    body: "Stakes, alternatives, unknowns",
    icon: "knowledge" as const,
  },
  {
    title: "Microsoft ecosystem",
    body: "Above M365 — complementary altitude",
    icon: "administration" as const,
  },
  {
    title: "Privacy posture",
    body: "Systems of record remain source",
    icon: "critical_risks" as const,
  },
  {
    title: "Enterprise ready",
    body: "Portal · security · procurement path",
    icon: "organisation_health" as const,
  },
];

export function TrustVisual() {
  return (
    <div className="mk-v2-trust">
      <div className="mk-v2-trust-grid">
        {BADGES.map((badge, index) => (
          <Reveal key={badge.title} delayMs={index * 60}>
            <article className="mk-v2-trust-badge">
              <MkIcon id={badge.icon} size={22} />
              <strong>{badge.title}</strong>
              <span>{badge.body}</span>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mk-actions" style={{ justifyContent: "center" }}>
        <Link href="/security" className="mk-btn mk-btn-secondary">
          Security overview
        </Link>
      </div>
    </div>
  );
}
