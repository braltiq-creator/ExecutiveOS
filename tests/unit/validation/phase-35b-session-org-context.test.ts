/**
 * Phase 35B — Production session & organisation context.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_SESSION } from "@/lib/mock/session";
import {
  buildAppSessionFromMembership,
  getAppSession,
  requireAppSession,
} from "@/services/session";
import { requireStudioActor } from "@/executive-snapshot-studio/server/auth";
import { createExecutiveSnapshotAction } from "@/executive-snapshot-studio/server/actions";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
  inferMappingFromHeaders,
  parseTabularText,
} from "@/data-gateway";
import { clearStudioStores } from "@/executive-snapshot-studio";
import * as authActions from "@/lib/auth/actions";
import * as orgQueries from "@/lib/organizations/queries";
import * as onboardingQueries from "@/lib/onboarding/queries";
import type { OrganizationMembership } from "@/lib/organizations/types";

const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

const BRALTIQ_ORG_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const SAMPLE_CSV = `Opportunity Name,Opportunity Owner,Stage,Close Date,Net SaaS (converted)
Acme Deal,Alex Owner,Stage 3 - Discovery,2026-09-01,12000
Beta Deal,Alex Owner,Closed Won,2026-01-01,8000
`;

function membershipFixture(
  organizationId: string,
  name = "Braltiq",
): OrganizationMembership {
  return {
    member: {
      id: "m1",
      organization_id: organizationId,
      user_id: "user-prod",
      role: "owner",
      status: "active",
      email: "owner@braltiq.com",
      display_name: "David Beckett",
      joined_at: null,
      invited_at: null,
      created_at: new Date().toISOString(),
    },
    organization: {
      id: organizationId,
      name,
      legal_name: null,
      industry: "Technology",
      company_size: "11-50",
      country: "Australia",
      timezone: "Australia/Sydney",
      website: null,
      logo_url: null,
      subscription_plan: "free",
      created_by: "user-prod",
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

describe("Phase 35B — Production session & organisation context", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    redirectMock.mockClear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("mock mode returns MOCK_SESSION", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    delete process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK;

    const session = await getAppSession();
    expect(session).toEqual(MOCK_SESSION);
    expect(session?.company.id).toBe("org-northline");
    expect(session?.isMock).toBe(true);
  });

  it("Production mode with authenticated user returns real AppSession", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-prod",
      email: "owner@braltiq.com",
      user_metadata: { full_name: "David Beckett" },
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(
      membershipFixture(BRALTIQ_ORG_ID),
    );
    vi.spyOn(onboardingQueries, "getExecutiveProfile").mockResolvedValue(null);

    const session = await getAppSession();
    expect(session).not.toBeNull();
    expect(session?.isMock).toBe(false);
    expect(session?.userId).toBe("user-prod");
    expect(session?.company.id).toBe(BRALTIQ_ORG_ID);
    expect(session?.company.name).toBe("Braltiq");
    expect(session?.company.id).not.toBe("org-northline");
  });

  it("Production mode does NOT fall back to MOCK_SESSION", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue(null);

    expect(await getAppSession()).toBeNull();

    await expect(requireAppSession()).rejects.toThrow("REDIRECT:/sign-in");

    const sessionSrc = readFileSync(
      resolve(process.cwd(), "src/services/session.ts"),
      "utf8",
    );
    expect(sessionSrc).not.toMatch(
      /if\s*\(\s*!session\s*\)\s*\{\s*return\s+MOCK_SESSION/,
    );
    expect(sessionSrc).not.toMatch(/return MOCK_SESSION;\s*\n\s*\}\s*\n\s*return session/);
  });

  it("Production AppSession organisation comes from active membership", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    const membership = membershipFixture(BRALTIQ_ORG_ID, "Braltiq");
    const user = {
      id: "user-prod",
      email: "owner@braltiq.com",
      user_metadata: {},
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>;

    const built = buildAppSessionFromMembership(user!, membership);
    expect(built.company.id).toBe(membership.organization.id);
    expect(built.company.name).toBe(membership.organization.name);

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue(user);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(membership);
    vi.spyOn(onboardingQueries, "getExecutiveProfile").mockResolvedValue(null);

    const session = await requireAppSession();
    expect(session.company.id).toBe(BRALTIQ_ORG_ID);
  });

  it("Snapshot Studio page receives organisation from session.company", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/onboarding/snapshot/page.tsx"),
      "utf8",
    );
    expect(page).toContain("organisationId={session.company.id}");
    expect(page).toContain("organisationName={session.company.name}");
    expect(page).not.toContain("org-northline");
  });

  it("createExecutiveSnapshotAction succeeds when org matches active membership", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-prod",
      email: "owner@braltiq.com",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(
      membershipFixture(BRALTIQ_ORG_ID),
    );

    const parsed = parseTabularText(SAMPLE_CSV);
    const mapping = inferMappingFromHeaders(parsed.headers, {
      organisationId: BRALTIQ_ORG_ID,
    });

    const created = await createExecutiveSnapshotAction({
      organisationId: BRALTIQ_ORG_ID,
      organisationName: "Braltiq",
      profileId: "profile_prod",
      sourceKind: "csv",
      filename: "upload.csv",
      tabularText: SAMPLE_CSV,
      selectedProfileId: "commercial",
      mapping,
    });

    expect(created.success).toBe(true);
    expect(created.errors).toEqual([]);
    expect(created.snapshot?.meta.organisationId).toBe(BRALTIQ_ORG_ID);
  });

  it("createExecutiveSnapshotAction rejects intentional org mismatch", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-prod",
      email: "owner@braltiq.com",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(
      membershipFixture(BRALTIQ_ORG_ID),
    );

    const parsed = parseTabularText(SAMPLE_CSV);
    const mapping = inferMappingFromHeaders(parsed.headers, {
      organisationId: "org-northline",
    });

    const denied = await createExecutiveSnapshotAction({
      organisationId: "org-northline",
      organisationName: "Northline Systems",
      profileId: "profile_prod",
      sourceKind: "csv",
      filename: "upload.csv",
      tabularText: SAMPLE_CSV,
      selectedProfileId: "commercial",
      mapping,
    });

    expect(denied.success).toBe(false);
    expect(denied.errors).toContain("Not authorised for this organisation.");

    const actor = await requireStudioActor("org-northline");
    expect(actor.ok).toBe(false);
  });

  it("upload/mapping path still authorises via requireStudioSession membership", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-prod",
      email: "owner@braltiq.com",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(
      membershipFixture(BRALTIQ_ORG_ID),
    );

    const session = await requireStudioActor(BRALTIQ_ORG_ID);
    expect(session.ok).toBe(true);
    if (session.ok) {
      expect(session.organisationId).toBe(BRALTIQ_ORG_ID);
    }
  });

  it("organisation create still hands off to /onboarding", () => {
    const setup = readFileSync(
      resolve(
        process.cwd(),
        "src/components/organizations/OrganizationSetup.tsx",
      ),
      "utf8",
    );
    expect(setup).toContain('router.push("/onboarding")');
  });

  it("no Northline org id is hard-coded into authenticated Production session path", () => {
    const sessionSrc = readFileSync(
      resolve(process.cwd(), "src/services/session.ts"),
      "utf8",
    );
    expect(sessionSrc).not.toContain("org-northline");
    expect(sessionSrc).toContain("fetchActiveMembership");
    expect(sessionSrc).toContain("getAuthenticatedUser");
  });

  it("authenticated without membership redirects to organisation setup", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");

    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-prod",
      email: "owner@braltiq.com",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(null);

    expect(await getAppSession()).toBeNull();
    await expect(requireAppSession()).rejects.toThrow("REDIRECT:/organization");
  });
});
