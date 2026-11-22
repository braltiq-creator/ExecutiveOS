import Link from "next/link";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { Reveal } from "@/experience/motion/Reveal";

type Props = {
  entryLabel: string;
};

export function KnowledgeHeader({ entryLabel }: Props) {
  const Icon = EXECUTIVE_ICONS.knowledge;

  return (
    <Reveal delay={0}>
      <header className="space-y-4 border-b border-[var(--exs-divider)] pb-5">
        <nav aria-label="Breadcrumb" className="exs-label">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/today"
                className="text-[var(--exs-nav)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
              >
                Today
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--exs-text-muted)]">
              /
            </li>
            <li aria-current="page">Knowledge</li>
          </ol>
        </nav>
        <div className="min-w-0 space-y-2">
          <p className="exs-label flex items-center gap-1.5 tracking-[0.08em]">
            <Icon
              className="h-3.5 w-3.5 text-[var(--exs-intelligence)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Connected Intelligence
          </p>
          <h1 className="font-display text-[length:clamp(1.35rem,2.2vw,1.65rem)] font-semibold tracking-[-0.03em] text-[var(--exs-text)]">
            Why should I trust this?
          </h1>
          <p className="exs-body max-w-xl text-[length:0.85rem]">{entryLabel}</p>
        </div>
      </header>
    </Reveal>
  );
}
