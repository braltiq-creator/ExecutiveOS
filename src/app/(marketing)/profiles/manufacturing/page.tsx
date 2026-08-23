import type { Metadata } from "next";
import { ProfilePageView } from "@/components/marketing/ProfilePage";
import { PROFILES } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: PROFILES.manufacturing.name,
  description: PROFILES.manufacturing.subheadline,
};

export default function ManufacturingProfilePage() {
  return <ProfilePageView profile={PROFILES.manufacturing} enterprise />;
}
