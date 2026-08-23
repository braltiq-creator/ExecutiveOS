import {
  INVITABLE_ROLES,
  ORGANIZATION_ROLES,
  SUBSCRIPTION_PLANS,
} from "@/lib/organizations/types";
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  JoinOrganizationByCodeInput,
  UpdateOrganizationInput,
} from "@/lib/organizations/types";
import { OrganizationError } from "@/lib/organizations/types";

const URL_PATTERN =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new OrganizationError(`${field} is required.`, "VALIDATION_ERROR");
  }

  return trimmed;
}

function optionalTrimmed(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function validateCreateOrganizationInput(
  input: CreateOrganizationInput,
): CreateOrganizationInput {
  return {
    name: requireNonEmpty(input.name, "Organization name"),
    legalName: optionalTrimmed(input.legalName),
    industry: optionalTrimmed(input.industry),
    companySize: optionalTrimmed(input.companySize),
    country: optionalTrimmed(input.country),
    timezone: requireNonEmpty(input.timezone, "Timezone"),
    website: validateWebsite(input.website),
    logoUrl: validateWebsite(input.logoUrl),
  };
}

export function validateUpdateOrganizationInput(
  input: UpdateOrganizationInput,
): UpdateOrganizationInput {
  const next: UpdateOrganizationInput = {};

  if (input.name !== undefined) {
    next.name = requireNonEmpty(input.name, "Organization name");
  }

  if (input.legalName !== undefined) {
    next.legalName = optionalTrimmed(input.legalName);
  }

  if (input.industry !== undefined) {
    next.industry = optionalTrimmed(input.industry);
  }

  if (input.companySize !== undefined) {
    next.companySize = optionalTrimmed(input.companySize);
  }

  if (input.country !== undefined) {
    next.country = optionalTrimmed(input.country);
  }

  if (input.timezone !== undefined) {
    next.timezone = requireNonEmpty(input.timezone, "Timezone");
  }

  if (input.website !== undefined) {
    next.website = validateWebsite(input.website);
  }

  if (input.logoUrl !== undefined) {
    next.logoUrl = validateWebsite(input.logoUrl);
  }

  if (Object.keys(next).length === 0) {
    throw new OrganizationError(
      "At least one field is required to update.",
      "VALIDATION_ERROR",
    );
  }

  return next;
}

export function validateInviteMemberInput(
  input: InviteMemberInput,
): InviteMemberInput {
  const email = requireNonEmpty(input.email, "Email").toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new OrganizationError("Enter a valid email address.", "VALIDATION_ERROR");
  }

  if (!(INVITABLE_ROLES as readonly string[]).includes(input.role)) {
    throw new OrganizationError("Invalid member role.", "VALIDATION_ERROR");
  }

  return { email, role: input.role };
}

export function validateJoinByCodeInput(
  input: JoinOrganizationByCodeInput,
): JoinOrganizationByCodeInput {
  const invitationCode = requireNonEmpty(
    input.invitationCode,
    "Invitation code",
  ).toUpperCase();

  if (!/^[A-Z0-9-]{6,12}$/.test(invitationCode)) {
    throw new OrganizationError(
      "Enter a valid invitation code.",
      "VALIDATION_ERROR",
    );
  }

  return { invitationCode };
}

export function validateOrganizationRole(role: string): void {
  if (!(ORGANIZATION_ROLES as readonly string[]).includes(role)) {
    throw new OrganizationError("Invalid organization role.", "VALIDATION_ERROR");
  }
}

export function validateSubscriptionPlan(plan: string): void {
  if (!(SUBSCRIPTION_PLANS as readonly string[]).includes(plan)) {
    throw new OrganizationError("Invalid subscription plan.", "VALIDATION_ERROR");
  }
}

function validateWebsite(value?: string): string | undefined {
  const trimmed = optionalTrimmed(value);

  if (!trimmed) {
    return undefined;
  }

  if (!URL_PATTERN.test(trimmed)) {
    throw new OrganizationError("Enter a valid URL.", "VALIDATION_ERROR");
  }

  return trimmed;
}

export function normalizeInvitationCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
