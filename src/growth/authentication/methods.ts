import type { GrowthAuthMethod } from "@/growth/framework/types";

export const GROWTH_AUTH_METHODS: Array<{
  id: GrowthAuthMethod;
  label: string;
  description: string;
  href: string;
}> = [
  {
    id: "email",
    label: "Continue with email",
    description: "Create an account with email and password",
    href: "/get-started",
  },
  {
    id: "microsoft",
    label: "Continue with Microsoft",
    description:
      "Sign up, then connect Microsoft 365 in activation for calendar and identity context",
    href: "/get-started?auth=microsoft",
  },
];

export function resolveAuthMethod(
  query?: string | null,
): GrowthAuthMethod {
  return query === "microsoft" ? "microsoft" : "email";
}
