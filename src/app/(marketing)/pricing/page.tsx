import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/marketing/FaqList";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { PricingCards } from "@/components/marketing/PricingCards";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { PRICING, PRICING_PAGE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Pricing",
  description: PRICING_PAGE.subheadline,
};

export default function PricingPage() {
  return (
    <>
      <section className="mk-section mk-hero">
        <p className="mk-kicker">Pricing</p>
        <h1 className="mk-display">{PRICING_PAGE.headline}</h1>
        <p className="mk-lead">{PRICING_PAGE.subheadline}</p>
        <TrustStrip />
      </section>

      <section className="mk-section mk-section-tight">
        <PricingCards />
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <div className="mk-grid-2">
            <article className="mk-card">
              <p className="mk-card-meta">What’s included</p>
              <h2 className="mk-h3">{PRICING.included}</h2>
              <ul className="mk-list">
                <li>Command Centre / Executive Brief</li>
                <li>Strategy · Decision · Knowledge · Operating Loop</li>
                <li>Executive Council</li>
                <li>Organisation Portal</li>
                <li>Self-service provisioning and Discovery</li>
                <li>Industry context when your Profile requires a pack</li>
              </ul>
            </article>
            <article className="mk-card">
              <p className="mk-card-meta">Trial terms</p>
              <h2 className="mk-h3">{PRICING.trial}</h2>
              <ul className="mk-list">
                <li>{PRICING.noSetup}</li>
                <li>{PRICING.noImplementation}</li>
                <li>Credit card for Individual and Executive Team</li>
                <li>Enterprise: quote · MSA · optional annual invoice</li>
              </ul>
              <div className="mk-actions">
                <Link
                  href="/support#contact"
                  className="mk-btn mk-btn-secondary"
                >
                  Contact for Enterprise
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-section-narrow" style={{ margin: "0 auto" }}>
          <p className="mk-kicker">FAQ</p>
          <h2 className="mk-h2">Commercial clarity</h2>
          <div style={{ marginTop: "2rem" }}>
            <FaqList />
          </div>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
