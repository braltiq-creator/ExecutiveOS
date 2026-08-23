import { MarketingCta } from "@/components/marketing/MarketingCta";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { SITE } from "@/components/marketing/content";

export function FinalCtaBand({
  headline = "Start Free Trial",
  body = "Thirty days. One Executive Intelligence Profile. No setup fee. No implementation fee.",
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <section className="mk-band">
      <div className="mk-section mk-center mk-section-tight">
        <p className="mk-kicker">{SITE.philosophy}</p>
        <h2 className="mk-h2">{headline}</h2>
        <p className="mk-lead">{body}</p>
        <MarketingCta />
        <div className="mk-center">
          <TrustStrip />
        </div>
      </div>
    </section>
  );
}
