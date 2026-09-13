/**
 * Phase 35A — first-run Command Centre empty state.
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MissionControl } from "@/experience/mission-control/MissionControl";
import { shouldForbidDemoFallback } from "@/executive-snapshot-studio/launch/experience-intent";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/experience/executive-brief/useExperienceData", () => ({
  useExperienceData: vi.fn(),
}));

vi.mock("@/components/providers/DecisionProvider", () => ({
  useDecisionsOptional: () => null,
}));

vi.mock("@/experience/executive-loop", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/experience/executive-loop")>();
  return {
    ...actual,
    useExecutiveLoop: () => ({
      version: 0,
      pendingCeremony: null,
      impacts: [],
    }),
  };
});

vi.mock("@/experience/mission-control/CommandCentreExperience", () => ({
  CommandCentreExperience: () => (
    <div data-testid="command-centre-loaded">Command Centre</div>
  ),
}));

vi.mock("@/experience/mission-control/command-centre-experience", () => ({
  buildCommandCentreExperience: () => ({
    leadJudgement: "ok",
    darkPanel: { judgement: "ok" },
    council: { framing: "ok" },
    queue: [],
    stream: [],
  }),
}));

vi.mock("@/experience/mission-control/snapshot-integrity", () => ({
  assertNoDemoBusinessContext: () => undefined,
}));

import { useExperienceData } from "@/experience/executive-brief/useExperienceData";

const unavailableState = {
  mode: "unavailable" as const,
  experience: null,
  snapshot: null,
  strategicOutcomes: [],
  activeSnapshot: null,
  headerTitle: "Executive Snapshot unavailable",
  useGreeting: false,
  executiveValueQuantified: false,
  unavailableReason:
    "Executive Snapshot unavailable. Re-open the snapshot from Snapshot Studio.",
  intelligenceProfileId: null,
};

describe("Phase 35A — first-run Today empty state", () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(useExperienceData).mockReturnValue(unavailableState);
  });

  afterEach(() => {
    cleanup();
  });

  it("new organisation with no snapshot does not silently receive demo data", () => {
    expect(
      shouldForbidDemoFallback({
        hasActiveSnapshot: false,
        libraryCount: 0,
        intent: null,
        demoParam: null,
        forbidSilentDemo: true,
      }),
    ).toBe(true);

    render(<MissionControl />);
    expect(screen.queryByText(/Northline/i)).toBeNull();
    expect(screen.queryByText(/Alex Rivera/i)).toBeNull();
    expect(screen.queryByText(/Helix/i)).toBeNull();
  });

  it("Today empty state displays a first-run CTA", () => {
    render(<MissionControl />);
    expect(
      screen.getByText("Your Executive Command Centre is ready to be created."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create Your Executive Snapshot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to Onboarding" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Executive Snapshot unavailable")).toBeNull();
  });

  it("CTA routes to Snapshot Studio and onboarding", () => {
    render(<MissionControl />);
    expect(
      screen.getByRole("link", { name: "Create Your Executive Snapshot" }),
    ).toHaveAttribute("href", "/onboarding/snapshot");
    expect(
      screen.getByRole("link", { name: "Return to Onboarding" }),
    ).toHaveAttribute("href", "/onboarding");
  });

  it("existing active snapshot still loads Command Centre path", () => {
    vi.mocked(useExperienceData).mockReturnValue({
      mode: "executive_snapshot",
      experience: { tenantId: "t1" } as never,
      snapshot: { id: "snap" } as never,
      strategicOutcomes: [],
      activeSnapshot: {
        kind: "executive_snapshot",
        studioId: "studio-1",
        snapshotId: "snap-1",
        organisationId: "org-1",
        organisationName: "Braltiq",
        profileId: "manufacturing",
        profileLabel: "Manufacturing Forecast Intelligence",
        intelligenceProfileId: "operations_executive",
        sourceKind: "excel",
        recordCount: 10,
        confidenceOverall: 0.8,
        readiness: {} as never,
        portfolio: {
          overallScore: 50,
          statusLabel: "Watch",
          refreshedAt: new Date().toISOString(),
          executiveName: "Exec",
          outcomes: [],
          decisions: [],
          intent: {
            id: "i",
            title: "t",
            narrative: "n",
            priority: "high",
            horizon: "q",
            reviewDate: "2026-01-01",
            reviewCadence: "Weekly",
            focusOutcomeIds: [],
            watchingOutcomeIds: [],
            nonFocusOutcomeIds: [],
            constraints: [],
            successSignals: [],
            status: "active",
            history: [],
          },
          intentHistory: [],
        },
        councilSeats: ["CEO"],
        advisorNames: [],
        activatedAt: new Date().toISOString(),
        demoIsolation: true,
      },
      headerTitle: "Manufacturing Forecast Intelligence",
      useGreeting: false,
      executiveValueQuantified: false,
      unavailableReason: null,
      intelligenceProfileId: "operations_executive",
    });

    render(<MissionControl />);
    expect(screen.getByTestId("command-centre-loaded")).toBeInTheDocument();
    expect(
      screen.queryByText("Your Executive Command Centre is ready to be created."),
    ).toBeNull();
  });

  it("explicit demo mode remains allowed only via demo param/intent", () => {
    expect(
      shouldForbidDemoFallback({
        hasActiveSnapshot: false,
        libraryCount: 0,
        intent: "demo",
        demoParam: null,
        forbidSilentDemo: true,
      }),
    ).toBe(false);
    expect(
      shouldForbidDemoFallback({
        hasActiveSnapshot: false,
        libraryCount: 0,
        intent: null,
        demoParam: "1",
        forbidSilentDemo: true,
      }),
    ).toBe(false);
  });

  it("does not introduce a new Intelligence Profile id", () => {
    const types = readFileSync(
      resolve(process.cwd(), "src/profiles/framework/types.ts"),
      "utf8",
    );
    expect(types).toContain('"operations_executive"');
    expect(types).toContain('"commercial_executive"');
    expect(types).not.toMatch(/manufacturing_executive/);
  });

  it("organisation create still hands off to /onboarding orchestration", () => {
    const setup = readFileSync(
      resolve(
        process.cwd(),
        "src/components/organizations/OrganizationSetup.tsx",
      ),
      "utf8",
    );
    expect(setup).toContain('router.push("/onboarding")');
    expect(setup).not.toContain('router.push("/onboarding/snapshot")');
  });
});
