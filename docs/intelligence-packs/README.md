# Executive Intelligence Packs — Knowledge Blueprints

Industry capability extends ExecutiveOS through **Executive Intelligence Packs** (EIPF: `src/intelligence-packs/`).

This folder holds **discovery blueprints** — authoritative knowledge architecture written **before** pack code.

| Blueprint | Status | Pack code |
|-----------|--------|-----------|
| [Manufacturing](./manufacturing/README.md) | Phase 48 blueprint + **Phase 52 production pack** | `src/intelligence-packs/packs/manufacturing/` — see [IMPLEMENTATION.md](./manufacturing/IMPLEMENTATION.md) |

## Rules

1. Blueprint first — understand executive leadership before features.  
2. Packs inherit EIPF — never Core industry forks.  
3. Implement a pack from a blueprint only when a phase explicitly authorises it (Manufacturing: Phase 52).  
4. Ground blueprints in the **Executive Intelligence Research Library:** [`../research/README.md`](../research/README.md).  
5. Inherit executive **behaviour** from **Executive Intelligence Models:** [`../intelligence-models/README.md`](../intelligence-models/README.md) — packs supply context only.  
6. Judgement posture from **Executive Judgement Framework:** [`../judgement-framework/README.md`](../judgement-framework/README.md) — packs do not redefine judgement.  
7. Specialist expertise from **Executive Domain Advisors:** [`../domain-advisors/README.md`](../domain-advisors/README.md) — pack-activated; advise Council; never join Council (Phase 52A).

### Stack

```
EIRL → EIM → EJF → Industry Pack → Domain Advisors → Council → Recommendation → Experience
```

*Confidence Through Clarity.*
