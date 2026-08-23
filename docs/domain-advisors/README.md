# Executive Domain Advisor Framework (Phase 52A)

**Code:** `src/domain-advisors/`  
**Philosophy:** Confidence Through Clarity  
**Relationship to Council:** Advisors **advise** the permanent Executive Council. They are **not** Council members.

## Permanent Executive Council (unchanged)

| Role |
|------|
| CEO |
| CFO |
| COO |
| CRO |
| CSO |

Industries introduce **expertise**, not new executives.

## Architecture position

```
Executive Research Library (EIRL)
        ↓
Executive Intelligence Models (EIM)
        ↓
Executive Judgement Framework (EJF)
        ↓
Industry Intelligence Pack (EIPF)
        ↓
Executive Domain Advisors          ← Phase 52A
        ↓
Executive Council
        ↓
Executive Recommendation
        ↓
Executive Experience System
```

## What Domain Advisors are

Specialist domain experts activated by an Industry Intelligence Pack. They provide:

- Evidence  
- Challenge to assumptions  
- Domain recommendations **before** Council recommendations harden  

They inherit the EIM design philosophy: observation · diagnosis · challenge · recommendation style · confidence · evidence · learning · explainability.

## What they are not

- Not members of the Executive Council  
- Not a redesign of `src/experience/executive-council`  
- Not Core engines or providers  
- Not the product chat advisors in `src/lib/agents` / `/advisors`  

## Activation

```ts
import {
  activateDomainAdvisorsForIndustry,
  domainAdvisorsActivatedByPack,
} from "@/domain-advisors";

activateDomainAdvisorsForIndustry("manufacturing");
// or
domainAdvisorsActivatedByPack(manufacturingPack);
```

Manufacturing pack declares `provides: ["domain-advisors", …]`. Other industries ship **catalogues** until a pack phase authorises full advisor models.

## Industry catalogues

| Industry | Status |
|----------|--------|
| Manufacturing | Full advisors (10) + catalogue |
| Mining · Utilities · Construction · Healthcare · Government · Technology · Financial Services · Retail · Professional Services · Field Services · Logistics | Catalogues |

## Self-review

```ts
import { reviewDomainAdvisorFramework } from "@/domain-advisors";
reviewDomainAdvisorFramework();
```

Gates: Council stable · 12 catalogues · 10 manufacturing advisors · no Council-membership claims.

## Related demos

- [Hitachi Manufacturing Executive Demo](../demos/HITACHI_MANUFACTURING_EXECUTIVE_DEMO.md)  
- [Experience mockups](../demos/mockups/)  

---

*Confidence Through Clarity.*
