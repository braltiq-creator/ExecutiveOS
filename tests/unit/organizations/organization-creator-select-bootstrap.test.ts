/**
 * Organization creator SELECT bootstrap (migration 012).
 * Models 006 + 012 RLS predicates for first-org create without a live DB.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_012 = resolve(
  process.cwd(),
  "supabase/migrations/012_organization_creator_select_bootstrap.sql",
);

const EXPECTED_POLICY_SQL = `create policy "Creators can read organizations they created"
  on public.organizations for select
  using (
    archived_at is null
    and created_by = auth.uid()
  );`;

type OrgRow = {
  id: string;
  name: string;
  archived_at: string | null;
  created_by: string;
};

type MemberRow = {
  organization_id: string;
  user_id: string;
  role: "owner" | "executive" | "manager" | "contributor" | "viewer";
  status: "active" | "invited" | "suspended" | "removed";
};

/** Mirrors public.is_active_organization_member */
function isActiveOrganizationMember(
  members: MemberRow[],
  orgId: string,
  authUid: string | null,
): boolean {
  if (!authUid) return false;
  return members.some(
    (m) =>
      m.organization_id === orgId &&
      m.user_id === authUid &&
      m.status === "active",
  );
}

/** Migration 006 — INSERT WITH CHECK */
function canInsertOrganization(
  authUid: string | null,
  createdBy: string,
): boolean {
  return authUid !== null && authUid === createdBy;
}

/**
 * Combined SELECT policies after 006 + 012:
 * - Members can read their organizations
 * - Creators can read organizations they created
 */
function canSelectOrganization(
  org: OrgRow,
  members: MemberRow[],
  authUid: string | null,
): boolean {
  if (!authUid) return false;
  if (org.archived_at !== null) return false;

  const memberPolicy = isActiveOrganizationMember(members, org.id, authUid);
  const creatorPolicy = org.created_by === authUid;
  return memberPolicy || creatorPolicy;
}

/** Migration 006 — self membership insert (owner bootstrap) */
function canInsertOwnMembership(
  authUid: string | null,
  userId: string,
): boolean {
  return authUid !== null && authUid === userId;
}

/**
 * Simulates insertOrganizationRecord: INSERT then RETURNING (SELECT).
 * Fails when SELECT policies block RETURNING — the Production bug before 012.
 */
function insertOrganizationWithReturning(
  store: { orgs: OrgRow[]; members: MemberRow[] },
  authUid: string | null,
  input: { id: string; name: string; created_by: string },
): { ok: true; org: OrgRow } | { ok: false; error: string } {
  if (!canInsertOrganization(authUid, input.created_by)) {
    return {
      ok: false,
      error: "new row violates row-level security policy for table 'organizations'",
    };
  }

  const org: OrgRow = {
    id: input.id,
    name: input.name,
    archived_at: null,
    created_by: input.created_by,
  };
  store.orgs.push(org);

  if (!canSelectOrganization(org, store.members, authUid)) {
    store.orgs.pop();
    return {
      ok: false,
      error: "new row violates row-level security policy for table 'organizations'",
    };
  }

  return { ok: true, org };
}

function bootstrapOwnerMembership(
  store: { orgs: OrgRow[]; members: MemberRow[] },
  authUid: string | null,
  orgId: string,
): { ok: true; member: MemberRow } | { ok: false; error: string } {
  if (!canInsertOwnMembership(authUid, authUid ?? "")) {
    return { ok: false, error: "membership insert denied" };
  }

  const org = store.orgs.find((o) => o.id === orgId);
  if (!org || !canSelectOrganization(org, store.members, authUid)) {
    return { ok: false, error: "organization not readable for bootstrap" };
  }

  const member: MemberRow = {
    organization_id: orgId,
    user_id: authUid!,
    role: "owner",
    status: "active",
  };
  store.members.push(member);
  return { ok: true, member };
}

describe("migration 012 — creator SELECT bootstrap SQL", () => {
  it("exists with the exact approved policy SQL", () => {
    const sql = readFileSync(MIGRATION_012, "utf8");
    expect(sql).toContain(EXPECTED_POLICY_SQL);
    expect(sql).not.toMatch(/drop\s+policy/i);
    expect(sql).not.toMatch(/disable\s+row\s+level\s+security/i);
    expect(sql).not.toMatch(/for\s+insert/i);
    expect(sql).not.toMatch(/pilot_/i);
  });

  it("does not alter migration 011", () => {
    const m011 = readFileSync(
      resolve(process.cwd(), "supabase/migrations/011_pilot_operating_loop.sql"),
      "utf8",
    );
    expect(m011).not.toContain("Creators can read organizations they created");
  });
});

describe("organization RLS — first-org bootstrap (006 + 012)", () => {
  it("authenticated user with no membership can create an organization", () => {
    const store = { orgs: [] as OrgRow[], members: [] as MemberRow[] };
    const authUid = "user-creator-a";

    const result = insertOrganizationWithReturning(store, authUid, {
      id: "org-braltiq",
      name: "Braltiq",
      created_by: authUid,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.org.name).toBe("Braltiq");
      expect(result.org.created_by).toBe(authUid);
    }
  });

  it("creator can read the organization they created before membership exists", () => {
    const org: OrgRow = {
      id: "org-1",
      name: "Braltiq",
      archived_at: null,
      created_by: "user-a",
    };
    expect(canSelectOrganization(org, [], "user-a")).toBe(true);
    // Pre-012: membership-only SELECT would deny
    expect(isActiveOrganizationMember([], "org-1", "user-a")).toBe(false);
  });

  it("creator can complete owner membership bootstrap after create", () => {
    const store = { orgs: [] as OrgRow[], members: [] as MemberRow[] };
    const authUid = "user-creator-a";

    const created = insertOrganizationWithReturning(store, authUid, {
      id: "org-braltiq",
      name: "Braltiq",
      created_by: authUid,
    });
    expect(created.ok).toBe(true);

    const membership = bootstrapOwnerMembership(
      store,
      authUid,
      "org-braltiq",
    );
    expect(membership.ok).toBe(true);
    if (membership.ok) {
      expect(membership.member.role).toBe("owner");
      expect(membership.member.status).toBe("active");
    }

    // After bootstrap, member policy also allows SELECT
    expect(
      canSelectOrganization(store.orgs[0]!, store.members, authUid),
    ).toBe(true);
    expect(
      isActiveOrganizationMember(store.members, "org-braltiq", authUid),
    ).toBe(true);
  });

  it("another authenticated user who is neither creator nor member cannot read via creator policy", () => {
    const org: OrgRow = {
      id: "org-braltiq",
      name: "Braltiq",
      archived_at: null,
      created_by: "user-a",
    };
    const members: MemberRow[] = [
      {
        organization_id: "org-braltiq",
        user_id: "user-a",
        role: "owner",
        status: "active",
      },
    ];

    expect(canSelectOrganization(org, members, "user-b")).toBe(false);
    expect(canSelectOrganization(org, members, "user-a")).toBe(true);
  });

  it("created_by != auth.uid() cannot insert", () => {
    const store = { orgs: [] as OrgRow[], members: [] as MemberRow[] };
    const result = insertOrganizationWithReturning(store, "user-a", {
      id: "org-x",
      name: "Spoof",
      created_by: "user-other",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/row-level security/i);
    }
    expect(store.orgs).toHaveLength(0);
  });

  it("existing members retain organization SELECT access", () => {
    const org: OrgRow = {
      id: "org-shared",
      name: "Shared Co",
      archived_at: null,
      created_by: "user-owner",
    };
    const members: MemberRow[] = [
      {
        organization_id: "org-shared",
        user_id: "user-owner",
        role: "owner",
        status: "active",
      },
      {
        organization_id: "org-shared",
        user_id: "user-exec",
        role: "executive",
        status: "active",
      },
    ];

    // Non-creator member still reads via membership policy
    expect(canSelectOrganization(org, members, "user-exec")).toBe(true);
    expect(isActiveOrganizationMember(members, "org-shared", "user-exec")).toBe(
      true,
    );
    expect(org.created_by === "user-exec").toBe(false);
  });

  it("without creator SELECT policy, first-org INSERT…RETURNING fails (pre-012 regression)", () => {
    const authUid = "user-creator-a";
    const org: OrgRow = {
      id: "org-braltiq",
      name: "Braltiq",
      archived_at: null,
      created_by: authUid,
    };
    // Membership-only SELECT (006 alone)
    const memberOnlySelect =
      org.archived_at === null &&
      isActiveOrganizationMember([], org.id, authUid);

    expect(canInsertOrganization(authUid, authUid)).toBe(true);
    expect(memberOnlySelect).toBe(false);
  });
});
