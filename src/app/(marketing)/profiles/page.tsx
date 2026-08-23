import type { Metadata } from "next";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { ProfileShowcase } from "@/components/marketing/v2/ProfileShowcase";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { PROFILES_INDEX } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Executive Profiles",
  description: PROFILES_INDEX.subheadline,
};

export default function ProfilesPage() {
  return (
    <>
      <section className="mk-section mk-v2-hero">
        <Reveal>
          <p className="mk-kicker">Executive Profiles</p>
          <h1 className="mk-display">{PROFILES_INDEX.headline}</h1>
          <p className="mk-lead">{PROFILES_INDEX.subheadline}</p>
          <MarketingCta
            secondaryHref="/pricing"
            secondaryLabel="Compare on Pricing"
          />
        </Reveal>
      </section>

      <section className="mk-section mk-section-tight">
        <ProfileShowcase />
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <div className="mk-grid-2">
            <Reveal>
              <article className="mk-card">
                <p className="mk-card-meta">What’s included</p>
                <h2 className="mk-h3">One profile. Full platform altitude.</h2>
                <p className="mk-body">
                  Command Centre, Strategy, Decision, Knowledge, Executive
                  Council, Organisation Portal, and Discovery — shaped by the
                  Profile you choose.
                </p>
              </article>
            </Reveal>
            <Reveal delayMs={80}>
              <article className="mk-card">
                <p className="mk-card-meta">Packs vs Core</p>
                <h2 className="mk-h3">Industry context, stable platform</h2>
                <p className="mk-body">
                  Intelligence Packs add industry vocabulary and Council
                  knowledge. Manufacturing ships as a production pack. Core
                  remains unchanged.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
