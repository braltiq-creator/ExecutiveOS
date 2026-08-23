import type { OutcomePortfolio } from "@/lib/outcomes/types";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

export type PortfolioRepository = {
  load: () => OutcomePortfolio;
  save: (portfolio: OutcomePortfolio) => void;
  reset: () => void;
};

const STORAGE_KEY = "executiveos.portfolio.v1";

function seed(): OutcomePortfolio {
  return structuredClone(MOCK_OUTCOME_PORTFOLIO);
}

/**
 * Transient UI cache — localStorage is NOT the authoritative pilot SoT.
 * Durable state: src/pilot-persistence (Supabase / memory contract).
 */
export function createMockPortfolioRepository(): PortfolioRepository {
  return {
    load() {
      if (typeof window === "undefined") {
        return seed();
      }
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return seed();
        return JSON.parse(raw) as OutcomePortfolio;
      } catch {
        return seed();
      }
    },
    save(portfolio) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    },
    reset() {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(STORAGE_KEY);
    },
  };
}

export const mockPortfolioRepository = createMockPortfolioRepository();
