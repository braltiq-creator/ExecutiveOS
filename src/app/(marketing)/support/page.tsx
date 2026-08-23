import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { SUPPORT_PAGE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Support",
  description: SUPPORT_PAGE.subheadline,
};

export default function SupportPage() {
  return (
    <>
      <section className="mk-section mk-hero">
        <p className="mk-kicker">Support</p>
        <h1 className="mk-display">{SUPPORT_PAGE.headline}</h1>
        <p className="mk-lead">{SUPPORT_PAGE.subheadline}</p>
      </section>

      <section className="mk-section mk-section-tight">
        <div className="mk-grid-2">
          <article className="mk-card">
            <p className="mk-card-meta">Knowledge Base</p>
            <h2 className="mk-h3">Help yourself first</h2>
            <p className="mk-body">
              Guides for Command Centre, Discovery, Profiles, and Organisation
              Portal — written at executive altitude.
            </p>
            <Link href="/resources" className="mk-btn mk-btn-secondary">
              Browse resources
            </Link>
          </article>
          <article className="mk-card">
            <p className="mk-card-meta">Release notes</p>
            <h2 className="mk-h3">What shipped</h2>
            <p className="mk-body">
              Calm product updates — capability that exists, labelled honestly
              when it is roadmap.
            </p>
            <Link href="/blog" className="mk-btn mk-btn-secondary">
              Read the blog
            </Link>
          </article>
          <article className="mk-card">
            <p className="mk-card-meta">Organisation Portal</p>
            <h2 className="mk-h3">In-product support</h2>
            <p className="mk-body">
              Customers raise requests and manage subscription context from the
              Organisation Portal Support section.
            </p>
            <Link
              href="/organisation/support"
              className="mk-btn mk-btn-secondary"
            >
              Open Portal Support
            </Link>
          </article>
          <article className="mk-card">
            <p className="mk-card-meta">Design Partners</p>
            <h2 className="mk-h3">White-glove path</h2>
            <p className="mk-body">
              Design Partner pilots include founder access and a structured
              feedback cadence — separate from self-serve trial.
            </p>
            <Link href="/about" className="mk-btn mk-btn-secondary">
              About Braltiq
            </Link>
          </article>
        </div>
      </section>

      <section className="mk-band" id="contact">
        <div className="mk-section mk-section-tight">
          <div className="mk-section-narrow">
            <p className="mk-kicker">Contact</p>
            <h2 className="mk-h2">Talk to Braltiq</h2>
            <p className="mk-lead">
              Enterprise, security reviews, and Design Partner conversations —
              without a lead form maze.
            </p>
            <p className="mk-body">
              Email{" "}
              <a href="mailto:hello@braltiq.com">hello@braltiq.com</a> for
              Enterprise and security pack requests. Or start a free trial when
              you are ready to self-serve.
            </p>
            <div className="mk-actions">
              <Link href="/start-trial" className="mk-btn mk-btn-primary">
                Start Free Trial
              </Link>
              <a
                href="mailto:hello@braltiq.com"
                className="mk-btn mk-btn-secondary"
              >
                Email Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <FinalCtaBand />
    </>
  );
}
