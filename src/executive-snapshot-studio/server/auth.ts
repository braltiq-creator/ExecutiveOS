/**
 * Snapshot Studio server-action authz.
 * Derives organisation from membership — does not trust client org alone.
 */

import { getAuthenticatedUser } from "@/lib/auth/actions";
import { isMockMode } from "@/lib/mock/mode";
import { MOCK_AUTH_USER } from "@/lib/mock/session";
import { fetchActiveMembership } from "@/lib/organizations/queries";

export type StudioAuthOk = {
  ok: true;
  userId: string;
  organisationId: string;
};

export type StudioAuthErr = {
  ok: false;
  error: string;
  code: "UNAUTHENTICATED" | "FORBIDDEN";
};

export type StudioAuthResult = StudioAuthOk | StudioAuthErr;

const MOCK_ORG = "org-mock-studio";

/**
 * Authenticated session with an active organisation (from membership).
 */
export async function requireStudioSession(): Promise<StudioAuthResult> {
  if (isMockMode()) {
    return {
      ok: true,
      userId: MOCK_AUTH_USER.id,
      organisationId: MOCK_ORG,
    };
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      error: "Authentication required.",
    };
  }

  const membership = await fetchActiveMembership(user.id);
  if (!membership) {
    return {
      ok: false,
      code: "FORBIDDEN",
      error: "Organisation membership is required.",
    };
  }

  return {
    ok: true,
    userId: user.id,
    organisationId: membership.organization.id,
  };
}

/**
 * Authenticate + authorise Studio mutations for a claimed organisation.
 * @param requestedOrganisationId — client hint; must match membership when not mock.
 */
export async function requireStudioActor(
  requestedOrganisationId?: string | null,
): Promise<StudioAuthResult> {
  const session = await requireStudioSession();
  if (!session.ok) return session;

  if (isMockMode()) {
    const orgId = requestedOrganisationId?.trim() || session.organisationId;
    return {
      ok: true,
      userId: session.userId,
      organisationId: orgId,
    };
  }

  const requested = requestedOrganisationId?.trim();
  if (requested && requested !== session.organisationId) {
    return {
      ok: false,
      code: "FORBIDDEN",
      error: "Not authorised for this organisation.",
    };
  }

  return session;
}
