export { isMockMode } from "@/lib/mock/mode";
export {
  MOCK_AUTH_USER,
  MOCK_COMPANY,
  MOCK_EXECUTIVE_PROFILE,
  MOCK_SESSION,
} from "@/lib/mock/session";
export { MOCK_INSIGHTS, type MockInsight } from "@/lib/mock/insights";
export { MOCK_ACTIONS, type MockAction, type MockActionStatus } from "@/lib/mock/actions";

/** Re-export domain mocks already used by engines. */
export { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
export { MOCK_DECISIONS } from "@/lib/decisions/mock-decisions";
