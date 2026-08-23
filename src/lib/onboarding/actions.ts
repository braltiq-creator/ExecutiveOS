"use server";

import { createProfile, getProfile } from "@/lib/auth/profile";
import { requireAuth } from "@/lib/auth/actions";
import {
  mapChallengesToRow,
  mapIdentityToRow,
  mapOperatingSystemToRow,
  mapOrganisationToRow,
} from "@/lib/onboarding/mappers";
import {
  markOnboardingComplete,
  replaceStrategicObjectives,
  updateExecutiveProfile,
} from "@/lib/onboarding/mutations";
import {
  getExecutiveProfile,
  getStrategicObjectives,
} from "@/lib/onboarding/queries";
import {
  validateChallenges,
  validateIdentity,
  validateObjectives,
  validateOperatingSystem,
  validateOrganisation,
} from "@/lib/onboarding/validation";
import type {
  ExecutiveChallengesData,
  ExecutiveIdentityData,
  ObjectiveInput,
  OnboardingActionResult,
  OperatingSystemData,
  OrganisationData,
} from "@/types/onboarding";

async function runStep<T>(
  validate: (data: T) => string | null,
  data: T,
  persist: (userId: string, data: T) => Promise<void>,
): Promise<OnboardingActionResult> {
  const validationError = validate(data);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const user = await requireAuth();
    await persist(user.id, data);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save progress.",
    };
  }
}

export async function saveIdentityStep(
  data: ExecutiveIdentityData,
): Promise<OnboardingActionResult> {
  return runStep(validateIdentity, data, async (userId) => {
    await updateExecutiveProfile(userId, mapIdentityToRow(data));
  });
}

export async function saveOrganisationStep(
  data: OrganisationData,
): Promise<OnboardingActionResult> {
  return runStep(validateOrganisation, data, async (userId) => {
    await updateExecutiveProfile(userId, mapOrganisationToRow(data));
  });
}

export async function saveObjectivesStep(
  objectives: ObjectiveInput[],
): Promise<OnboardingActionResult> {
  return runStep(validateObjectives, objectives, async (userId) => {
    const profileId = await updateExecutiveProfile(userId, {});
    await replaceStrategicObjectives(userId, profileId, objectives);
  });
}

export async function saveChallengesStep(
  data: ExecutiveChallengesData,
): Promise<OnboardingActionResult> {
  return runStep(validateChallenges, data, async (userId) => {
    await updateExecutiveProfile(userId, mapChallengesToRow(data));
  });
}

export async function saveOperatingSystemStep(
  data: OperatingSystemData,
): Promise<OnboardingActionResult> {
  return runStep(validateOperatingSystem, data, async (userId) => {
    await updateExecutiveProfile(userId, mapOperatingSystemToRow(data));
  });
}

export async function completeExecutiveOnboarding(): Promise<OnboardingActionResult> {
  try {
    const user = await requireAuth();
    const profile = await getExecutiveProfile(user.id);
    const objectives = await getStrategicObjectives(user.id);

    if (!profile) {
      return { error: "Complete all onboarding steps before continuing." };
    }

    const identityError = validateIdentity({
      fullName: profile.full_name ?? "",
      preferredName: profile.preferred_name ?? "",
      jobTitle: profile.job_title ?? "",
      company: profile.company ?? "",
      industry: profile.industry ?? "",
      country: profile.country ?? "",
      timezone: profile.timezone ?? "",
    });

    if (identityError) {
      return { error: identityError };
    }

    const organisationError = validateOrganisation({
      companySize: profile.company_size ?? "",
      annualRevenueBand: profile.annual_revenue_band ?? "",
      teamSize: profile.team_size ?? 0,
      directReports: profile.direct_reports ?? 0,
      departmentsResponsibleFor: profile.departments_responsible_for ?? "",
      geographicResponsibility: profile.geographic_responsibility ?? "",
    });

    if (organisationError) {
      return { error: organisationError };
    }

    const objectivesError = validateObjectives(
      objectives.map((objective) => ({
        title: objective.title,
        description: objective.description ?? "",
        priority: objective.priority,
      })),
    );

    if (objectivesError) {
      return { error: objectivesError };
    }

    const challengesError = validateChallenges({
      biggestBusinessChallenge: profile.biggest_business_challenge ?? "",
      biggestLeadershipChallenge: profile.biggest_leadership_challenge ?? "",
      biggestProductivityChallenge: profile.biggest_productivity_challenge ?? "",
    });

    if (challengesError) {
      return { error: challengesError };
    }

    const operatingSystemError = validateOperatingSystem({
      businessSystems: profile.business_systems ?? [],
    });

    if (operatingSystemError) {
      return { error: operatingSystemError };
    }

    await markOnboardingComplete(user.id);

    const authProfile = await getProfile(user.id);
    if (!authProfile) {
      await createProfile(user.id);
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to complete onboarding.",
    };
  }
}
