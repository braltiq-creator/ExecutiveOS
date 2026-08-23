/**
 * Industry benchmarks — mock today, replaceable later.
 */

export type ContractorScale =
  | "small_contractor"
  | "medium_contractor"
  | "enterprise_contractor"
  | "utilities_contractor"
  | "mining_services_contractor";

export type TradeDiscipline =
  | "electrical"
  | "mechanical"
  | "hvac"
  | "fire"
  | "security"
  | "plumbing"
  | "communications";

export type BenchmarkProfile = {
  id: string;
  scale: ContractorScale;
  trade?: TradeDiscipline;
  label: string;
  /** Target / peer medians for key KPIs */
  medians: {
    technician_utilisation: number;
    first_time_fix_rate: number;
    gross_margin: number;
    sla_compliance: number;
    quote_conversion: number;
    cash_collection: number;
    job_backlog_per_tech: number;
  };
};

export const FIELD_SERVICE_BENCHMARKS: BenchmarkProfile[] = [
  {
    id: "bench-small",
    scale: "small_contractor",
    label: "Small Contractor",
    medians: {
      technician_utilisation: 78,
      first_time_fix_rate: 72,
      gross_margin: 30,
      sla_compliance: 92,
      quote_conversion: 38,
      cash_collection: 88,
      job_backlog_per_tech: 8,
    },
  },
  {
    id: "bench-medium",
    scale: "medium_contractor",
    label: "Medium Contractor",
    medians: {
      technician_utilisation: 82,
      first_time_fix_rate: 74,
      gross_margin: 27,
      sla_compliance: 94,
      quote_conversion: 42,
      cash_collection: 90,
      job_backlog_per_tech: 10,
    },
  },
  {
    id: "bench-enterprise",
    scale: "enterprise_contractor",
    label: "Enterprise Contractor",
    medians: {
      technician_utilisation: 85,
      first_time_fix_rate: 76,
      gross_margin: 24,
      sla_compliance: 96,
      quote_conversion: 45,
      cash_collection: 92,
      job_backlog_per_tech: 12,
    },
  },
  {
    id: "bench-utilities",
    scale: "utilities_contractor",
    trade: "electrical",
    label: "Utilities Contractor",
    medians: {
      technician_utilisation: 80,
      first_time_fix_rate: 78,
      gross_margin: 22,
      sla_compliance: 98,
      quote_conversion: 40,
      cash_collection: 91,
      job_backlog_per_tech: 9,
    },
  },
  {
    id: "bench-mining",
    scale: "mining_services_contractor",
    trade: "mechanical",
    label: "Mining Services Contractor",
    medians: {
      technician_utilisation: 88,
      first_time_fix_rate: 70,
      gross_margin: 26,
      sla_compliance: 95,
      quote_conversion: 36,
      cash_collection: 85,
      job_backlog_per_tech: 11,
    },
  },
  ...(["electrical", "mechanical", "hvac", "fire", "security", "plumbing", "communications"] as TradeDiscipline[]).map(
    (trade) => ({
      id: `bench-trade-${trade}`,
      scale: "medium_contractor" as const,
      trade,
      label: `${trade[0]!.toUpperCase()}${trade.slice(1)} Contractor`,
      medians: {
        technician_utilisation: 83,
        first_time_fix_rate: trade === "fire" || trade === "security" ? 80 : 73,
        gross_margin: trade === "communications" ? 29 : 25,
        sla_compliance: trade === "fire" ? 97 : 93,
        quote_conversion: 41,
        cash_collection: 89,
        job_backlog_per_tech: 10,
      },
    }),
  ),
];

export type BenchmarkComparison = {
  benchmarkId: string;
  benchmarkLabel: string;
  deltas: Array<{
    kpi: string;
    actual: number;
    median: number;
    delta: number;
    position: "above" | "inline" | "below";
  }>;
  summary: string;
};

export function compareToBenchmark(input: {
  benchmarkId: string;
  actual: {
    technician_utilisation?: number;
    first_time_fix_rate?: number;
    gross_margin?: number;
    sla_compliance?: number;
    quote_conversion?: number;
    cash_collection?: number;
  };
}): BenchmarkComparison | null {
  const benchmark = FIELD_SERVICE_BENCHMARKS.find(
    (item) => item.id === input.benchmarkId,
  );
  if (!benchmark) return null;

  const pairs: Array<[string, number | undefined, number]> = [
    [
      "technician_utilisation",
      input.actual.technician_utilisation,
      benchmark.medians.technician_utilisation,
    ],
    [
      "first_time_fix_rate",
      input.actual.first_time_fix_rate,
      benchmark.medians.first_time_fix_rate,
    ],
    ["gross_margin", input.actual.gross_margin, benchmark.medians.gross_margin],
    [
      "sla_compliance",
      input.actual.sla_compliance,
      benchmark.medians.sla_compliance,
    ],
    [
      "quote_conversion",
      input.actual.quote_conversion,
      benchmark.medians.quote_conversion,
    ],
    [
      "cash_collection",
      input.actual.cash_collection,
      benchmark.medians.cash_collection,
    ],
  ];

  const deltas = pairs
    .filter((pair) => typeof pair[1] === "number")
    .map(([kpi, actual, median]) => {
      const delta = (actual as number) - median;
      return {
        kpi,
        actual: actual as number,
        median,
        delta,
        position:
          Math.abs(delta) <= 2
            ? ("inline" as const)
            : delta > 0
              ? ("above" as const)
              : ("below" as const),
      };
    });

  const below = deltas.filter((item) => item.position === "below");
  return {
    benchmarkId: benchmark.id,
    benchmarkLabel: benchmark.label,
    deltas,
    summary:
      below.length > 0
        ? `Behind ${benchmark.label} on ${below.map((item) => item.kpi.replaceAll("_", " ")).join(", ")}.`
        : `At or above ${benchmark.label} peer medians on tracked KPIs.`,
  };
}

export function getBenchmark(id: string): BenchmarkProfile | undefined {
  return FIELD_SERVICE_BENCHMARKS.find((item) => item.id === id);
}
