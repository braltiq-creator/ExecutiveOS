# Executive Council — Architecture

## Position

```
IntelligentExecutiveSnapshot
        │
        ▼
  conveneExecutiveCouncil()
        │
        ├─ Chief of Staff
        ├─ CFO
        ├─ COO
        ├─ CRO
        ├─ Chief Risk Officer
        ├─ Chief People Officer
        ├─ Chief Customer Officer
        └─ Chief Strategy Officer
        │
        ▼
  ExecutiveCouncilBrief (conflicts preserved)
        │
        ▼
  toCouncilView → Today "Executive Council"
```

## Conflict policy

When CFO says **delay** and COO says **proceed**, both are shown.  
Chief of Staff facilitation: **escalate to executive review**.  
Opinions are never averaged.

## Invariants

1. Pure TypeScript, deterministic
2. No LLM dependency
3. No invented facts
4. Explainable reasoning paths
5. Executive remains decision maker
