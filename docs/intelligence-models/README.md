# Executive Intelligence Models (EIM)

**Version:** 1.0.0  
**Status:** Canonical behavioural layer (Phase 50)  
**Last updated:** 2026-08-08  
**Code:** `src/intelligence-models/`  
**Nature:** Reusable intelligence models — not product UI, not Core, not pack implementations

---

## Position in the stack

```
EIRL (research)     docs/research/
        ↓
EIM (behaviour)     src/intelligence-models/     ← this layer
        ↓
EJF (judgement)     src/judgement-framework/     — Phase 51; whether action is required
        ↓
EIPF packs (context)  src/intelligence-packs/ + future industry packs
        ↓
Executive Council (product)  — future wiring; not in this phase
```

- **Research** explains how executives think  
- **Models** explain how executives reason  
- **Judgement** explains whether action is required (and which posture)  
- **Packs** supply industry context  
- **Identity stays consistent**; overlays adapt observations, priorities, thresholds  

---

## Every model defines

1. Observation Model  
2. Diagnosis Model  
3. Challenge Model  
4. Recommendation Model  
5. Communication Model  
6. Learning Model  
7. Council Interaction Model  

Plus durable **identity** (thesis + mental models) that industry cannot rewrite.

---

## Roles

CEO · CFO · COO · CRO · CSO · CCO · CIO · CTO · CPO (People) · Chief Risk Officer  

Permanent product Council today uses CEO–CSO; EIM already includes future Council roles.

---

## Industry overlays (examples)

Manufacturing · Mining · Utilities · Healthcare · Field Services · Technology  

Overlays **add** monitors, thresholds, and emphasis — they never change `behaviouralThesis` or `durableMentalModels`.

---

## Primary API

```ts
import {
  resolveExecutiveIntelligence,
  reviewExecutiveIntelligenceModels,
  packCouncilKnowledgeFromModels,
} from "@/intelligence-models";

const cfo = resolveExecutiveIntelligence("cfo"); // industry-agnostic
const cfoMfg = resolveExecutiveIntelligence("cfo", "manufacturing");
const review = reviewExecutiveIntelligenceModels();
const packCouncil = packCouncilKnowledgeFromModels("manufacturing");
```

---

## Self-review (must be Yes)

1. Can this model operate without industry context?  
2. Can industry overlays modify behaviour without rewriting it?  
3. Would two CFOs from different industries still feel like CFOs?  
4. Does the model describe behaviour rather than responsibilities?  

Enforced by `reviewExecutiveIntelligenceModels()` and unit tests.

---

## Related

- EIRL: [`../research/README.md`](../research/README.md)  
- EIPF: `src/intelligence-packs/`  
- Manufacturing blueprint: [`../intelligence-packs/manufacturing/README.md`](../intelligence-packs/manufacturing/README.md)  
