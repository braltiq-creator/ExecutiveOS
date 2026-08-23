import type {
  DomainConfidenceModel,
  DomainEvidenceSource,
  DomainExplainabilityModel,
  DomainLearningModel,
} from "@/domain-advisors/types";

export const MFG_EVIDENCE: DomainEvidenceSource[] = [
  {
    id: "m365",
    label: "Microsoft 365 calendar / collaboration",
    kind: "system_of_record",
  },
  {
    id: "dynamics",
    label: "Dynamics / ERP order · inventory · production",
    kind: "system_of_record",
  },
  {
    id: "dealer",
    label: "Dealer / branch demand signals",
    kind: "operating_signal",
  },
  {
    id: "factory",
    label: "Factory capacity and schedule",
    kind: "operating_signal",
  },
  {
    id: "executive",
    label: "Executive outcomes and decisions",
    kind: "human_input",
  },
];

export const MFG_CONFIDENCE: DomainConfidenceModel = {
  confidenceDrivers: [
    "Outcome alignment",
    "Evidence freshness",
    "Cross-signal agreement",
    "Historical forecast accuracy",
  ],
  uncertaintySources: [
    "Incomplete dealer reporting",
    "ERP lag",
    "Unmodelled mix shift",
    "Supplier opacity",
  ],
  calibrationRules: [
    "Lower confidence when leading and lagging indicators diverge",
    "Withhold firm recommendation when evidence older than operating cadence allows",
  ],
  withholdWhen: [
    "Critical ontology context missing",
    "Council has not stated the decision frame",
    "Conflicting systems of record unresolved",
  ],
};

export const MFG_LEARNING: DomainLearningModel = {
  predictionFocus: [
    "Demand vs actual",
    "Allocation vs fill",
    "Inventory vs plan",
    "Working capital trajectory",
  ],
  outcomeMeasures: [
    "Decision quality after the fact",
    "Avoided stockout or excess",
    "Capital released or protected",
  ],
  varianceQuestions: [
    "What did we miss in the leading indicators?",
    "Which assumption failed — demand, capacity, or channel?",
  ],
  lessonCapture: [
    "Record forecast miss root cause",
    "Update pattern library when mix shifts repeat",
  ],
  confidenceAdjustmentRules: [
    "Tighten evidence thresholds after repeated misses",
    "Raise confidence when three consecutive cycles calibrate",
  ],
};

export const MFG_EXPLAINABILITY: DomainExplainabilityModel = {
  alwaysDisclose: [
    "Evidence used",
    "Assumptions",
    "What was challenged",
    "Confidence and unknowns",
  ],
  evidencePresentation: [
    "Lead with outcome impact",
    "Separate fact from inference",
    "Name which Council roles are most affected",
  ],
  dissentHandling: [
    "Surface disagreement with Council perspectives explicitly",
    "Never bury specialist challenge to protect consensus theatre",
  ],
  humanAuthorityStatement:
    "Domain Advisors prepare evidence and challenge. The Executive Council advises. The accountable executive decides.",
};
