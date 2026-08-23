# Executive Judgement Framework (EJF) — Phase 51

**Confidence Through Clarity.**

## Position in the stack

```
EIRL (research) → EIM (reasoning) → EJF (judgement) → EIPF packs → Council / product
```

| Layer | Question |
| --- | --- |
| **EIM** | How does this executive *think*? |
| **EJF** | Does this executive judge that *action is required* — and which posture? |
| **EJE** (`src/intelligence/executive-judgement`) | How do we *score options* for a decision brief? |

EJF does **not** modify Core, workspaces, Intelligence Packs, or providers.

## Judgement states

Observe → Monitor → Investigate → Challenge → Recommend → Escalate → Crisis

Each state defines purpose, entry/exit conditions, confidence bands, escalation rules, expected behaviour, Council interaction, and communication style.

See `src/judgement-framework/states.ts`.

## Judgement factors

Business impact, urgency, confidence, evidence quality, outcome alignment, strategic importance, risk, opportunity, cost of delay, reversibility, decision complexity, stakeholder impact.

## Role judgement

Each executive applies factors differently (CEO enterprise/strategy/stakeholders; CFO exposure/cash; COO execution/capacity; CRO growth/pipeline; CSO drift/position — plus CCO/CIO/CTO/CPO/CRISK).

Industry overlays **adjust thresholds only**. They never redefine judgement identity.

## Council judgement

Executives may hold **different** states. Example:

| Role | State |
| --- | --- |
| CFO | Escalate |
| COO | Monitor |
| CEO | Investigate |

**Council Consensus:** Investigate before decision.

Dissent is preserved — never averaged away.

## Learning

Metrics: judgement quality, escalation accuracy, false positives/negatives, recommendation timing, decision outcomes, confidence calibration.

`refineJudgementThresholds()` maps signals → threshold deltas.

## API

```ts
import {
  judgeAsExecutive,
  judgeAsCouncil,
  reviewExecutiveJudgementFramework,
} from "@/judgement-framework";

const cfo = judgeAsExecutive("cfo", factors);
const council = judgeAsCouncil(["cfo", "coo", "ceo"], factors);
const review = reviewExecutiveJudgementFramework();
```

## Self-review

1. Does ExecutiveOS distinguish reasoning from judgement? **Yes** (EIM vs EJF).
2. Can executives decide not to recommend action? **Yes** (Observe / Monitor).
3. Can different executives hold different judgement states? **Yes** (Council preserves dissent).
4. Can judgement improve through learning? **Yes** (metrics + threshold refinement).
