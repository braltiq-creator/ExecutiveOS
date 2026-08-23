# Executive Judgement Engine (EJE)

Sits **above** the Executive Intelligence Engine.

> ExecutiveOS should not make executive decisions.
> ExecutiveOS should structure executive judgement.

## APIs

```ts
evaluateDecision(input)
compareOptions({ decisionId, options })
generateJudgement(input)
explainTradeoffs(options)
surfaceUnknowns(input)
deriveDecisionBrief(input)
applyExecutiveJudgement({ … }) // snapshot wiring
```

## Judgement framework

Every material Decision is scored on:

Strategic alignment · Financial · Operational · Customer · People · Compliance · Risk · Opportunity cost · Timing · Confidence

## Recommendation pack

Every option / recommendation exposes:

Benefits · Risks · Trade-offs · Dependencies · Alternatives · Unknowns · Evidence · Confidence · Reasoning path

## Rules

1. Never recommend a single course without viable alternatives when they exist
2. Never hide uncertainty
3. Always expose trade-offs
4. Deterministic, explainable, independently testable
5. No UI — pure TypeScript

## Integrations

| System | Role in EJE |
|--------|-------------|
| Executive Intelligence | Decision / Outcome / Recommendation inputs |
| Executive Intent | Strategic alignment dimension |
| Executive Memory | Historical evidence & prior outcomes |
| Knowledge Graph | Relationship paths in reasoning |
| Digital Twin | Current operational state signals |
