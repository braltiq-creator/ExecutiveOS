import Link from "next/link";
import { FaqList } from "@/components/marketing/FaqList";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { PricingCards } from "@/components/marketing/PricingCards";
import { CommandCentreRender } from "@/components/marketing/v2/CommandCentreRender";
import { CommandCentreShowcase } from "@/components/marketing/v2/CommandCentreShowcase";
import { CouncilDiagram } from "@/components/marketing/v2/CouncilDiagram";
import { ExecPhoto } from "@/components/marketing/v2/ExecPhoto";
import { HeroStage } from "@/components/marketing/v2/HeroStage";
import { IntelligenceFlow } from "@/components/marketing/v2/IntelligenceFlow";
import { ProfileShowcase } from "@/components/marketing/v2/ProfileShowcase";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { RoiInteractive } from "@/components/marketing/v2/RoiInteractive";
import { SocialProof } from "@/components/marketing/v2/SocialProof";
import { StorySplit } from "@/components/marketing/v2/StorySplit";
import { TrustVisual } from "@/components/marketing/v2/TrustVisual";
import { ValueKpiCards } from "@/components/marketing/v2/ValueKpiCards";
import { HOME, SITE } from "@/components/marketing/content";

export default function MarketingHomePage() {
  return (
    <>
      <HeroStage />

      {/* Story */}
      <section className="mk-band mk-v3-section-soft">
        <div className="mk-section mk-section-tight">
          <StorySplit
            kicker={SITE.category}
            title={HOME.categoryTitle}
            body={HOME.promise}
            outcome="Different job than BI, Copilot, or chat"
            visual={
              <ExecPhoto
                tone="boardroom"
                caption="Judgement infrastructure for leadership"
              />
            }
          />
        </div>
      </section>

      {/* Product */}
      <section className="mk-section">
        <StorySplit
          kicker="Product"
          title="The morning, declared"
          body="Command Centre ranks overnight change against outcomes — before the first meeting."
          outcome="Business outcome: attention without assembly fog"
          visual={<CommandCentreRender />}
          action={
            <div className="mk-actions">
              <Link href="/product" className="mk-btn mk-btn-secondary">
                Explore product
              </Link>
            </div>
          }
        />
      </section>

      {/* Architecture centrepiece */}
      <section className="mk-band">
        <div className="mk-section">
          <div className="mk-v2-section-head center">
            <p className="mk-kicker">Executive Intelligence</p>
            <h2 className="mk-h2">From systems of record to outcomes</h2>
            <p className="mk-lead">
              Above Microsoft 365, Dynamics, Salesforce, Simpro, and ERP — not a
              replacement.
            </p>
          </div>
          <IntelligenceFlow />
        </div>
      </section>

      {/* Command Centre showcase */}
      <section className="mk-section">
        <div className="mk-v2-section-head center">
          <p className="mk-kicker">Executive Command Centre</p>
          <h2 className="mk-h2">See the product</h2>
          <p className="mk-lead">
            Morning Brief · Organisation Health · Judgement Queue · Council —
            annotated.
          </p>
        </div>
        <CommandCentreShowcase />
      </section>

      {/* Council */}
      <section className="mk-band mk-v3-section-soft">
        <div className="mk-section">
          <div className="mk-v2-section-head center">
            <p className="mk-kicker">Executive Council</p>
            <h2 className="mk-h2">Relationships, not paragraphs</h2>
            <p className="mk-lead">
              Domain Advisors challenge. Five permanent executives judge. You
              decide.
            </p>
          </div>
          <CouncilDiagram />
        </div>
      </section>

      {/* Profiles */}
      <section className="mk-section">
        <div className="mk-v2-section-head center">
          <p className="mk-kicker">Executive Profiles</p>
          <h2 className="mk-h2">Choose how you lead</h2>
          <p className="mk-lead">
            One Executive Intelligence Profile included. Industry context when
            you need it.
          </p>
        </div>
        <ProfileShowcase />
      </section>

      {/* Value */}
      <section className="mk-band">
        <div className="mk-section">
          <div className="mk-v2-section-head center">
            <p className="mk-kicker">Executive Value</p>
            <h2 className="mk-h2">Outcomes you can point to</h2>
            <p className="mk-lead">
              Illustrative anchors for conversation — not guarantees.
            </p>
          </div>
          <ValueKpiCards />
        </div>
      </section>

      {/* ROI */}
      <section className="mk-section">
        <div className="mk-v2-section-head center">
          <p className="mk-kicker">ROI</p>
          <h2 className="mk-h2">Business outcomes over features</h2>
        </div>
        <RoiInteractive />
      </section>

      {/* Journey */}
      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <StorySplit
            reverse
            kicker="Customer journey"
            title="Stranger to morning ritual"
            body="Understand the category. Choose a Profile. Start a 30-day trial. Make Command Centre the first open of the day."
            outcome="No setup fee · No implementation fee"
            visual={
              <ExecPhoto tone="leadership" caption="From curiosity to habit" />
            }
          />
        </div>
      </section>

      {/* Trust */}
      <section className="mk-section">
        <div className="mk-v2-section-head center">
          <p className="mk-kicker">Trust</p>
          <h2 className="mk-h2">Trust is part of the product</h2>
          <p className="mk-lead">
            Isolation, explainability, and human authority — designed for
            executive work.
          </p>
        </div>
        <TrustVisual />
      </section>

      {/* Social proof */}
      <section className="mk-band mk-v3-section-soft">
        <div className="mk-section">
          <div className="mk-v2-section-head center">
            <p className="mk-kicker">Social proof</p>
            <h2 className="mk-h2">Earned, never invented</h2>
            <p className="mk-lead">
              Design Partners, testimonials, and case studies — published with
              approval.
            </p>
          </div>
          <SocialProof />
        </div>
      </section>

      {/* Pricing */}
      <section className="mk-section" id="pricing">
        <div className="mk-v2-section-head center">
          <p className="mk-kicker">Pricing</p>
          <h2 className="mk-h2">Simple packaging. Serious altitude.</h2>
          <p className="mk-lead">
            Buy Executive Intelligence. Connect systems when you’re ready.
          </p>
        </div>
        <PricingCards />
      </section>

      {/* FAQs */}
      <section className="mk-section">
        <div className="mk-section-narrow" style={{ margin: "0 auto" }}>
          <Reveal>
            <p className="mk-kicker">FAQs</p>
            <h2 className="mk-h2">Clear answers</h2>
          </Reveal>
          <div style={{ marginTop: "2rem" }}>
            <FaqList />
          </div>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
