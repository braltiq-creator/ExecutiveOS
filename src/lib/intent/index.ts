export type {
  DecisionIntentAlignment,
  ExecutiveIntent,
  IntentConstraint,
  IntentContext,
  IntentHistoryEntry,
  IntentOutcomeRef,
  IntentPriority,
  IntentStatus,
  IntentSuccessSignal,
  OutcomeIntentAlignment,
} from "@/lib/intent/engine-types";

export {
  alignDecisionToIntent,
  assertIntentOutcomeRefs,
  buildIntentContext,
  getActiveIntent,
  resolveIntentOutcomeSets,
  resolveOutcomeAlignment,
} from "@/lib/intent/derive";

export {
  MOCK_ACTIVE_INTENT,
  MOCK_INTENT_HISTORY,
} from "@/lib/intent/mock-intent";
