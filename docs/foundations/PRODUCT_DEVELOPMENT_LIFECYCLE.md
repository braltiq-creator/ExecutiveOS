# ExecutiveOS Product Development Lifecycle

**Status:** Foundational governance  
**Audience:** Founders · Product · Design · Engineering · AI systems  
**Horizon:** Intended to guide how capabilities are built for the next decade  
**Nature:** How product work is performed — not a software methodology, sprint playbook, or tool manual  

---

## Introduction

Every feature, capability, AI agent, workflow, integration, and experience must progress through a consistent lifecycle.

The objective is to keep ExecutiveOS coherent, intentional, and aligned with its Product Principles as it grows.

Speed without this discipline produces noise: screens that do not answer a question, asks before value, duplicated truth, and intelligence that assumes authority. The lifecycle exists to protect judgment quality — for customers and for the company.

Work that skips stages is not “moving fast.” It is borrowing against trust and focus.

---

## The ExecutiveOS Product Lifecycle

```
Discover → Decide → Specify → Build → Review → Learn
                ↑_______________________________|
```

Each stage has a purpose, activities, deliverables, and exit criteria. Later stages do not reopen earlier ones casually; they return through Learn when evidence demands it.

---

## Stage 1 — Discover

### Purpose

Understand the customer problem before discussing solutions.

### Activities

- Product workshops  
- Customer interviews  
- Problem framing  
- Jobs to be Done  
- Executive workflows  
- Pain-point validation  

### Deliverables

- Workshop outcomes  
- Problem statement  
- Success criteria  

### Exit criteria

The problem is clearly understood and worth solving.

**Checkpoint questions**

- Whose judgment is harmed today if we do nothing?  
- What evidence shows this is real, not assumed?  
- What would “solved” feel like for the executive?

---

## Stage 2 — Decide

### Purpose

Make deliberate product decisions.

### Activities

- Founder review  
- Product trade-offs  
- Product Principle review  
- Alignment with Constitution and Strategy  

### Deliverables

- Approved decisions  
- Updated workshop outputs  

### Exit criteria

A single preferred direction has been chosen.

**Checkpoint questions**

- What alternatives were rejected, and why?  
- Which Product Principles bind this choice?  
- Does this strengthen the Core Executive Loop — or create an island?

---

## Stage 3 — Specify

### Purpose

Translate decisions into detailed implementation guidance.

### Activities

- Product specifications  
- UX behaviour  
- Acceptance criteria  
- Information architecture  
- Data requirements  

### Deliverables

- Functional specification  
- Engineering-ready documentation  

### Exit criteria

Engineering has everything required to build.

**Checkpoint questions**

- Is the primary executive question for each surface explicit?  
- What is inferred, confirmed, and never asked?  
- What is explicitly out of scope for this delivery?

---

## Stage 4 — Build

### Purpose

Implement the approved specification.

### Activities

- Engineering  
- Testing  
- Code review  
- ADR updates where required  

### Deliverables

- Working capability  

### Exit criteria

Feature complete against the approved specification (not against improvised extras).

**Checkpoint questions**

- Are we building what was decided — or what was convenient?  
- Have architectural decisions that change sources of truth been recorded?  
- Does anything new duplicate business state?

---

## Stage 5 — Review

### Purpose

Assess whether the implementation aligns with Product Principles — before calling the work done.

### Review questions

- Does it reduce cognitive load?  
- Does it protect attention?  
- Does it increase confidence?  
- Does it respect Progressive Trust?  
- Does it deliver value quickly?  
- Does it demonstrate recognition before recommendation?  
- Does the executive clearly retain the decision?  
- Does every new surface answer one clear question?  

### Deliverables

- Review outcomes  
- Improvement actions (blockers vs. follow-ups)  

### Exit criteria

Principle alignment accepted, or material issues remediated before release.

---

## Stage 6 — Learn

### Purpose

Improve the product based on evidence.

### Activities

- Customer feedback  
- Usage insights (in service of outcomes, not vanity engagement)  
- Founder review  
- Product improvements  

### Deliverables

- Prioritised enhancements  
- Updated roadmap  

### Exit criteria

Learning has been converted into explicit next decisions — or a conscious choice to leave the capability unchanged.

**Checkpoint questions**

- What did executives actually do with this?  
- Did confidence and decision quality improve?  
- What should return to Discover rather than receive a patch?

---

## Governance

Product work flows through foundations before code:

```
Constitution
    ↓
Strategy
    ↓
Product Principles
    ↓
Workshops
    ↓
Specifications
    ↓
Architecture (ADRs · domain · systems)
    ↓
Engineering
    ↓
Review
    ↓
Learn → (returns upstream as needed)
```

| Layer | Role in the lifecycle |
|-------|------------------------|
| **Constitution** | Beliefs and non-negotiables |
| **Strategy** | Market direction and what we will never become |
| **Product Principles** | How every product decision is judged |
| **Workshops** | Discover and Decide — collaborative problem and direction |
| **Specifications** | Specify — buildable clarity |
| **Architecture** | Structural decisions that preserve one source of truth |
| **Engineering** | Build — faithful implementation |
| **Review** | Principle and quality gate before release |
| **Learn** | Evidence that reshapes the next cycle |

### Rules

1. **Work should never bypass earlier stages.** A clever build without Discover and Decide is ungoverned.  
2. **Decide before Specify; Specify before Build.** Debate belongs upstream of code.  
3. **Architecture follows product decisions** — and constrains them when truth, tenancy, or the Core Executive Loop would break.  
4. **Review is not optional** because tests passed. Principles can fail while software “works.”  
5. **Learn does not license silent redesign.** Material direction changes return to Decide.

---

## Definition of Ready

Engineering does not begin until all of the following are true:

| # | Criterion |
|---|-----------|
| 1 | Problem statement and success criteria exist from Discover |
| 2 | A single preferred direction is approved from Decide |
| 3 | Product Principle conflicts are resolved or the work is rejected |
| 4 | Alignment with Constitution, Strategy, and Core Executive Loop is explicit |
| 5 | Functional specification and acceptance criteria are complete enough to build without invention |
| 6 | Information architecture and data requirements are clear — including what is *not* stored or duplicated |
| 7 | Infer / confirm / never-ask boundaries are stated where relevant |
| 8 | Out-of-scope items are listed |
| 9 | Required ADR updates are identified (or confirmed unnecessary) |
| 10 | A Review owner is named for Stage 5 |

If engineering must invent product behaviour to proceed, the work is **not ready**.

---

## Definition of Done

A capability is not complete until all of the following are true:

| # | Criterion |
|---|-----------|
| 1 | Behaviour matches the approved specification and acceptance criteria |
| 2 | Tests and code review appropriate to the change are complete |
| 3 | Required ADR / architecture documentation is updated |
| 4 | Stage 5 Review against Product Principles is passed (or blocking issues fixed) |
| 5 | Cognitive load, attention, trust, and “executive decides” checks are satisfied |
| 6 | Value path is usable without unnecessary setup or premature commitment asks |
| 7 | No new duplicate source of business truth was introduced |
| 8 | Failure and empty states are honest (no fabricated certainty) |
| 9 | Learn inputs are defined (what we will watch or ask next) — even if light |
| 10 | Founders / product accept release — not merely that the branch merged |

“Feature complete” in code is necessary. It is not sufficient.

---

## Relationship to Other Foundations

| Document | Relationship |
|----------|----------------|
| [Constitution](../architecture/EXECUTIVEOS_CONSTITUTION_v1.md) | Bounds what may ever be decided |
| [Product Strategy](../product/PRODUCT_STRATEGY.md) | Bounds what is worth discovering |
| [Product Principles](./PRODUCT_PRINCIPLES.md) | Bound Decide, Review, and Done |
| [Core Executive Loop](../architecture/CORE_EXECUTIVE_LOOP.md) | Tests whether a capability strengthens behaviour |
| Workshops | Primary Discover / Decide instruments |
| ADRs & architecture docs | Record structural choices during Specify / Build |

---

## Closing

ExecutiveOS will be judged by the quality of executive judgment it enables — and by whether the company itself practiced judgment while building.

This lifecycle is how that discipline is kept: discover the problem, decide deliberately, specify clearly, build faithfully, review against principle, and learn without vanity.

---

*Governance document. Methods and tools may change. The obligation to earn each stage does not.*
