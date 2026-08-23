export type ExecutiveProfile = {
  id: string;
  userId: string;
  fullName: string;
  preferredName: string;
  title: string;
  email: string;
  initials: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  stage: string;
  headquarters: string;
};

export type AppSession = {
  userId: string;
  email: string;
  profile: ExecutiveProfile;
  company: Company;
  isMock: boolean;
};
