import type { Metadata } from "next";
import { ProfilePageView } from "@/components/marketing/ProfilePage";
import { PROFILES } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: PROFILES.operations.name,
  description: PROFILES.operations.subheadline,
};

export default function OperationsProfilePage() {
  return <ProfilePageView profile={PROFILES.operations} />;
}
