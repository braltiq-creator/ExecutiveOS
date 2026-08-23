import type { AppSession, Company, ExecutiveProfile } from "@/types/session";

export const MOCK_COMPANY: Company = {
  id: "org-northline",
  name: "Northline Systems",
  industry: "B2B enterprise software",
  stage: "Series C",
  headquarters: "Sydney, Australia",
};

export const MOCK_EXECUTIVE_PROFILE: ExecutiveProfile = {
  id: "profile-alex-rivera",
  userId: "mock-user-alex-rivera",
  fullName: "Alex Rivera",
  preferredName: "Alex",
  title: "Chief Executive Officer",
  email: "alex.rivera@northline.io",
  initials: "AR",
};

export const MOCK_SESSION: AppSession = {
  userId: MOCK_EXECUTIVE_PROFILE.userId,
  email: MOCK_EXECUTIVE_PROFILE.email,
  profile: MOCK_EXECUTIVE_PROFILE,
  company: MOCK_COMPANY,
  isMock: true,
};

/** Minimal auth user shape compatible with existing requireAuth callers. */
export const MOCK_AUTH_USER = {
  id: MOCK_EXECUTIVE_PROFILE.userId,
  email: MOCK_EXECUTIVE_PROFILE.email,
  app_metadata: {},
  user_metadata: {
    full_name: MOCK_EXECUTIVE_PROFILE.fullName,
  },
  aud: "authenticated",
  created_at: "2026-01-15T00:00:00.000Z",
};
