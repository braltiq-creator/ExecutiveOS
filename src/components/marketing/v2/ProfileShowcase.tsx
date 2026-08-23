import Link from "next/link";
import { CommandCentreRender } from "@/components/marketing/v2/CommandCentreRender";
import { ExecPhoto } from "@/components/marketing/v2/ExecPhoto";
import { Reveal } from "@/components/marketing/v2/Reveal";
import { PROFILES } from "@/components/marketing/content";

const CARDS = [
  {
    profile: PROFILES.operations,
    tone: "operations" as const,
    photoCaption: "Operations leadership",
    outcomes: PROFILES.operations.outcomes.slice(0, 2),
  },
  {
    profile: PROFILES.commercial,
    tone: "leadership" as const,
    photoCaption: "Commercial leadership",
    outcomes: PROFILES.commercial.outcomes.slice(0, 2),
  },
  {
    profile: PROFILES.manufacturing,
    tone: "manufacturing" as const,
    photoCaption: "Manufacturing leadership",
    outcomes: PROFILES.manufacturing.outcomes.slice(0, 2),
  },
] as const;

export function ProfileShowcase() {
  return (
    <div className="mk-v2-profiles">
      {CARDS.map((card, index) => (
        <Reveal key={card.profile.id} delayMs={index * 90}>
          <Link href={card.profile.href} className="mk-v2-profile-card">
            <ExecPhoto tone={card.tone} caption={card.photoCaption} />
            <div className="mk-v2-profile-body">
              <p className="mk-card-meta">Executive Profile</p>
              <h3 className="mk-h3">{card.profile.name}</h3>
              <p className="mk-body">{card.profile.subheadline}</p>
              <div className="mk-v2-outcome-row">
                {card.outcomes.map((outcome) => (
                  <span key={outcome}>{outcome}</span>
                ))}
              </div>
              <div className="mk-v2-profile-mini">
                <CommandCentreRender />
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
