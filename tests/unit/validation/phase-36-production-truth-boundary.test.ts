/**
 * Phase 36 — Production Truth Boundary for Discovery.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertNoRealityLabFixtures,
  completeDiscovery,
  createDiscoverySession,
  discoverOrganisation,
  discoverOrganisationProduction,
  discoverOrganisationRealityLab,
  resetDiscoverySessions,
  runDiscovery,
  shouldUseRealityLabDiscovery,
  submitMinimumQuestions,
} from "@/onboarding";
import { recommendIntelligenceProfile } from "@/profiles";

const BRALTIQ_ORG_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("Phase 36 — Production Truth Boundary", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    resetDiscoverySessions();
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  function productionEnv() {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
  }

  it("Production discovery never returns Northline Operations", () => {
    productionEnv();
    const items = discoverOrganisation({ tenantId: BRALTIQ_ORG_ID });
    expect(items.some((i) => i.label.includes("Northline"))).toBe(false);
    expect(JSON.stringify(items)).not.toContain("Northline Operations");
  });

  it("Production discovery never returns Acme Facilities", () => {
    productionEnv();
    const items = discoverOrganisation({
      tenantId: BRALTIQ_ORG_ID,
      connectedSystems: ["simpro"],
    });
    expect(JSON.stringify(items)).not.toContain("Acme Facilities");
  });

  it("Production discovery never returns Sarah Jones", () => {
    productionEnv();
    const items = discoverOrganisation({
      tenantId: BRALTIQ_ORG_ID,
      connectedSystems: ["microsoft365"],
    });
    expect(JSON.stringify(items)).not.toContain("Sarah Jones");
  });

  it("Production discovery never returns Monday 8:00am / ELT fixtures", () => {
    productionEnv();
    const items = discoverOrganisation({
      tenantId: BRALTIQ_ORG_ID,
      connectedSystems: ["microsoft365", "simpro"],
    });
    expect(JSON.stringify(items)).not.toContain("Monday 8:00am");
    expect(JSON.stringify(items)).not.toContain("Executive Leadership Team");
  });

  it("Production onboarding never uses tenant-northline", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/onboarding/page.tsx"),
      "utf8",
    );
    expect(page).not.toContain("tenant-northline");
    expect(page).toContain("requireAppSession");
    expect(page).toContain("appSession.company.id");
  });

  it("Production connectedSystems is empty unless verified", () => {
    productionEnv();
    let session = createDiscoverySession({
      tenantId: BRALTIQ_ORG_ID,
      userId: "user-prod",
    });
    session = submitMinimumQuestions(session, {
      role: "COO",
      primaryObjective: "Operational Excellence",
      briefingTime: "Morning",
      strategicOutcomes: ["Reliability"],
    });
    // Client claims simpro without verification — Production must ignore.
    session = runDiscovery(session, {
      connectedSystems: ["microsoft365", "simpro"],
      verifiedConnections: false,
      accountOrganisation: { id: BRALTIQ_ORG_ID, name: "Braltiq" },
    });
    expect(session.progress.systemsConnected).toEqual([]);
    expect(session.discoveries).toEqual([]);
  });

  it("Production never labels a fake connector as active OAuth", () => {
    productionEnv();
    const items = discoverOrganisation({
      tenantId: BRALTIQ_ORG_ID,
      connectedSystems: ["microsoft365"],
    });
    expect(JSON.stringify(items)).not.toContain("Active OAuth connection");
    expect(JSON.stringify(items)).not.toContain(
      "Active field-service connection",
    );
  });

  it("Production never recommends Operations solely from fabricated Simpro", () => {
    productionEnv();
    let session = createDiscoverySession({
      tenantId: BRALTIQ_ORG_ID,
      userId: "user-prod",
    });
    session = submitMinimumQuestions(session, {
      role: "CEO",
      primaryObjective: "Growth",
      briefingTime: "Morning",
      strategicOutcomes: ["Growth"],
    });
    session = runDiscovery(session, {
      connectedSystems: ["simpro"],
      verifiedConnections: false,
      accountOrganisation: { id: BRALTIQ_ORG_ID, name: "Braltiq" },
    });
    expect(session.profileRecommendation).toBeNull();
    expect(session.progress.systemsConnected).not.toContain("simpro");

    const fabricated = recommendIntelligenceProfile({
      role: "CEO",
      primaryObjective: "Growth",
      connectedProviders: [],
    });
    expect(fabricated.explanation).not.toMatch(/Simpro/i);
  });

  it("Mock / Reality Lab mode still returns fixtures", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    delete process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK;
    expect(shouldUseRealityLabDiscovery()).toBe(true);
    const items = discoverOrganisation({ tenantId: "tenant-northline" });
    expect(items.some((i) => i.label === "Northline Operations")).toBe(true);
    expect(items.some((i) => i.label === "Acme Facilities")).toBe(true);
    expect(items.some((i) => i.label === "Sarah Jones")).toBe(true);
  });

  it("explicit demoIntent still enables Reality Lab catalogue", () => {
    productionEnv();
    expect(shouldUseRealityLabDiscovery()).toBe(false);
    const items = discoverOrganisation({
      tenantId: "tenant-demo",
      demoIntent: true,
    });
    expect(items.some((i) => i.label === "Northline Operations")).toBe(true);
    expect(
      assertNoRealityLabFixtures(items, { demoIntent: true }).ok,
    ).toBe(true);
  });

  it("real organisation ID is passed through Production onboarding page", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/onboarding/page.tsx"),
      "utf8",
    );
    const experience = readFileSync(
      resolve(
        process.cwd(),
        "src/components/onboarding/discovery/DiscoveryExperience.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("organisationName={appSession.company.name}");
    expect(experience).toContain("tenantId");
    expect(experience).not.toContain('tenantId = "tenant-northline"');
    expect(experience).toContain('href="/onboarding/snapshot"');
    expect(experience).toContain("return-onboarding");
    expect(experience).toContain(
      "No verified organisational evidence has been discovered yet.",
    );
    expect(experience).not.toContain("Connect your systems");
  });

  it("Snapshot Studio remains independent of Discovery fixtures", () => {
    const studio = readFileSync(
      resolve(process.cwd(), "src/app/onboarding/snapshot/page.tsx"),
      "utf8",
    );
    expect(studio).toContain("SnapshotStudio");
    expect(studio).toContain("requireAppSession");
    expect(studio).not.toContain("discoverOrganisation");
  });

  it("Phase 35A first-run Today CTA remains intact", () => {
    const mc = readFileSync(
      resolve(process.cwd(), "src/experience/mission-control/MissionControl.tsx"),
      "utf8",
    );
    expect(mc).toContain("Create Your Executive Snapshot");
    expect(mc).toContain('href="/onboarding/snapshot"');
  });

  it("Production empty discovery fails closed — no demo fallback", () => {
    productionEnv();
    expect(discoverOrganisationProduction({ tenantId: BRALTIQ_ORG_ID })).toEqual(
      [],
    );
    const lab = discoverOrganisationRealityLab({
      tenantId: "tenant-northline",
    });
    expect(lab.length).toBeGreaterThan(0);
    expect(assertNoRealityLabFixtures(lab).ok).toBe(false);
  });

  it("no fixture pilot_* write path from Discovery", () => {
    const sessionSrc = readFileSync(
      resolve(process.cwd(), "src/onboarding/session.ts"),
      "utf8",
    );
    expect(sessionSrc).not.toMatch(/persistPilot|pilot_/);
    const engineSrc = readFileSync(
      resolve(process.cwd(), "src/onboarding/discovery/engine.ts"),
      "utf8",
    );
    expect(engineSrc).not.toMatch(/persistPilot|pilot_/);
  });

  it("Production empty Discovery cannot generate a synthetic briefing", () => {
    productionEnv();
    let session = createDiscoverySession({
      tenantId: BRALTIQ_ORG_ID,
      userId: "user-prod",
    });
    session = submitMinimumQuestions(session, {
      role: "CEO",
      primaryObjective: "Growth",
      briefingTime: "Morning",
      strategicOutcomes: ["Growth"],
    });
    session = runDiscovery(session, {
      verifiedConnections: false,
      accountOrganisation: { id: BRALTIQ_ORG_ID, name: "Braltiq" },
    });
    expect(session.discoveries).toEqual([]);
    expect(() => completeDiscovery(session)).toThrow(/no verified discovery evidence/i);
  });
});
