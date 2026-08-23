import Link from "next/link";
import { SITE } from "@/components/marketing/content";

type MarketingCtaProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function MarketingCta({
  primaryHref = SITE.primaryCta.href,
  primaryLabel = SITE.primaryCta.label,
  secondaryHref = SITE.secondaryCta.href,
  secondaryLabel = SITE.secondaryCta.label,
  className = "mk-actions",
}: MarketingCtaProps) {
  return (
    <div className={className}>
      <Link href={primaryHref} className="mk-btn mk-btn-primary">
        {primaryLabel}
      </Link>
      {secondaryHref && secondaryLabel ? (
        <Link href={secondaryHref} className="mk-btn mk-btn-secondary">
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
