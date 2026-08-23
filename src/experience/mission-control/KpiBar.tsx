import { Reveal } from "@/experience/motion/Reveal";
import { kpiIcon } from "@/experience/icons";
import { ExsKpiCard } from "@/experience/exs";
import type { McKpi } from "@/experience/mission-control/types";

type Props = {
  kpis: McKpi[];
};

export function KpiBar({ kpis }: Props) {
  return (
    <Reveal delay={1}>
      <section aria-label="Executive KPIs" className="mc-kpi-bar">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {kpis.map((kpi) => (
            <li key={kpi.id} className="min-w-0">
              <ExsKpiCard kpi={kpi} icon={kpiIcon(kpi.id)} />
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
