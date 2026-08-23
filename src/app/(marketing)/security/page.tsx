import type { Metadata } from "next";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { TrustVisual } from "@/components/marketing/v2/TrustVisual";
import { SECURITY_PAGE, SITE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Security",
  description: SECURITY_PAGE.subheadline,
};

const sections = [
  {
    title: "Tenant isolation",
    body: "Organisation-scoped access keeps executive context within the customer boundary. Leadership work stays in the organisation that owns it.",
  },
  {
    title: "Organisation Portal security",
    body: "Customers manage MFA, sessions, trusted devices, and security posture from the Organisation Portal — without waiting on Braltiq for routine control.",
  },
  {
    title: "MFA and sessions",
    body: "Authentication and session hygiene are part of the executive trust surface. Security is operational, not a brochure claim.",
  },
  {
    title: "Data stance",
    body: "Systems of record remain systems of record. ExecutiveOS sits above Microsoft 365, CRM, and ERP context — it does not pretend to replace them.",
  },
  {
    title: "Human authority",
    body: "AI and the Executive Council advise. The accountable executive decides. Explainability — stakes, alternatives, unknowns — is part of the product.",
  },
  {
    title: "Contact security",
    body: "Enterprise and Design Partner prospects can request a calm security conversation for procurement — facts, not fear marketing.",
  },
] as const;

export default function SecurityPage() {
  return (
    <>
      <section className="mk-section mk-v2-hero">
        <Reveal>
          <p className="mk-kicker">Security</p>
          <h1 className="mk-display">{SECURITY_PAGE.headline}</h1>
          <p className="mk-lead">{SECURITY_PAGE.subheadline}</p>
          <MarketingCta
            secondaryHref="/support#contact"
            secondaryLabel="Request security pack"
          />
        </Reveal>
      </section>

      <section className="mk-section mk-section-tight">
        <TrustVisual />
      </section>

      <section className="mk-section mk-section-tight">
        <div className="mk-grid-2">
          {sections.map((item) => (
            <article key={item.title} className="mk-card">
              <h2 className="mk-h3">{item.title}</h2>
              <p className="mk-body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight mk-center">
          <p className="mk-kicker">{SITE.philosophy}</p>
          <h2 className="mk-h2">Calm facts. No theatre.</h2>
          <p className="mk-lead">
            We do not use military-grade language. We describe isolation,
            explainability, and human authority as they exist in the product.
          </p>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
