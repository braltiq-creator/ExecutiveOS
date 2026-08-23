import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { CommandCentreRender } from "@/components/marketing/v2/CommandCentreRender";
import { CommandCentreShowcase } from "@/components/marketing/v2/CommandCentreShowcase";
import { CouncilDiagram } from "@/components/marketing/v2/CouncilDiagram";
import { ExecPhoto } from "@/components/marketing/v2/ExecPhoto";
import { IntelligenceFlow } from "@/components/marketing/v2/IntelligenceFlow";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { StorySplit } from "@/components/marketing/v2/StorySplit";
import { PRODUCT, SITE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Product",
  description: PRODUCT.subheadline,
};

export default function ProductPage() {
  return (
    <>
      <section className="mk-section mk-v2-hero">
        <Reveal>
          <p className="mk-kicker">{SITE.category}</p>
          <h1 className="mk-display">{PRODUCT.headline}</h1>
          <p className="mk-lead">{PRODUCT.subheadline}</p>
          <MarketingCta
            secondaryHref="/profiles"
            secondaryLabel="Explore Profiles"
          />
        </Reveal>
      </section>

      <section className="mk-band">
        <div className="mk-section">
          <div className="mk-v2-section-head center">
            <p className="mk-kicker">Architecture</p>
            <h2 className="mk-h2">How Executive Intelligence flows</h2>
          </div>
          <IntelligenceFlow />
        </div>
      </section>

      <section className="mk-section">
        <StorySplit
          kicker="Executive Command Centre"
          title="Before the first meeting"
          body="Pulse, overnight change, and priority decisions — ranked against outcomes."
          outcome="Not a dashboard waiting for interpretation"
          visual={<CommandCentreRender variant="showcase" />}
        />
      </section>

      <section className="mk-band">
        <div className="mk-section">
          <div className="mk-v2-section-head center">
            <p className="mk-kicker">Annotated product</p>
            <h2 className="mk-h2">Command Centre, explained visually</h2>
          </div>
          <CommandCentreShowcase />
        </div>
      </section>

      <section className="mk-section">
        <StorySplit
          reverse
          kicker="Executive Council"
          title="Role-consistent judgement"
          body="CEO · CFO · COO · CRO · CSO — permanent seats. Domain Advisors advise; they do not join."
          outcome="AI advises. You decide."
          visual={<CouncilDiagram />}
        />
      </section>

      <section className="mk-band">
        <div className="mk-section">
          <StorySplit
            kicker="Executive Experience"
            title="Altitude without admin theatre"
            body="Strategy, Decision, and Knowledge keep executive altitude — warm light, sparse hierarchy."
            outcome="Built for people who run the company"
            visual={
              <ExecPhoto tone="operations" caption="Executive altitude" />
            }
          />
        </div>
      </section>

      <section className="mk-section">
        <StorySplit
          reverse
          kicker="Intelligence Packs"
          title="Industry context without forking Core"
          body="Manufacturing is the first production pack. Packs extend vocabulary and Council knowledge."
          outcome="Core stays the platform"
          visual={
            <ExecPhoto tone="manufacturing" caption="Industry without custom forks" />
          }
          action={
            <div className="mk-actions">
              <Link
                href="/profiles/manufacturing"
                className="mk-btn mk-btn-secondary"
              >
                Manufacturing Profile
              </Link>
            </div>
          }
        />
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <Reveal>
            <article className="mk-card">
              <p className="mk-card-meta">Architecture principle</p>
              <h2 className="mk-h3">Packs extend. Core does not fork.</h2>
              <p className="mk-body">
                ExecutiveOS sits above Microsoft 365, Salesforce, Simpro, and
                Dynamics — it does not replace them.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
