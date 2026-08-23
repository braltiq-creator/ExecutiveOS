import type { Metadata } from "next";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { ABOUT_PAGE, SITE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "About",
  description: ABOUT_PAGE.subheadline,
};

export default function AboutPage() {
  return (
    <>
      <section className="mk-section mk-hero">
        <p className="mk-kicker">{SITE.company}</p>
        <h1 className="mk-display">{ABOUT_PAGE.headline}</h1>
        <p className="mk-lead">{ABOUT_PAGE.subheadline}</p>
        <MarketingCta
          secondaryHref="/support#contact"
          secondaryLabel="Contact"
        />
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <div className="mk-section-narrow">
            <p className="mk-kicker">Why we started</p>
            <h2 className="mk-h2">Judgement support was missing</h2>
            <p className="mk-lead">
              Organisations invested heavily in collaboration suites, CRM, ERP,
              and dashboards. Those systems are full. What was missing is not
              another place to store information — it is judgement support for
              the people who run the company.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-grid-2">
          <article className="mk-card">
            <p className="mk-card-meta">Vision</p>
            <h2 className="mk-h3">Essential as the calendar</h2>
            <p className="mk-body">{ABOUT_PAGE.vision}</p>
          </article>
          <article className="mk-card">
            <p className="mk-card-meta">Mission</p>
            <h2 className="mk-h3">Strategic time, returned</h2>
            <p className="mk-body">{ABOUT_PAGE.mission}</p>
          </article>
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight mk-center">
          <p className="mk-kicker">Philosophy</p>
          <h2 className="mk-h2">{SITE.philosophy}</h2>
          <p className="mk-lead">
            Does this make the decisive picture clearer, and the next judgement
            more confident? If the answer is no, it does not ship — and it does
            not go to market.
          </p>
        </div>
      </section>

      <section className="mk-section mk-section-tight">
        <div className="mk-grid-2">
          <article className="mk-card">
            <p className="mk-card-meta">Team</p>
            <h2 className="mk-h3">Building in public seriousness</h2>
            <p className="mk-body">
              {SITE.company} is building ExecutiveOS with the discipline of
              premium enterprise SaaS — evidence over spectacle.
            </p>
          </article>
          <article className="mk-card">
            <p className="mk-card-meta">Locations</p>
            <h2 className="mk-h3">English-first markets</h2>
            <p className="mk-body">
              Australia, United Kingdom, and United States first — with a
              long-term path to global Executive Intelligence infrastructure.
            </p>
          </article>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
