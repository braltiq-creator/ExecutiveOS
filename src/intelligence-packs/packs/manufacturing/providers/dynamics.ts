/**
 * Microsoft Dynamics — integration-ready interfaces for the Manufacturing pack.
 *
 * Production connector is NOT built in Phase 52.
 * Mock provider + simulation datasets make the pack fully usable in Reality Lab.
 *
 * Pack-local types only — never promoted to Core entity types.
 */

import type { BusinessEvent, ConnectorHealth } from "@/connectors/types";

export type DynamicsModuleId =
  | "dynamics_finance"
  | "dynamics_supply_chain"
  | "dynamics_commerce";

/** Opaque manufacturing ERP snapshot — pack vocabulary, not Core. */
export type ManufacturingDynamicsSnapshot = {
  asOf: string;
  organisationLabel: string;
  factories: Array<{
    externalId: string;
    label: string;
    utilisationPct: number;
    overtimePct: number;
    oeePct: number;
  }>;
  dealers: Array<{
    externalId: string;
    label: string;
    region: string;
    fillRatePct: number;
    dioDays: number;
    turn: number;
  }>;
  inventory: {
    dioDays: number;
    eoPct: number;
    inventoryDollars: number;
    fillRatePct: number;
  };
  workingCapital: {
    cccDays: number;
    dsoDays: number;
    dpoDays: number;
  };
  forecast: {
    wapePct: number;
    biasPct: number;
    scheduleStabilityPct: number;
  };
  supply: {
    supplierOtifPct: number;
    dualSourcePct: number;
    criticalSingleSourceParts: number;
  };
  orderBank: {
    weeksOfCover: number;
    capacityEnvelopeWeeks: number;
  };
};

export type ManufacturingDynamicsProvider = {
  readonly id: string;
  readonly label: string;
  readonly system: "microsoft_dynamics";
  readonly mode: "mock" | "live";
  readonly modules: DynamicsModuleId[];
  /** Fetch latest snapshot (async-ready for future live connector). */
  getSnapshot(): ManufacturingDynamicsSnapshot | Promise<ManufacturingDynamicsSnapshot>;
  /** Map snapshot → canonical BusinessEvents (no Core manufacturing types). */
  toBusinessEvents(
    snapshot: ManufacturingDynamicsSnapshot,
  ): BusinessEvent[] | Promise<BusinessEvent[]>;
  health(): ConnectorHealth | Promise<ConnectorHealth>;
};

/** Simulation dataset used by Reality Lab / Enterprise Simulation. */
export type ManufacturingSimulationDataset = {
  id: string;
  label: string;
  description: string;
  snapshot: ManufacturingDynamicsSnapshot;
};

export const MANUFACTURING_SUPPORTED_CONNECTORS = [
  "microsoft_dynamics_finance",
  "microsoft_dynamics_supply_chain",
  "microsoft_dynamics_commerce",
  "mock_dynamics_manufacturing",
] as const;

export function createBaselineManufacturingSnapshot(
  asOf = "2026-08-08T08:00:00+10:00",
): ManufacturingDynamicsSnapshot {
  return {
    asOf,
    organisationLabel: "Forgeworks Industrial (mock Dynamics)",
    factories: [
      {
        externalId: "dyn-factory-a",
        label: "Plant A — Heavy Assembly",
        utilisationPct: 86,
        overtimePct: 9,
        oeePct: 67,
      },
      {
        externalId: "dyn-factory-b",
        label: "Plant B — Components",
        utilisationPct: 74,
        overtimePct: 4,
        oeePct: 71,
      },
    ],
    dealers: [
      {
        externalId: "dyn-dealer-north",
        label: "Northline Equipment",
        region: "North",
        fillRatePct: 91,
        dioDays: 68,
        turn: 5.2,
      },
      {
        externalId: "dyn-dealer-metro",
        label: "Metro Industrial Dist.",
        region: "Metro",
        fillRatePct: 96,
        dioDays: 42,
        turn: 7.1,
      },
    ],
    inventory: {
      dioDays: 82,
      eoPct: 7.2,
      inventoryDollars: 48_500_000,
      fillRatePct: 93,
    },
    workingCapital: {
      cccDays: 78,
      dsoDays: 42,
      dpoDays: 36,
    },
    forecast: {
      wapePct: 31,
      biasPct: 8,
      scheduleStabilityPct: 72,
    },
    supply: {
      supplierOtifPct: 89,
      dualSourcePct: 48,
      criticalSingleSourceParts: 14,
    },
    orderBank: {
      weeksOfCover: 7.5,
      capacityEnvelopeWeeks: 6,
    },
  };
}

export const MANUFACTURING_SIMULATION_DATASETS: ManufacturingSimulationDataset[] =
  [
    {
      id: "mfg-sim-baseline",
      label: "Baseline operating period",
      description: "Steady-state Dynamics mock for RL-MFG-12",
      snapshot: createBaselineManufacturingSnapshot(),
    },
    {
      id: "mfg-sim-demand-shock",
      label: "Demand shock period",
      description: "Soft construction + swollen dealer DIO for RL-MFG-01",
      snapshot: {
        ...createBaselineManufacturingSnapshot("2026-08-08T09:00:00+10:00"),
        forecast: { wapePct: 42, biasPct: 14, scheduleStabilityPct: 58 },
        dealers: [
          {
            externalId: "dyn-dealer-north",
            label: "Northline Equipment",
            region: "North",
            fillRatePct: 88,
            dioDays: 95,
            turn: 3.8,
          },
          {
            externalId: "dyn-dealer-metro",
            label: "Metro Industrial Dist.",
            region: "Metro",
            fillRatePct: 90,
            dioDays: 70,
            turn: 4.5,
          },
        ],
        orderBank: { weeksOfCover: 4.2, capacityEnvelopeWeeks: 6 },
      },
    },
    {
      id: "mfg-sim-scarcity",
      label: "Scarcity period",
      description: "Order bank beyond capacity envelope for RL-MFG-02/07",
      snapshot: {
        ...createBaselineManufacturingSnapshot("2026-08-08T10:00:00+10:00"),
        factories: [
          {
            externalId: "dyn-factory-a",
            label: "Plant A — Heavy Assembly",
            utilisationPct: 94,
            overtimePct: 14,
            oeePct: 62,
          },
          {
            externalId: "dyn-factory-b",
            label: "Plant B — Components",
            utilisationPct: 88,
            overtimePct: 8,
            oeePct: 68,
          },
        ],
        orderBank: { weeksOfCover: 9.5, capacityEnvelopeWeeks: 6 },
      },
    },
    {
      id: "mfg-sim-supply",
      label: "Supply disruption period",
      description: "Single-source OTIF collapse for RL-MFG-03",
      snapshot: {
        ...createBaselineManufacturingSnapshot("2026-08-08T11:00:00+10:00"),
        supply: {
          supplierOtifPct: 61,
          dualSourcePct: 48,
          criticalSingleSourceParts: 14,
        },
      },
    },
  ];

export function getManufacturingSimulationDataset(
  id: string,
): ManufacturingSimulationDataset | undefined {
  return MANUFACTURING_SIMULATION_DATASETS.find((d) => d.id === id);
}

/**
 * Mock Dynamics provider — Reality Lab complete without live ERP.
 * Live connector should implement the same interface later.
 */
export function createMockDynamicsManufacturingProvider(input?: {
  datasetId?: string;
  asOf?: string;
}): ManufacturingDynamicsProvider {
  const dataset =
    getManufacturingSimulationDataset(input?.datasetId ?? "mfg-sim-baseline") ??
    MANUFACTURING_SIMULATION_DATASETS[0];
  const snapshot: ManufacturingDynamicsSnapshot = {
    ...dataset.snapshot,
    asOf: input?.asOf ?? dataset.snapshot.asOf,
  };

  return {
    id: "mock-dynamics-manufacturing",
    label: "Mock Microsoft Dynamics (Manufacturing)",
    system: "microsoft_dynamics",
    mode: "mock",
    modules: [
      "dynamics_finance",
      "dynamics_supply_chain",
      "dynamics_commerce",
    ],
    getSnapshot() {
      return snapshot;
    },
    toBusinessEvents(snap) {
      return [
        {
          id: `mfg-dyn-inv-${snap.asOf}`,
          timestamp: snap.asOf,
          sourceSystem: "manual",
          entityType: "Signal",
          entityId: "signal-mfg-inventory",
          eventType: "signal_emitted",
          importance: snap.inventory.dioDays > 80 ? 84 : 70,
          confidence: 80,
          relationships: [
            { type: "affects", targetEntityId: "mfg-outcome-inventory" },
            {
              type: "affects",
              targetEntityId: "mfg-outcome-working-capital",
            },
          ],
          payload: {
            label: "Dynamics inventory snapshot",
            dioDays: snap.inventory.dioDays,
            eoPct: snap.inventory.eoPct,
            inventoryDollars: snap.inventory.inventoryDollars,
          },
          metadata: {
            connectorId: "mock-dynamics-manufacturing",
            labels: ["manufacturing", "dynamics", "inventory"],
          },
        },
        {
          id: `mfg-dyn-cap-${snap.asOf}`,
          timestamp: snap.asOf,
          sourceSystem: "manual",
          entityType: "Signal",
          entityId: "signal-mfg-capacity",
          eventType: "signal_emitted",
          importance: snap.factories.some((f) => f.overtimePct > 10) ? 86 : 72,
          confidence: 78,
          relationships: [
            { type: "affects", targetEntityId: "mfg-outcome-utilisation" },
          ],
          payload: {
            label: "Dynamics factory capacity snapshot",
            factories: snap.factories,
            orderBank: snap.orderBank,
          },
          metadata: {
            connectorId: "mock-dynamics-manufacturing",
            labels: ["manufacturing", "dynamics", "capacity"],
          },
        },
        {
          id: `mfg-dyn-dealer-${snap.asOf}`,
          timestamp: snap.asOf,
          sourceSystem: "manual",
          entityType: "Signal",
          entityId: "signal-mfg-dealers",
          eventType: "signal_emitted",
          importance: 75,
          confidence: 76,
          relationships: [
            { type: "affects", targetEntityId: "mfg-outcome-dealer" },
            { type: "affects", targetEntityId: "mfg-outcome-forecast" },
          ],
          payload: {
            label: "Dynamics dealer channel snapshot",
            dealers: snap.dealers,
            forecast: snap.forecast,
          },
          metadata: {
            connectorId: "mock-dynamics-manufacturing",
            labels: ["manufacturing", "dynamics", "dealer"],
          },
        },
      ];
    },
    health() {
      return {
        connectorId: "mock-dynamics-manufacturing",
        system: "microsoft_dynamics",
        status: "connected",
        lastSuccessfulSync: snapshot.asOf,
        lastAttemptAt: snapshot.asOf,
        errorCount: 0,
        warningCount: 0,
        message: `Mock Dynamics ready (${dataset.id}) — live connector deferred`,
      };
    },
  };
}
