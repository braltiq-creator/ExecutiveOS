import type {
  ExecutiveChallengesData,
  ExecutiveIdentityData,
  ExecutiveProfile,
  ObjectiveInput,
  ObjectivePriority,
  OnboardingWizardData,
  OperatingSystemData,
  OrganisationData,
  StrategicObjective,
} from "@/types/onboarding";

export function createEmptyWizardData(): OnboardingWizardData {
  return {
    identity: {
      fullName: "",
      preferredName: "",
      jobTitle: "",
      company: "",
      industry: "",
      country: "",
      timezone: "",
    },
    organisation: {
      companySize: "",
      annualRevenueBand: "",
      teamSize: 0,
      directReports: 0,
      departmentsResponsibleFor: "",
      geographicResponsibility: "",
    },
    objectives: [
      { title: "", description: "", priority: "high" },
      { title: "", description: "", priority: "medium" },
      { title: "", description: "", priority: "low" },
    ],
    challenges: {
      biggestBusinessChallenge: "",
      biggestLeadershipChallenge: "",
      biggestProductivityChallenge: "",
    },
    operatingSystem: {
      businessSystems: [],
    },
  };
}

function mapObjective(objective: StrategicObjective | undefined, fallback: ObjectivePriority): ObjectiveInput {
  return {
    title: objective?.title ?? "",
    description: objective?.description ?? "",
    priority: objective?.priority ?? fallback,
  };
}

export function mapToWizardData(
  profile: ExecutiveProfile | null,
  objectives: StrategicObjective[],
): OnboardingWizardData {
  const empty = createEmptyWizardData();

  if (!profile) {
    return empty;
  }

  const sortedObjectives = [...objectives].sort(
    (left, right) => left.sort_order - right.sort_order,
  );

  return {
    identity: {
      fullName: profile.full_name ?? "",
      preferredName: profile.preferred_name ?? "",
      jobTitle: profile.job_title ?? "",
      company: profile.company ?? "",
      industry: profile.industry ?? "",
      country: profile.country ?? "",
      timezone: profile.timezone ?? "",
    },
    organisation: {
      companySize: profile.company_size ?? "",
      annualRevenueBand: profile.annual_revenue_band ?? "",
      teamSize: profile.team_size ?? 0,
      directReports: profile.direct_reports ?? 0,
      departmentsResponsibleFor: profile.departments_responsible_for ?? "",
      geographicResponsibility: profile.geographic_responsibility ?? "",
    },
    objectives: [
      mapObjective(sortedObjectives[0], "high"),
      mapObjective(sortedObjectives[1], "medium"),
      mapObjective(sortedObjectives[2], "low"),
    ],
    challenges: {
      biggestBusinessChallenge: profile.biggest_business_challenge ?? "",
      biggestLeadershipChallenge: profile.biggest_leadership_challenge ?? "",
      biggestProductivityChallenge: profile.biggest_productivity_challenge ?? "",
    },
    operatingSystem: {
      businessSystems: profile.business_systems ?? [],
    },
  };
}

export function mapIdentityToRow(data: ExecutiveIdentityData) {
  return {
    full_name: data.fullName.trim(),
    preferred_name: data.preferredName.trim() || null,
    job_title: data.jobTitle.trim(),
    company: data.company.trim(),
    industry: data.industry,
    country: data.country,
    timezone: data.timezone,
  };
}

export function mapOrganisationToRow(data: OrganisationData) {
  return {
    company_size: data.companySize,
    annual_revenue_band: data.annualRevenueBand,
    team_size: data.teamSize,
    direct_reports: data.directReports,
    departments_responsible_for: data.departmentsResponsibleFor.trim(),
    geographic_responsibility: data.geographicResponsibility.trim(),
  };
}

export function mapChallengesToRow(data: ExecutiveChallengesData) {
  return {
    biggest_business_challenge: data.biggestBusinessChallenge.trim(),
    biggest_leadership_challenge: data.biggestLeadershipChallenge.trim(),
    biggest_productivity_challenge: data.biggestProductivityChallenge.trim(),
  };
}

export function mapOperatingSystemToRow(data: OperatingSystemData) {
  return {
    business_systems: data.businessSystems,
  };
}
