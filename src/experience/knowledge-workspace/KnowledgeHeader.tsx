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
      <header className="space-y-3 border-b border-[var(--exs-divider)] pb-4">
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
              →
            </li>
            <li aria-current="page">Knowledge</li>
          </ol>
        </nav>
        <div className="min-w-0 space-y-1">
          <p className="exs-label flex items-center gap-1.5">
            <Icon
              className="h-3.5 w-3.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Knowledge Workspace
          </p>
          <h1 className="exs-title text-[length:1.45rem]">
            Why should I trust this?
          </h1>
          <p className="exs-body text-[length:0.8rem]">{entryLabel}</p>
        </div>
      </header>
    </Reveal>
  );
}
