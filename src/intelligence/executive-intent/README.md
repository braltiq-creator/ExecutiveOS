# Executive Intent Engine (EInE)

ExecutiveOS understands the organisation (EIE + Knowledge Graph).  
This engine understands **the executive**.

> Every recommendation is filtered through executive intent.

## Location

```
src/intelligence/executive-intent/
```

## Model

- Strategic Priorities (title, weight, horizon, owner, related Outcomes)
- Leadership Themes
- Quarterly Objectives
- Preferences (decision / attention / meeting)
- Risk Appetite
- Time Horizon
- Delegation Style
- Leadership Capacity

## API

```ts
import {
  getExecutiveIntent,
  scoreAgainstIntent,
  calculateStrategicAlignment,
  calculateAttentionPriority,
  recommendDelegation,
  generateIntentNarrative,
  applyExecutiveIntent,
} from "@/intelligence/executive-intent";

const intent = getExecutiveIntent(); // default CEO mock

scoreAgainstIntent(intent, {
  id: "decision-residency",
  kind: "decision",
  label: "Helix residency",
  outcomeIds: ["outcome-enterprise-arr", "outcome-board"],
  businessImportance: 88,
});
```

## Alignment levels

| Level | Label |
|-------|-------|
| `high` | High Alignment |
| `medium` | Medium Alignment |
| `low` | Low Alignment |
| `conflicts` | Conflicts With Executive Intent |

## Mock profiles

CEO · COO · CFO · Chief of Staff — different priorities and attention models.

```ts
import { getExecutiveIntentForRole } from "@/intelligence/executive-intent";

getExecutiveIntentForRole("COO");
```

## Integration

`buildIntelligentExecutiveSnapshot` applies intent after Intelligence + Knowledge Graph:

1. Score Decisions / Outcomes / Recommendations
2. Re-rank by `attentionPriority` = business × intent
3. Rewrite morning narrative to **what affects YOUR priorities**

## Docs

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
