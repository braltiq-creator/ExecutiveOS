import type { Metadata } from "next";
import { ProfilePageView } from "@/components/marketing/ProfilePage";
import { PROFILES } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: PROFILES.commercial.name,
  description: PROFILES.commercial.subheadline,
};

export default function CommercialProfilePage() {
  return <ProfilePageView profile={PROFILES.commercial} />;
}
