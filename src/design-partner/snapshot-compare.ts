/**
 * Manufacturing snapshot comparison — only changes supported by both snapshots.
 * Never invents values.
 */

import type {
  ManufacturingSnapshotCompareInput,
  ManufacturingSnapshotComparison,
  SnapshotCompareChange,
} from "./types";

function avgVariance(
  cells: { variancePct: number | null; model: string }[],
  model: string,
): number | null {
  const matched = cells.filter(
    (c) => c.model === model && c.variancePct != null,
  );
  if (matched.length === 0) return null;
  const sum = matched.reduce((acc, c) => acc + (c.variancePct as number), 0);
  return Math.round((sum / matched.length) * 10) / 10;
}

function fmtPct(n: number): string {
  return `${n > 0 ? "+" : ""}${n}%`;
}

export function compareManufacturingSnapshots(
  input: ManufacturingSnapshotCompareInput,
): ManufacturingSnapshotComparison {
  const changes: SnapshotCompareChange[] = [];
  const unsupported: string[] = [];

  const cur = input.currentAnalysis;
  const prev = input.previousAnalysis;

  if (!cur || !prev) {
    unsupported.push(
      "Manufacturing analysis unavailable on one or both snapshots — comparison limited.",
    );
  }

  if (cur && prev) {
    const models = Array.from(
      new Set([...cur.models, ...prev.models]),
    ).sort();
    for (const model of models) {
      const a = avgVariance(cur.heatMap, model);
      const b = avgVariance(prev.heatMap, model);
      if (a == null || b == null) {
        unsupported.push(
          `${model}: demand movement not established in both snapshots.`,
        );
        continue;
      }
      const delta = Math.round((a - b) * 10) / 10;
      if (Math.abs(delta) < 0.5) continue;
      changes.push({
        id: `demand-${model}`,
        category: "demand",
        label: model,
        detail: `Demand variance vs forecast ${fmtPct(b)} → ${fmtPct(a)}`,
        deltaLabel: fmtPct(delta),
      });
    }

    // National last-period actual vs forecast
    const curLast = cur.nationalSeries[cur.nationalSeries.length - 1];
    const prevLast = prev.nationalSeries[prev.nationalSeries.length - 1];
    if (
      curLast?.variancePct != null &&
      prevLast?.variancePct != null
    ) {
      const delta =
        Math.round((curLast.variancePct - prevLast.variancePct) * 10) / 10;
      changes.push({
        id: "actual-vs-forecast",
        category: "actual_vs_forecast",
        label: "Actual vs forecast",
        detail: `${prevLast.period} ${fmtPct(prevLast.variancePct)} → ${curLast.period} ${fmtPct(curLast.variancePct)}`,
        deltaLabel: fmtPct(delta),
      });
    } else {
      unsupported.push(
        "Actual vs forecast national series incomplete on one or both snapshots.",
      );
    }

    // Capacity pressure by factory (both sides must have loadPct)
    const factories = Array.from(
      new Set([
        ...cur.capacity.map((c) => c.factory),
        ...prev.capacity.map((c) => c.factory),
      ]),
    );
    for (const factory of factories) {
      const a = cur.capacity.find((c) => c.factory === factory);
      const b = prev.capacity.find((c) => c.factory === factory);
      if (a?.loadPct == null || b?.loadPct == null) {
        unsupported.push(
          `${factory}: capacity load not established in both snapshots.`,
        );
        continue;
      }
      const delta = Math.round((a.loadPct - b.loadPct) * 10) / 10;
      if (Math.abs(delta) < 1) continue;
      changes.push({
        id: `capacity-${factory}`,
        category: "capacity",
        label: factory,
        detail: `Capacity load ${b.loadPct}% → ${a.loadPct}%`,
        deltaLabel:
          delta > 0
            ? `Capacity pressure increased (${fmtPct(delta)})`
            : `Capacity pressure eased (${fmtPct(delta)})`,
      });
    }

    // Inventory days by variant
    const variants = Array.from(
      new Set([
        ...cur.inventory.map((i) => i.variant),
        ...prev.inventory.map((i) => i.variant),
      ]),
    );
    for (const variant of variants) {
      const a = cur.inventory.find((i) => i.variant === variant);
      const b = prev.inventory.find((i) => i.variant === variant);
      if (a?.inventoryDays == null || b?.inventoryDays == null) {
        unsupported.push(
          `${variant}: inventory days not established in both snapshots.`,
        );
        continue;
      }
      const delta = Math.round((a.inventoryDays - b.inventoryDays) * 10) / 10;
      if (Math.abs(delta) < 0.5) continue;
      changes.push({
        id: `inventory-${variant}`,
        category: "inventory",
        label: variant,
        detail: `Inventory days ${b.inventoryDays} → ${a.inventoryDays}`,
        deltaLabel: delta > 0 ? `Ageing increased (+${delta})` : `Ageing eased (${delta})`,
      });
    }
  }

  if (
    input.currentConfidence != null &&
    input.previousConfidence != null
  ) {
    changes.push({
      id: "confidence",
      category: "confidence",
      label: "Confidence",
      detail: `${input.previousConfidence}% → ${input.currentConfidence}%`,
      deltaLabel: `${input.currentConfidence - input.previousConfidence}`,
    });
  } else {
    unsupported.push("Confidence not established on both snapshots.");
  }

  if (
    input.currentReadiness &&
    input.previousReadiness
  ) {
    changes.push({
      id: "readiness",
      category: "readiness",
      label: "Executive judgement readiness",
      detail: `${input.previousReadiness.executiveReadiness}% → ${input.currentReadiness.executiveReadiness}%`,
      deltaLabel: `${input.currentReadiness.executiveReadiness - input.previousReadiness.executiveReadiness}`,
    });
  }

  return {
    currentId: input.currentId,
    previousId: input.previousId,
    currentLabel: input.currentLabel ?? "This snapshot",
    previousLabel: input.previousLabel ?? "Previous snapshot",
    changes,
    unsupported,
  };
}
