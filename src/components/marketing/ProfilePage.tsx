import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/FinalCtaBand";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { CommandCentreRender } from "@/components/marketing/v2/CommandCentreRender";
import { ExecPhoto } from "@/components/marketing/v2/ExecPhoto";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { StorySplit } from "@/components/marketing/v2/StorySplit";
import { PROFILES, SITE } from "@/components/marketing/content";

type Profile = (typeof PROFILES)[keyof typeof PROFILES];

const PHOTO_TONE: Record<
  Profile["id"],
  "operations" | "leadership" | "manufacturing"
> = {
  operations: "operations",
  commercial: "leadership",
  manufacturing: "manufacturing",
};

export function ProfilePageView({
  profile,
  enterprise = false,
}: {
  profile: Profile;
  enterprise?: boolean;
}) {
  return (
    <>
      <section className="mk-section mk-v2-hero">
        <div className="mk-split">
          <Reveal>
            <p className="mk-kicker">{profile.name}</p>
            <h1 className="mk-display">{profile.headline}</h1>
            <p className="mk-lead">{profile.subheadline}</p>
            <MarketingCta
              primaryHref={`${SITE.primaryCta.href}?profile=${profile.id}`}
              primaryLabel={`Start Free Trial as ${profile.name.split(" ")[0]}`}
              secondaryHref={enterprise ? SITE.enterpriseCta.href : "/pricing"}
              secondaryLabel={
                enterprise ? SITE.enterpriseCta.label : "See Pricing"
              }
            />
          </Reveal>
          <Reveal delayMs={100}>
            <ExecPhoto
              tone={PHOTO_TONE[profile.id]}
              caption={profile.name}
            />
          </Reveal>
        </div>
      </section>

      <section className="mk-section">
        <StorySplit
          kicker="Morning rhythm"
          title="Dashboard preview"
          body={profile.journey}
          outcome={profile.outcomes[0] ?? "Judgement prepared"}
          visual={<CommandCentreRender />}
        />
      </section>

      <section className="mk-band">
        <div className="mk-section mk-section-tight">
          <div className="mk-v2-section-head">
            <p className="mk-kicker">Business outcomes</p>
            <h2 className="mk-h2">What this Profile prepares</h2>
          </div>
          <div className="mk-v2-outcome-row" style={{ maxWidth: "40rem" }}>
            {profile.outcomes.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="mk-body" style={{ marginTop: "1.5rem", maxWidth: "36rem" }}>
            {profile.who}
          </p>
        </div>
      </section>

      <section className="mk-section mk-section-tight">
        <Reveal>
          <article className="mk-card">
            <p className="mk-card-meta">Connectors</p>
            <h2 className="mk-h3">Hidden on purpose</h2>
            <p className="mk-body">{profile.connectorsNote}</p>
            <div className="mk-actions">
              <Link href="/profiles" className="mk-btn mk-btn-secondary">
                All Profiles
              </Link>
            </div>
          </article>
        </Reveal>
      </section>

      <FinalCtaBand
        body={`Start a 30-day trial as ${profile.name}. No setup fee. No implementation fee.`}
      />
    </>
  );
}
