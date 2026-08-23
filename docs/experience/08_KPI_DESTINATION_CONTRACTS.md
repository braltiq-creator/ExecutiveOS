# 8. KPI Destination Contracts

**Phase 36 · Experience Alignment**  

Every Today KPI is a **gateway**. Clicking must open a dedicated workspace section with a clear purpose, outcome, actions, and return path.

---

## Contract template

For each KPI:

| Field | Meaning |
|-------|---------|
| Destination module | Primary nav workspace |
| Destination section | Anchor / section within that workspace |
| Purpose | Why this drill exists |
| User outcome | What the executive can do after arriving |
| Expected actions | Concrete moves in the workspace |
| Return path | How they get back to Today |

---

## 8.1 Organisation Health

| Field | Contract |
|-------|----------|
| Icon | Building |
| Today href | `/strategy` |
| Destination module | Strategy |
| Destination section | **Organisation / Portfolio Health** (top summary + outcome portfolio) |
| Purpose | Understand aggregate organisational posture behind the score |
| User outcome | Know which outcomes drive health up or down |
| Expected actions | Scan outcome health · Open at-risk outcome · Reframe focus if needed |
| Return path | BrandMark → Today · Primary Today |

---

## 8.2 Executive Value

| Field | Contract |
|-------|----------|
| Icon | Gem |
| Today href | `/reports` |
| Destination module | Reports |
| Destination section | **Executive Value** (value strip / EVS summary; deep link sibling `/value` allowed) |
| Purpose | Inspect estimated value realised and confidence |
| User outcome | Trust (or question) the value narrative; export if needed |
| Expected actions | Review 30-day value · Open value detail · Generate ROI narrative |
| Return path | BrandMark → Today · Primary Today |

---

## 8.3 Strategic Outcomes

| Field | Contract |
|-------|----------|
| Icon | Target |
| Today href | `/strategy` |
| Destination module | Strategy |
| Destination section | **Strategic Outcomes portfolio** |
| Purpose | See on-track vs watching/at-risk outcomes |
| User outcome | Prioritise which outcomes need leadership attention |
| Expected actions | Filter by health · Open outcome L3 · Link initiative / intent |
| Return path | BrandMark → Today |

---

## 8.4 Priority Decisions

| Field | Contract |
|-------|----------|
| Icon | Brain |
| Today href | `/decisions` |
| Destination module | Decisions |
| Destination section | **Decision queue** (waiting / priority) |
| Purpose | Confront judgments that require the executive |
| User outcome | Decide, defer, or assign the next decision |
| Expected actions | Open top decision · Advance status · Link to outcome |
| Return path | BrandMark → Today · After decide, prefer Today or queue root |

---

## 8.5 Critical Risks

| Field | Contract |
|-------|----------|
| Icon | Shield Alert |
| Today href | `/decisions` |
| Destination module | Decisions |
| Destination section | **Risks requiring judgment** (risk-tagged queue / register filter) |
| Purpose | Face elevated risks that need executive judgment |
| User outcome | Contain, escalate, or accept risk with eyes open |
| Expected actions | Open risk-linked decision · Review impact · Schedule follow-up |
| Return path | BrandMark → Today |

---

## 8.6 Customer Health

| Field | Contract |
|-------|----------|
| Icon | Handshake |
| Today href | `/knowledge` |
| Destination module | Knowledge |
| Destination section | **Customer & relationship signal** |
| Purpose | Ground judgment in customer/memory context |
| User outcome | See what customer signal means for strategy/decisions |
| Expected actions | Open customer insight · Follow evidence · Jump to related decision |
| Return path | BrandMark → Today |

---

## 8.7 System Health

| Field | Contract |
|-------|----------|
| Icon | Server |
| Today href | `/administration` |
| Destination module | Administration |
| Destination section | **Platform / integrations health** (hub card → system or integrations) |
| Purpose | Confirm ExecutiveOS and connections are fit for trust |
| User outcome | Fix or escalate platform issues before relying on signals |
| Expected actions | Open integrations · Check ops/admin health · Review incidents if present |
| Return path | BrandMark → Today |

---

## 8.8 People Health

| Field | Contract |
|-------|----------|
| Icon | Users |
| Today href | `/team` (Administration family) |
| Destination module | Administration |
| Destination section | **Team / capacity** (`/team`) |
| Purpose | Understand leadership capacity and access posture |
| User outcome | Adjust seats, ownership, or expectations of capacity |
| Expected actions | Review team · Adjust access · Note capacity constraint for decisions |
| Return path | Administration hub or BrandMark → Today |

---

## 8.9 Commercial Health

| Field | Contract |
|-------|----------|
| Icon | Trending Up |
| Today href | `/strategy` |
| Destination module | Strategy |
| Destination section | **Commercial posture / growth outcomes** |
| Purpose | Interpret commercial strength or watch state |
| User outcome | Align commercial focus with outcomes and decisions |
| Expected actions | Review commercial outcomes · Open related opportunity/decision |
| Return path | BrandMark → Today |

---

## 8.10 Cross-KPI rules

1. **Same icon** on Today KPI, destination header, and any related Priority.  
2. **No KPI lands on Today** (self-link forbidden except health display in header).  
3. **Section focus** is mandatory in the contract even before deep-link query params ship.  
4. **Confidence** travels as a concept — destination should show confidence near the same metric.  
5. **If destination empty**, show EXS empty state + guidance, never a blank page.

---

**Next:** [Executive Journeys](./09_EXECUTIVE_JOURNEYS.md)
