import type { Metadata } from "next";
import { StartTrialWizard } from "@/components/marketing/StartTrialWizard";
import { START_TRIAL_PAGE } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Start Trial",
  description: START_TRIAL_PAGE.subheadline,
};

type Props = {
  searchParams: Promise<{ profile?: string }>;
};

export default async function StartTrialPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile =
    params.profile === "operations" ||
    params.profile === "commercial" ||
    params.profile === "manufacturing"
      ? params.profile
      : undefined;

  return <StartTrialWizard initialProfile={profile} />;
}
