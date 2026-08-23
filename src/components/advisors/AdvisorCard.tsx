import type { AgentDefinition, AgentId } from "@/lib/agents/types";

type AdvisorCardProps = {
  agent: AgentDefinition;
  selected: boolean;
  recommended: boolean;
  onSelect: (agentId: AgentId) => void;
};

const ACCENT_STYLES: Record<string, { border: string; badge: string; dot: string }> = {
  zinc: {
    border: "border-zinc-300 ring-zinc-200",
    badge: "bg-zinc-100 text-zinc-700",
    dot: "bg-zinc-500",
  },
  indigo: {
    border: "border-indigo-300 ring-indigo-200",
    badge: "bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  violet: {
    border: "border-violet-300 ring-violet-200",
    badge: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  emerald: {
    border: "border-emerald-300 ring-emerald-200",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  sky: {
    border: "border-sky-300 ring-sky-200",
    badge: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  amber: {
    border: "border-amber-300 ring-amber-200",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  rose: {
    border: "border-rose-300 ring-rose-200",
    badge: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  orange: {
    border: "border-orange-300 ring-orange-200",
    badge: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  cyan: {
    border: "border-cyan-300 ring-cyan-200",
    badge: "bg-cyan-50 text-cyan-700",
    dot: "bg-cyan-500",
  },
  fuchsia: {
    border: "border-fuchsia-300 ring-fuchsia-200",
    badge: "bg-fuchsia-50 text-fuchsia-700",
    dot: "bg-fuchsia-500",
  },
};

export function AdvisorCard({
  agent,
  selected,
  recommended,
  onSelect,
}: AdvisorCardProps) {
  const accent = ACCENT_STYLES[agent.accentColor] ?? ACCENT_STYLES.zinc;

  return (
    <button
      type="button"
      onClick={() => onSelect(agent.id)}
      className={[
        "rounded-xl border bg-white p-4 text-left transition-all hover:shadow-sm",
        selected ? `ring-2 ${accent.border}` : "border-zinc-200 hover:border-zinc-300",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
          <p className="text-sm font-semibold text-zinc-900">{agent.name}</p>
        </div>
        {recommended ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${accent.badge}`}>
            Recommended
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs font-medium text-zinc-500">{agent.title}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
        {agent.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {agent.expertise.slice(0, 2).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600"
          >
            {skill}
          </span>
        ))}
      </div>
    </button>
  );
}
