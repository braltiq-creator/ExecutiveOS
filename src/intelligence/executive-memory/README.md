# Executive Memory Engine (EME)

Long-term learning system of ExecutiveOS.

> Remembers what matters. Never invents history.

## Mission

ExecutiveOS must remember — not everything, only what matters.

| Engine | Understands |
|--------|-------------|
| Executive Intelligence | the business |
| Knowledge Graph | relationships |
| Intent Engine | the executive |
| **Executive Memory** | the journey over time |

## APIs

```ts
remember(store, event)
recall(store, query)
summariseHistory({ store, from, to, intent? })
compareBehaviour({ store, baseline…, current… })
detectDrift({ store, intent, from, to })
detectImprovement({ store, baseline…, current… })
predictBehaviour({ store, horizonDays, intent? })
recommendBasedOnHistory({ store, relatedEntityIds? })
entityTimeline(store, entityId)
deriveMemoryInsights({ store, intent? })
applyExecutiveMemory({ store, intent, narrative, recommendations })
```

## What it remembers

- Executive commitments
- Decision / outcome / risk history
- Leadership behaviour (deep work, meetings, velocity, delegation, latency, interruptions, focus)
- Recommendation outcomes (succeeded / failed)
- Strategic focus drift

## Narrative contract

Memory sentences are only emitted when `evidenceEventIds` exist. Examples from the Northline seed:

- "This issue has appeared three times in the last six weeks."
- "Meeting load has improved since your commitment last month."
- "This recommendation aligns with a previous successful decision."

## Persistence

`InMemoryExecutiveMemoryStore` today. Swap via `ExecutiveMemoryProvider` for Supabase without changing engine callers.

## Rules

1. Pure TypeScript — no UI
2. Deterministic
3. No invented historical insight
4. Everything traceable to event ids + sources
