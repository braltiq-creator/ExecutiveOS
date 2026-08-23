import type {
  ExecutiveChallengesData,
  ExecutiveIdentityData,
  ObjectiveInput,
  OperatingSystemData,
  OrganisationData,
} from "@/types/onboarding";

function required(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} is required.`;
  }
  return null;
}

export function validateIdentity(data: ExecutiveIdentityData): string | null {
  return (
    required(data.fullName, "Full name") ??
    required(data.jobTitle, "Job title") ??
    required(data.company, "Company") ??
    required(data.industry, "Industry") ??
    required(data.country, "Country") ??
    required(data.timezone, "Time zone")
  );
}

export function validateOrganisation(data: OrganisationData): string | null {
  if (!data.companySize) {
    return "Company size is required.";
  }
  if (!data.annualRevenueBand) {
    return "Annual revenue band is required.";
  }
  if (!Number.isFinite(data.teamSize) || data.teamSize < 0) {
    return "Enter a valid team size.";
  }
  if (!Number.isFinite(data.directReports) || data.directReports < 0) {
    return "Enter a valid number of direct reports.";
  }
  return (
    required(data.departmentsResponsibleFor, "Departments responsible for") ??
    required(data.geographicResponsibility, "Geographic responsibility")
  );
}

export function validateObjectives(objectives: ObjectiveInput[]): string | null {
  for (let index = 0; index < objectives.length; index += 1) {
    const objective = objectives[index];
    const step = index + 1;

    if (!objective.title.trim()) {
      return `Objective ${step} title is required.`;
    }
    if (!objective.description.trim()) {
      return `Objective ${step} description is required.`;
    }
    if (!objective.priority) {
      return `Objective ${step} priority is required.`;
    }
  }

  return null;
}

export function validateChallenges(data: ExecutiveChallengesData): string | null {
  return (
    required(data.biggestBusinessChallenge, "Biggest business challenge") ??
    required(data.biggestLeadershipChallenge, "Biggest leadership challenge") ??
    required(
      data.biggestProductivityChallenge,
      "Biggest personal productivity challenge",
    )
  );
}

export function validateOperatingSystem(data: OperatingSystemData): string | null {
  if (data.businessSystems.length === 0) {
    return "Select at least one business system.";
  }
  return null;
}
