export type MockActionStatus = "pending" | "blocked" | "in_progress" | "done";

export type MockAction = {
  id: string;
  label: string;
  status: MockActionStatus;
  owner: string;
  deadline: string;
  outcomeIds: string[];
  decisionId?: string;
  blocker?: string;
};

export const MOCK_ACTIONS: MockAction[] = [
  {
    id: "action-helix-call",
    label: "Confirm Helix security workshop slot",
    status: "pending",
    owner: "Amelia Chen, CRO",
    deadline: "Today, 2:00 PM",
    outcomeIds: ["outcome-enterprise-arr"],
    decisionId: "decision-residency",
  },
  {
    id: "action-legal-memo",
    label: "Circulate residency exception memo to counsel",
    status: "in_progress",
    owner: "Sam Okonkwo, GC",
    deadline: "Today, 4:00 PM",
    outcomeIds: ["outcome-enterprise-arr", "outcome-board"],
    decisionId: "decision-residency",
  },
  {
    id: "action-board-draft",
    label: "Attach risk paragraph to Friday board pack",
    status: "blocked",
    owner: "Priya Nair, Chief of Staff",
    deadline: "Tomorrow, 10:00 AM",
    outcomeIds: ["outcome-board"],
    decisionId: "decision-board-risk",
    blocker: "Waiting on residency Decision",
  },
];
