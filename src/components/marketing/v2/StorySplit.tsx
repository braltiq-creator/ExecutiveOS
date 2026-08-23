import type { ReactNode } from "react";
import { Reveal } from "@/components/marketing/v2/Reveal";

type StorySplitProps = {
  kicker: string;
  title: string;
  body: string;
  outcome: string;
  visual: ReactNode;
  reverse?: boolean;
  action?: ReactNode;
};

export function StorySplit({
  kicker,
  title,
  body,
  outcome,
  visual,
  reverse = false,
  action,
}: StorySplitProps) {
  return (
    <div className={`mk-v2-story ${reverse ? "is-reverse" : ""}`}>
      <Reveal className="mk-v2-story-copy">
        <p className="mk-kicker">{kicker}</p>
        <h2 className="mk-h2">{title}</h2>
        <p className="mk-lead">{body}</p>
        <p className="mk-v2-outcome-pill">{outcome}</p>
        {action}
      </Reveal>
      <Reveal delayMs={100} className="mk-v2-story-visual">
        {visual}
      </Reveal>
    </div>
  );
}
