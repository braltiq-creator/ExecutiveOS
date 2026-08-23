import Link from "next/link";
import { MkIcon } from "@/components/marketing/v2/MkIcon";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { PRICING, SITE } from "@/components/marketing/content";

const packages = [
  {
    ...PRICING.individual,
    cta: { href: SITE.primaryCta.href, label: "Start Free Trial" },
    featured: false,
  },
  {
    ...PRICING.team,
    cta: { href: SITE.primaryCta.href, label: "Start Free Trial" },
    featured: true,
  },
  {
    ...PRICING.enterprise,
    cta: { href: SITE.enterpriseCta.href, label: SITE.enterpriseCta.label },
    featured: false,
  },
] as const;

export function PricingCards() {
  return (
    <div className="mk-v3-pricing">
      {packages.map((pkg, index) => (
        <Reveal key={pkg.name} delayMs={index * 90}>
          <article
            className={`mk-v3-price-card ${pkg.featured ? "is-featured" : ""}`}
          >
            {pkg.featured ? (
              <p className="mk-v3-price-badge">Most teams start here</p>
            ) : (
              <p className="mk-card-meta">Package</p>
            )}
            <h3 className="mk-h3">{pkg.name}</h3>
            <p className="mk-price">
              {pkg.price}
              {pkg.period ? <span>{pkg.period}</span> : null}
            </p>
            <p className="mk-body">{pkg.blurb}</p>
            <ul className="mk-v3-price-list">
              <li>
                <MkIcon id="executive_intelligence" size={16} />
                {PRICING.included}
              </li>
              <li>
                <MkIcon id="today" size={16} />
                {PRICING.trial}
              </li>
              <li>
                <MkIcon id="value" size={16} />
                {PRICING.noSetup}
              </li>
              <li>
                <MkIcon id="organisation_health" size={16} />
                {PRICING.noImplementation}
              </li>
            </ul>
            <div className="mk-actions">
              <Link
                href={pkg.cta.href}
                className={
                  pkg.featured
                    ? "mk-btn mk-btn-primary"
                    : "mk-btn mk-btn-secondary"
                }
              >
                {pkg.cta.label}
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
