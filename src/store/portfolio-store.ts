"use client";

import { create } from "zustand";
import {
  applyDecisionAct,
  type ApplyDecisionActInput,
  type DecisionConsequence,
} from "@/lib/decisions/apply-decision-act";
import {
  assignActionAccountability,
  createActionFromSelectedDecision,
  selectDecisionOption,
  type CreateActionFromDecisionInput,
  type CreateActionFromDecisionResult,
  type SelectDecisionOptionInput,
  type SelectDecisionOptionResult,
} from "@/lib/decisions/decision-execution-linkage";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import { mockPortfolioRepository } from "@/services/portfolio/mock-repository";
import { getActiveExecutiveSnapshot } from "@/executive-snapshot-studio/launch/executive-snapshot-context";

type PortfolioStore = {
  portfolio: OutcomePortfolio;
  hydrated: boolean;
  /** When set, Command Centre is bound to a real Executive Snapshot. */
  activeSnapshotId: string | null;
  lastConsequence: DecisionConsequence | null;
  lastSelection: SelectDecisionOptionResult | null;
  lastActionFromDecision: CreateActionFromDecisionResult | null;
  hydrate: () => void;
  /** Load an authoritative snapshot portfolio — replaces demo seed. */
  loadExternalPortfolio: (
    portfolio: OutcomePortfolio,
    meta?: { snapshotId?: string; persist?: boolean },
  ) => void;
  resetPortfolio: () => void;
  clearConsequence: () => void;
  recordDecisionAct: (
    input: ApplyDecisionActInput,
  ) => DecisionConsequence;
  /** Phase 61 — explicit option selection (≠ approval). */
  selectDecisionOption: (
    input: Omit<SelectDecisionOptionInput, "snapshotId"> & {
      snapshotId?: string | null;
    },
  ) => SelectDecisionOptionResult;
  /** Phase 61 — action only after selection. */
  createActionFromSelectedDecision: (
    input: CreateActionFromDecisionInput,
  ) => CreateActionFromDecisionResult;
  /** Phase 65 — assign owner / due without inventing values. */
  assignActionAccountability: (input: {
    actionId: string;
    owner?: string | null;
    dueDate?: string | null;
    actor?: string;
  }) => ReturnType<typeof assignActionAccountability>;
};

function looksLikeOrphanSnapshotPortfolio(portfolio: OutcomePortfolio): boolean {
  return (
    portfolio.intent?.id === "intent-commercial-snapshot" ||
    portfolio.intent?.id === "intent-snapshot-pending"
  );
}

/**
 * Push portfolio mutations to durable org-scoped persistence.
 * localStorage remains a UI cache only — not authoritative.
 */
function persistDurablePortfolio(
  portfolio: OutcomePortfolio,
  snapshotId: string | null,
): void {
  if (!snapshotId || typeof window === "undefined") return;
  const active = getActiveExecutiveSnapshot();
  if (!active?.organisationId) return;
  void import("@/pilot-persistence/actions")
    .then((m) =>
      m.persistPilotPortfolioAction({
        organisationId: active.organisationId,
        originSnapshotId: snapshotId,
        portfolio,
      }),
    )
    .catch(() => {
      /* non-blocking */
    });
}

/**
 * Central portfolio write path for the Decision Loop UI.
 * Authoritative durability is pilot-persistence (Supabase / memory contract).
 * localStorage is a transient UI cache only.
 */
export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: structuredClone(MOCK_OUTCOME_PORTFOLIO),
  hydrated: false,
  activeSnapshotId: null,
  lastConsequence: null,
  lastSelection: null,
  lastActionFromDecision: null,

  hydrate() {
    if (get().hydrated) return;

    const active = getActiveExecutiveSnapshot();
    if (active) {
      set({
        portfolio: structuredClone(active.portfolio),
        hydrated: true,
        activeSnapshotId: active.snapshotId,
        lastConsequence: null,
        lastSelection: null,
        lastActionFromDecision: null,
      });
      // Refresh from durable SoT when available.
      void import("@/pilot-persistence/actions")
        .then((m) =>
          m.loadPilotSnapshotAction({
            organisationId: active.organisationId,
            snapshotId: active.snapshotId,
          }),
        )
        .then((res) => {
          if (res.ok) {
            set({
              portfolio: structuredClone(res.portfolio),
              activeSnapshotId: res.context.snapshotId,
            });
          }
        })
        .catch(() => {
          /* keep session cache */
        });
      return;
    }

    // No active Executive Snapshot — never keep an orphaned commercial book
    // as a silent substitute for demo, and never mix the two.
    const loaded = mockPortfolioRepository.load();
    if (looksLikeOrphanSnapshotPortfolio(loaded)) {
      mockPortfolioRepository.reset();
      set({
        portfolio: structuredClone(MOCK_OUTCOME_PORTFOLIO),
        hydrated: true,
        activeSnapshotId: null,
        lastConsequence: null,
        lastSelection: null,
        lastActionFromDecision: null,
      });
      return;
    }

    set({
      portfolio: loaded,
      hydrated: true,
      activeSnapshotId: null,
      lastSelection: null,
      lastActionFromDecision: null,
    });
  },

  loadExternalPortfolio(portfolio, meta) {
    const next = structuredClone(portfolio);
    // UI cache only — durable write happens via activate / explicit persist.
    if (meta?.persist !== false) {
      mockPortfolioRepository.save(next);
    }
    set({
      portfolio: next,
      hydrated: true,
      activeSnapshotId: meta?.snapshotId ?? get().activeSnapshotId,
      lastConsequence: null,
      lastSelection: null,
      lastActionFromDecision: null,
    });
  },

  resetPortfolio() {
    mockPortfolioRepository.reset();
    set({
      portfolio: structuredClone(MOCK_OUTCOME_PORTFOLIO),
      lastConsequence: null,
      lastSelection: null,
      lastActionFromDecision: null,
      hydrated: true,
      activeSnapshotId: null,
    });
  },

  clearConsequence() {
    set({ lastConsequence: null });
  },

  recordDecisionAct(input) {
    const { portfolio, consequence } = applyDecisionAct(get().portfolio, input);
    mockPortfolioRepository.save(portfolio);
    set({ portfolio, lastConsequence: consequence, hydrated: true });
    persistDurablePortfolio(portfolio, get().activeSnapshotId);
    return consequence;
  },

  selectDecisionOption(input) {
    const snapshotId =
      input.snapshotId !== undefined
        ? input.snapshotId
        : get().activeSnapshotId;
    const result = selectDecisionOption(get().portfolio, {
      ...input,
      snapshotId,
    });
    mockPortfolioRepository.save(result.portfolio);
    set({
      portfolio: result.portfolio,
      lastSelection: result,
      hydrated: true,
    });
    persistDurablePortfolio(result.portfolio, snapshotId ?? null);
    return result;
  },

  createActionFromSelectedDecision(input) {
    const result = createActionFromSelectedDecision(get().portfolio, input);
    mockPortfolioRepository.save(result.portfolio);
    set({
      portfolio: result.portfolio,
      lastActionFromDecision: result,
      hydrated: true,
    });
    persistDurablePortfolio(result.portfolio, get().activeSnapshotId);
    return result;
  },

  assignActionAccountability(input) {
    const result = assignActionAccountability(get().portfolio, {
      actionId: input.actionId,
      owner: input.owner,
      dueDate: input.dueDate,
      actor: input.actor ?? "Executive",
    });
    mockPortfolioRepository.save(result.portfolio);
    set({ portfolio: result.portfolio, hydrated: true });
    persistDurablePortfolio(result.portfolio, get().activeSnapshotId);
    return result;
  },
}));
