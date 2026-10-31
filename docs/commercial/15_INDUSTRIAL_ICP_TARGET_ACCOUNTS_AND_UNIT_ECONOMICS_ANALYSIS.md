# 15 — Industrial ICP, Target Accounts, and Unit Economics

**Status:** Recommendation. Not an approved commercial decision.  
**Date:** 1 November 2026 (Australia/Brisbane)  
**Owner of the recommendation:** this analysis. Founder approval is required before any price, ICP, or pilot term is treated as policy.  
**Does not change:** application code, Stripe plans, checkout, the marketing site, or any earlier document in `docs/commercial/` or `docs/business/`.  
**Model:** [`models/industrial_unit_economics.xlsx`](./models/industrial_unit_economics.xlsx). Yellow cells are inputs. Rebuild with `python3 docs/commercial/models/build_industrial_unit_economics.py`.  
**Prior audit:** [`../../EXECUTIVEOS_COMMERCIAL_AUDIT.md`](../../EXECUTIVEOS_COMMERCIAL_AUDIT.md). This paper starts from that audit. It does not re-inventory every file and it does not silently pick a winner among the old price books.

**How to read labels in this paper**

| Label | Meaning |
|-------|---------|
| **Existing decision** | Written as settled in a governing or commercial document, or enforced by code behaviour that is a product constraint. Existence in an old pricing file is not, by itself, a decision. |
| **Assumption** | A number or a causal claim this paper needs, and that the repository does not measure. |
| **Conflict** | Two current artefacts disagree. Left standing. |
| **Missing** | Required for a decision and absent. |
| **Recommendation** | What this paper proposes. |
| **Founder approval** | Must be accepted or rejected explicitly before anyone sells it or changes a price. |

---

## 1. Executive summary

The initial market should be industrial, and the initial product should stay inside what the repository can actually run: manufacturing forecast intelligence from a customer Excel or CSV file, refreshed on a weekly upload, with the executive deciding. Live ERP, inventory optimisation, dealer-allocation automation, and autonomous decisions are excluded by the design-partner documents and are not to be sold.

The old primary ICP — a mid-market SaaS or services executive office, a Chief of Staff assembling a brief, Microsoft 365 required, a budget of roughly $15–40k a year — is the wrong first customer for that wedge. It remains in `docs/business/IDEAL_CUSTOMER_PROFILE.md` and is still cited by the commercial go-to-market note. Treat it as a later, unproven segment, not as the opening motion.

**Recommendation.** The primary ICP is the Australian operating entity of a machinery or industrial OEM, or a factory-backed national equipment network, where demand is planned by model and region, parts or finished goods tie up material cash, and a planning lead can export forecast versus actual without an integration project. Mining operators, utilities, and general logistics are adjacent markets. They are not the first ten pursuits. Hitachi Construction Machinery Australia is the named first design-partner opportunity. It is not a customer, and no buying intent is recorded in the repository.

**Recommendation.** A founder-led company should hold a named universe of **30** accounts, pursue **10**, and offer a zero-fee design partner to at most **3**. Fifty names is a second-person problem. One hundred names is a list, not a pursuit.

**The margin target is achievable. It is not achievable at the prices on the website.**

Published vendor prices, read on 1 November 2026, put infrastructure and the current model (`gpt-4o-mini`) at well under AUD $100 a month for a customer who stays inside a normal advisory load. The manufacturing forecast path in the repository does not call a model at all. Gross margin is therefore not an API problem in the base case. It is a people-time and a price-floor problem.

At a full customer-success load (one fully loaded CSM at an **assumption** of AUD $180k a year covering 15 accounts, plus one paid support hour), delivery cost is about **AUD $1,100 a month**. An 85% delivery gross margin on that cost needs about **AUD $7,300 a month** before any annual concession. The website’s AUD $495 and AUD $1,995 packages do not clear it once a human is paid to deliver. The in-code production band of AUD $7,500 clears 85% only on the steady CSM ratio, and fails it if a second CSM is hired early or if the account is delivered as consulting.

**Recommendation, for approval, not as a price in force.**

| Term | Figure |
|------|--------|
| List, one operating entity | **AUD $9,500 per month** |
| Default commercial motion | Annual invoice, **11 months paid** (one month free) |
| Collected monthly equivalent | **AUD $8,708** |
| Included | Forecasting workspace, up to 8 executive users, weekly file refresh, 2,000 small-model completions a month |
| First three design partners | AUD $0 platform fee, 30 days, **15 founder hours cap**, case-study rights |
| Pilot after those three | **AUD $15,000** fixed, credited in full to year 1 if they convert within 30 days of the pilot ending |
| Second operating entity | **AUD $3,000 per month**, only when a second tenant is actually supported |

Under that collected rate, the workbook’s 36-month arithmetic — which is a scenario, not a forecast of demand — ends near **AUD $0.70M ARR** on the conservative logo path and about **AUD $1.24M ARR** on the base path. Cash operating profit over 36 months is largely a loss in the conservative case (about **AUD $0.55M**) and only modestly positive in the base case (about **AUD $0.18M**), because a founder salary and one engineer, as assumed, cost about **AUD $0.48M a year** whether or not logos arrive. The aggressive path reaches about **AUD $1.89M ARR** and is the only path with a clearly positive fully loaded result. It assumes a win rate and a cycle time that have never been observed. None of these paths reproduces the old `$5M ARR` or `$18k ACV` targets. Those targets belonged to a different price book.

The five decisions, five margin risks, and ten actions are at the end. Nothing in this paper should be implemented until those decisions are reviewed.

---

## 2. Existing commercial strategy assessment

The audit’s conclusion stands. There is a commercial library, a beta operating plan, a design-partner constraint set, and several price implementations. They are not one system.

### What is safe to treat as given

| Existing decision | Where it is written | What this paper does with it |
|-------------------|---------------------|------------------------------|
| Position line: the operating system for executive decision making. Category name in market: Executive Intelligence Platform. | Constitution, 20 July 2026; commercial positioning bible | Kept. The industrial offer is an application of that position, not a new category. |
| AI advises. The executive decides. No autonomous-company claim. | Constitution, product strategy, commercial roadmap, design-partner exclusions | Kept. It is also a cost control: background agents that act alone are out of scope. |
| The product sits above systems of record and does not replace ERP, MRP, APS, or CMMS. | Manufacturing forecasting contract; design-partner pilot model | Kept. It is the boundary of the offer. |
| Manufacturing forecasting from Excel/CSV is the implemented wedge. A live ERP is not required and is not in the pilot. | `docs/design-partner/PILOT_MODEL.md`; `src/data-gateway/contracts/manufacturing-forecasting.ts` | This is the product the ICP is built around. |
| Inventory, production capacity, dealer demand, and working-capital modules are not active. Do not imply they exist. | `docs/design-partner/EXPANSION_MODEL.md` | The Hitachi demo scripts describe those surfaces. **Conflict.** This paper follows the expansion model for what may be sold. |
| There is no Hitachi product and no hard-coded customer. | Design-partner readme; both Hitachi demo files | Hitachi is an account hypothesis, not a fork. |
| Security claims are limited to what is evidenced. SOC 2 and ISO 27001 must not be claimed. | `docs/design-partner/SECURITY_POSTURE.md` | Any buyer who requires a current SOC 2 report before a pilot is a disqualifier for now. |
| A live executive session has not been run. Timings and perceived value are not established. | Phase 70 scorecard, 23 August 2026 | No case study, NPS, or “hours saved” number is available to support willingness to pay. |
| Weekly file upload exists as a product path. | `src/verified-evidence/data-sources/`, commits through September 2026 | The offer may say “weekly refresh by upload.” It may not say “connected to your ERP.” |
| Default model in code is `gpt-4o-mini`, via the OpenAI SDK. Anthropic and Azure providers throw “not implemented.” No embeddings client exists. Forecasting analysis does not call the model. | `src/lib/ai/models.ts`, `src/lib/ai/provider.ts`, `manufacturing-analysis.ts` | Base-case AI cost is small, and it is optional relative to the wedge. |
| Founder-led selling, English-first, Australia / UK / US named as near-term geographies. Paid acquisition only after a large ARR threshold. | `docs/commercial/09_GTM_STRATEGY.md` | The motion is kept. The ICP inside that motion is not. |

### What is not a decision, however often it is repeated

| Artefact | What it says | Why it is not adopted here |
|----------|----------------|----------------------------|
| `docs/commercial/02_PRICING_AND_PACKAGING.md` and the website | AUD $495 / $1,995 / Enterprise custom, 30-day trial, no implementation fee | Declared current by the commercial readme. Fails the gross-margin test for this ICP once delivery time is real. Left in place. Not used as the industrial price. |
| `docs/business/PRICING.md` and `007_billing.sql` | USD $49 / $149 / $349 / $999 seat plans. Currency default `usd`. | Beta-era. The commercial readme says it is superseded for packaging. The database still contains it. |
| `src/commercial/pricing/catalog.ts` | AUD pilot $4,500, production $7,500, enterprise list $15,000, plus seats after five | Implemented, never adopted in a strategy document. Useful as a reference band. Not a price in force. |
| `src/growth/checkout/flow.ts` and subscription invoices | Plan names from the USD book, amounts 990 / 4,500 / 7,500 / 15,000, and a flat 7,500 invoice on paid activation | Code. Not a decision. |
| `src/operations/analytics/commercial.ts` | Internal MRR weights that do not match the catalog | An instrument. Not a price. |
| `docs/business/` revenue targets | $18k ACV, $25k MRR by month 6, $1M then $5M ARR | Built on the seat book and a 10-org SaaS beta. Not reused. |
| Design-studio prices ($349, $499) | Exploratory | Not prices. |
| “No implementation fee, ever” | Commercial library | **Conflict** with the business file’s $200/hour services line, and in tension with a margin target if “no fee” means unlimited founder hours. This paper caps hours instead of pretending time is free. |

### Conflicts this paper refuses to close

1. **Who the first customer is.** Business ICP and the beta slot plan say a Chief of Staff in B2B SaaS on Microsoft 365. The only operational pilot says a manufacturing forecast export. The Operations edition in code targets field service and Simpro. The founder instruction for this paper says industrial-first, manufacturing OEM first.
2. **How long a pilot is.** 14 days on a growth card, 30 days in the pilot model and the commercial trial, 8 weeks in the beta program.
3. **What a design partner pays.** Per-deal discretion in the commercial program note, a published 50–60% year-1 discount in the business pricing file, and a zero list price in the code catalog.
4. **Whether Manufacturing is a sellable profile.** The website says yes. The pilot model says the `manufacturing_executive` catalogue id is not implemented and the sample provision uses `operations_executive`.
5. **Category nickname.** Executive Intelligence Platform in the go-to-market files, DecisionOS in the long narrative. Irrelevant to the offer. Not resolved here.

**Missing, and still missing after this paper:** any paid invoice, any metered token log, any timed founder-hour log, any win/loss note, any approved security packet, any signed design-partner term.

---

## 3. Recommended industrial ICP

### Principle

Company size is a weak screen. A $5 billion miner whose decision is the mine plan is a worse first customer than a $400 million equipment business whose Monday argument is forecast versus factory versus parts cash, and who can hand over a spreadsheet. The screen is the intersection of **pain that the current module can see, money attached to being wrong, a file the customer already knows how to produce, an executive who will look at the result, and a price that can carry delivery.**

Every threshold below is a **hypothesis** until a design partner confirms or kills it.

### Primary ICP — hypothesis

The Australian operating company of a machinery, equipment, or industrial OEM, including a factory-backed national distribution arm of that OEM.

| Dimension | Hypothesis, not a measured fact |
|-----------|----------------------------------|
| What they sell | Discrete machines, models, and variants, plus a parts and rebuild stream. |
| Shape | More than one branch, warehouse, assembly or rebuild site, or a dealer/branch network. One site with one product and stable demand is out. |
| Revenue | Australian entity or relevant division above about **AUD $200 million**. Group revenue can be larger. The old **$50–500 million** band was written for a different ICP and a different currency argument. |
| People | Enough leadership to have a real demand, supply, and finance argument. A working hypothesis is **200+ people** in the Australian operation. A smaller, complex attachment manufacturer can still qualify on pain and data. A large headcount with no forecast file cannot. |
| Technology | An ERP or planning stack exists (often Dynamics, SAP, or a dealer system). The pilot does not connect to it. The buyer must be able to export forecast and actual by model, region or branch, and period. |
| Decision | Someone at executive level owns the quality of the forecast, the allocation of scarce supply, or the cash tied up in machines and parts. |
| Money | Being wrong moves inventory, overtime, dealer fill, or a build slot. The annual fee has to be small next to that, and large enough for us. Both tests are unproven in dollars until a buyer says so. |
| Buying | An Australian managing director or director can sponsor a 30-day file pilot without a global RFP. Global-mandate accounts are slower and are scored down, not banned. |
| Language | English. Australia first. UK and US entities of the same shape are the same ICP one founder-trip later, not a second motion now. |

**Existing decision this replaces for the opening motion:** the business ICP’s requirement that Microsoft 365 be deployed and that a Chief of Staff exist. Those were must-haves for a calendar-brief product. They are not must-haves for a forecast file. **Conflict** left on the page: the business ICP file still says M365 is required.

### Secondary ICP — hypothesis, not pursued in parallel

National industrial distributors and dealer groups with complex equipment and parts inventory (the large Caterpillar dealers are the public pattern). They can have the file and the cash problem. They do not own the factory slot. Expansion into factory decisions is weaker, so they are the second conversation, after the OEM motion has either a pilot or a clear refusal. Do not run both pursuits at full intensity with one founder.

Multi-site component and attachment manufacturers are in this bucket when they plan families of parts against mine and construction demand. They are often a better *data* fit and a weaker *budget* fit. Score them. Do not lead with them.

### Future ICP — do not pursue now

| Segment | Why it waits |
|---------|----------------|
| Mining and resources **operators** | The research note (8 August 2026) puts their executive priorities on safety, cost curve, capital allocation, and production guidance. That is not the forecasting module. |
| Utilities and infrastructure | Regulated asset and reliability decisions. No module. Procurement is heavy. SOC 2 expectations are likely and cannot be met honestly today. |
| Industrial logistics and 3PL | Real complexity. Wrong first file. |
| Field service on Simpro | A real product area in the codebase and the Operations edition target. It is a different wedge (jobs, capacity, technicians), not this pilot. |
| The original SaaS / professional-services executive office | A possible later use of the same platform. It is not evidence for the industrial price, and the $495 package trains the wrong reference price. |
| Other industries in `docs/research/industries/` | Research. The readme says no pack code follows from them. |

The long-term vision can stay horizontal. The first sales year cannot.

### Minimum requirements

All of these, or do not start a pilot:

1. A named executive sponsor who will attend the kickoff and the day-25 review.
2. A named operator who can produce the forecast file in **two weeks** without a new integration project.
3. Forecast quantity and model at minimum (`MANUFACTURING_FORECASTING_REQUIRED_HINTS`). Actuals, region or branch, and period are expected. If actuals do not exist, the pilot does not start.
4. Acceptance, in writing, that ERP connection, inventory optimisation, and automated allocation are out of this pilot.
5. English, and a working-hours overlap with Australia for the founder.
6. Willingness to discuss an annual subscription in the recommended band if the pilot evidence is real. A buyer who has only a $495 mental model is a mismatch, not a lead to be discounted into.

### Ideal characteristics

These raise priority. None of them is proof.

- Demand that moves by region and model, not one national average.
- A visible argument between sales fill, factory or supply constraint, and cash.
- A recent trigger from the list in section 6.
- The planning lead already lives in a weekly spreadsheet, so the upload replaces assembly rather than inventing a new process.
- The sponsor can say yes to a file leaving the building under a short confidentiality note, without a six-month security questionnaire. If they need a questionnaire, the honest security posture is handed over and the timeline is allowed to slip. Claims are not upgraded to win the deal.

### Disqualification

- No executive sponsor.
- On-premise-only, or a requirement to customise Core.
- “Connect SAP in the first 30 days” as a condition of value.
- A SOC 2 or ISO certificate as a condition of the first pilot.
- Stable, single-node demand with no material inventory or supply constraint.
- A request to add a plant manager, dealer principal, or customer-specific role to the Council. The existing decision is that the Council stays the five roles.
- Wanting a consulting team to build their planning process. That fails the margin test and the repeatability test.
- Mining operators, utilities, and pure logistics, until a module exists that matches their decision.
- Any account where we would have to invent pain, numbers, or a relationship in order to justify the meeting.

---

## 4. Industrial segment prioritisation

| Priority | Segment | Why this rank | Commercial shape | Main risk |
|----------|---------|----------------|------------------|-----------|
| 1 | Machinery and industrial OEMs with an Australian factory-backed network | Matches the forecasting contract (model, region, branch, period, forecast, actual) and the cash problem | Primary ICP | Global procurement can be slow. **Unknown** until the first three conversations. |
| 2 | Mining and construction equipment OEMs specifically | Public Australian entities exist, with parts warehouses and rebuild shops. Closest public pattern to the Hitachi materials | Primary ICP | The Hitachi demo over-describes the product. Discipline in the room matters more than the logo. |
| 3 | National equipment dealers and industrial distributors | Inventory and fill rate are real. Files are often already spreadsheets | Secondary. One or two in the active ten, not the whole ten | We do not have a dealer-allocation product. Do not sell one. |
| 4 | Multi-site component and attachment manufacturers | Good file fit, often shorter line of sight to the managing director | Secondary | Ability to pay the recommended price is a hypothesis, more fragile than for an OEM network. |
| 5 | Mining operators | Large ability to pay, high decision value | Future | Wrong decision for this module. Long procurement. Easy to flatter ourselves into a pilot we cannot serve. |
| 6 | Utilities and infrastructure | Named in the founder brief as a market to assess | Future | Regulated buying, asset-management decisions, certificate expectations. |
| 7 | General industrial supply chain and logistics | Real, crowded, and not this file | Future | Would pull the product into a TMS or WMS story. |

**Recommendation.** Spend founder selling time in rows 1 and 2. Keep two row-3 names warm. Do not open rows 5–7 this year.

---

## 5. Target account strategy

### Why 30, not 50 or 100

**Assumption, from the business sales playbook, not from a measured cycle:** an enterprise conversation takes 8–16 weeks when security and procurement join. A file pilot can be shorter. A global OEM can be longer.

One founder can keep about ten live conversations honest: preparation, the meeting, the follow-up, the file argument. A named universe of **30** gives room to replace a dead name without opening a research project every Monday. It is about two quarters of personal work if eight to ten are active and the rest are parked with a reason.

**50** is reasonable only when a second person can hold their own first meeting. **100** requires marketing operations and a CRM discipline the company does not have, and it lowers the quality of the claim we make about each name. The commercial go-to-market note already rejects spray. This is the same rule applied to account lists.

**Recommendation.**

| Layer | Size | Rule |
|-------|------|------|
| Named universe | 30 | Structural fit only. Reviewed monthly. Names leave when they fail a disqualifier. |
| Active pursuit | 10 | A date for a next action on each. |
| Design-partner slots | 3 | Zero platform fee. Then the paid pilot. |
| Everyone else | 0 | Not a campaign. |

### Ideal target account

A company already in the primary ICP, plus:

- The Australian entity publishes, or will admit, more than one location that holds machines, parts, assembly, or rebuild.
- We can name a public reason an executive might care this year (a trigger), without claiming we know their pain.
- The first meeting can be an Australian managing director, operations director, supply-chain director, or CFO. A meeting that can only be with a product specialist in another country is a later account.
- We do not need a new industry pack to tell the truth in the room.

### Stage A score — before any call

Score only what is public or already in our files. **Do not award points for pain, executive access, data readiness, or buying intent.** Those are unknown. A blank is a blank.

| Factor | 0 | 3 | 5 |
|--------|---|---|---|
| ICP shape | Utility, mine operator, or single-site job shop | Importer or dealer with a national parts footprint | OEM or factory-backed network with models, branches, and parts or assembly |
| Public evidence of Australian footprint | A legal entity only | Several branches or a published service network | Published warehouses, assembly, rebuild, or parts centres |
| Fit to the **current** file | Would need ERP or a new module to be interesting | Parts demand might fit; factory decisions do not | Forecast versus actual by model and place is a plausible export |
| Procurement drag | Global tool mandate is the likely path, or a certificate is likely to be required first | Ordinary enterprise buying | An Australian director can plausibly sponsor a file pilot |
| Ability to pay the recommended band | Unlikely on public scale | Plausible | The annual fee is small relative to a public parts and equipment operation |
| Expansion, later | None without a new product | A second region or branch | A second entity, then modules that do not exist yet — scored only as potential, never as a sale |
| Strategic distraction | Pulls us into a segment we have parked | Neutral | Sits in priority 1 or 2 |

Maximum stage A is 35. **Pursue at 24 or above**, with procurement drag not equal to zero. Two dealer names are allowed under 24 if they are the deliberate secondary test. Do not average in imaginary pain to lift a score.

### Stage B score — only after a conversation

Add, each 0–5, and do not backfill from the website: confirmed forecast pain in their words, inventory or cash exposure they quantify, executive access, a real trigger, data they can show, a plausible ACV, and the hours we would burn to win and serve them. **Expected acquisition cost is a stage B item.** It is unknown today.

A stage B total below 20 after a real meeting means stop, including if the logo is famous.

---

## 6. Buying committee and buying triggers

### Committee for this ICP

The business playbook’s champion is a Chief of Staff. That role is uncommon in these companies, and it is the wrong operator for a forecast file. **Conflict**, resolved here only as a recommendation.

| Seat | Who, in this ICP | What they need to believe |
|------|------------------|---------------------------|
| Economic buyer | Managing director or CEO of the Australian entity. Sometimes a regional president if the budget sits above the country. | The fee is a management decision, not a software experiment, and the pilot does not create an IT program. |
| Executive sponsor | The MD, or the director who owns supply and operations together. | They will open the brief and defend the time of their planning lead. |
| Operational champion | S&OP, demand planning, or supply-planning manager. | The file is theirs, the extra work is bounded, and the product will not embarrass them in front of the MD. |
| Economic influencer | CFO or finance director | Working-capital and forecast-quality language, with no invented savings. |
| Technical evaluator | CIO, head of IT, or the ERP owner | No credentials to source systems in the pilot. A short note on tenant separation and what the security posture will **not** claim. |
| Procurement and legal | Procurement, and privacy or legal if the file is sensitive | A short confidentiality arrangement and, later, an annual invoice. Not a six-month RFP for a 30-day file test. |
| Blockers | Global IT standardisation, a planning team that hears “replacement,” a dealer council, an incumbent IBP or APS owner | The offer is above the system of record. If they need replacement, we are the wrong vendor. |

### Recommended pair

**Sponsor:** managing director or director of operations / supply.  
**Champion:** the planning lead who owns the spreadsheet.  
**Influencer in the room for the value argument:** the CFO, even for thirty minutes.

A Chief of Staff, if one exists, can open the door. They are not the champion of this wedge. Selling only to the CFO fails when nobody can produce the file. Selling only to the planner fails when nobody can pay.

### Triggers

These are reasons a company of this shape **might** take a meeting. They are not observations about any named account.

Demand that has stopped matching the plan. Excess or obsolete machines or parts. Margin pressure on a model mix. A board or lender asking about working capital. A supply interruption. A new facility, warehouse, or assembly line. An ERP replacement that has made the weekly number worse, not better. A new managing director or operations director in the first year. An acquisition that left two planning files. A forecast the sales director and the planner will not both sign. Public or internal pressure on operational performance.

A trigger without a file and a sponsor is not a qualified account.

---

## 7. Hitachi and design-partner implications

### What the repository establishes

Hitachi Construction Machinery Australia is named as the audience of `docs/demos/HITACHI_EXECUTIVE_JOURNEY_PRESENTATION.md` and as the pattern for `docs/demos/HITACHI_MANUFACTURING_EXECUTIVE_DEMO.md`. Public listings identify the company as a supplier of Hitachi excavators and rigid dump trucks, with a Brisbane presence. That is public description, not our research inside the account.

The repository does **not** establish a relationship, a meeting that has happened, a data share, a sponsor, a price, or a buying intent. Phase 70 says a live executive session has not been conducted. Illustrative figures in the journey deck (a model movement, a dollar figure) are labelled there as scenarios. They must not be repeated as Hitachi facts.

### What the demo asks the product to do, and what the product allows

The demo walks factory health, dealer demand, inventory, production capacity, and working capital, and it offers a 30-day trial with no fee by pointing at the commercial library. The expansion model says those modules are not active. The pilot model excludes live ERP, inventory optimisation, and dealer-allocation automation.

**Recommendation.** If a Hitachi meeting happens, the room gets the forecasting pilot, not Act 4 through Act 6 of the demo script. The commercial close is the design-partner term in section 8, not “AUD $495, no implementation fee.” The security answer is the posture file. The ask is a file and a sponsor, not a purchase order in the first hour.

### The next ten names

Every row is **unverified**. No relationship. No confirmed pain. No intent. Stage B is blank. Stage A is a structural judgement from public pages read on 1 November 2026, and it will be wrong in places. The 2019 Komatsu brochure is stale and is marked that way.

| # | Name | Public basis | Segment | Stage A note | Do not assume |
|---|------|----------------|---------|--------------|----------------|
| 0 | Hitachi Construction Machinery Australia | Named in our demo docs. Publicly described as a Hitachi construction and mining equipment supplier, Brisbane. | Primary | The only name we have prepared materials for. Materials over-claim the product. | Any meeting, sponsor, or willingness |
| 1 | Komatsu Australia | Komatsu brochure “Total Customer Support,” November 2019: claims a factory-backed network, 42 branches in Australasia, assembly facilities, parts centres, about 1,900 employees. **2019. Stale.** | Primary | Highest public resemblance to a factory-backed network, on old figures. | That the 2019 counts are still true |
| 2 | Liebherr-Australia Pty Ltd | Company page: mining, earthmoving, and cranes; 17 branches across Australia and New Zealand; warehouses and remanufacturing described, including Adelaide-linked and regional mining branches. | Primary | Multi-site parts and rebuild footprint is published by the company. | Pain, access, or that remanufacturing volume is a forecast problem |
| 3 | Sandvik Mining and Rock Solutions, Australia | Industry listing (Mines & Quarries) describes underground and surface equipment, crushing, and Australian support. Parent is public. | Primary | Right industry shape. Australian operating detail is thinner in the sources used here. | A specific site list or a planning process |
| 4 | Epiroc, Australia | Same class of public listing. Drilling, rock excavation, Australian service. Parent is public. Perth associated in the listing. | Primary | Same caution as Sandvik. | Anything about their forecast file |
| 5 | FLS (FLSmidth) Australia | Company page lists several Australian mining service centres (Henderson, Welshpool, Mackay, Pinkenba, Beresfield) with parts stock, rebuild, and machining. | Primary, adjacent | Strong published footprint. More mineral-processing equipment than construction OEM. Confirm the file shape before a deep pursuit. | That crusher parts demand matches the machine-model template without a mapping workshop. A mapping workshop is allowed. A new product is not. |
| 6 | JCB Australia | Listed by CMEIG as an equipment manufacturer / importer member. | Primary only if local footprint is real | Stage A incomplete until a public branch and parts footprint is checked. | That an importer plans factory slots in Australia |
| 7 | CNH Industrial Australia | CMEIG member, same category. | Hold | Same incomplete stage A. Agricultural and construction mix may be a file advantage or a distraction. | A fit |
| 8 | Volvo Construction Equipment, Australian presence | CMEIG lists Volvo Construction Equipment. A separate listing describes CJD Equipment as a national distributor of Volvo construction equipment. | Do not merge these names | Treat the OEM arm and the distributor as different accounts. Distributor is secondary. | That the distributor can speak for the factory |
| 9 | WesTrac | Publicly described in the same machinery-dealer listings as a Caterpillar dealer. | Secondary | Useful test of whether a dealer file is enough. Not in the first three design-partner slots unless OEM access is blocked. | Ownership structure beyond the dealer relationship. Not checked here. |
| 10 | Hastings Deering | Listing: Caterpillar dealer for Queensland and the Northern Territory. | Secondary | Same role as WesTrac, different geography. One of these two is enough in the active ten. | Coverage beyond the listing |

**Recommendation.** Active ten: Hitachi, Komatsu, Liebherr, Sandvik, Epiroc, FLS, plus one of WesTrac or Hastings Deering, plus three names still to be taken from CMEIG’s OEM/importer list after the same public-footprint check. JCB and CNH stay in the universe of 30 until that check is done. They are not active by default.

The other twenty names in the universe of 30 should be filled by that check, not by inventing pain. A working allocation: 15 OEM or factory-backed networks, 8 national dealers or importers, 7 component manufacturers still to be identified from public filings. If a name cannot be described from a public source in four lines, it does not go on the list.

---

## 8. Initial commercial offer

### What the pilot is

A **30-day manufacturing forecasting pilot** for one operating entity. One file shape. One executive brief. Repeatable.

**Customer provides**

- A forecast-versus-actual extract covering at least model and forecast quantity, and in practice period, actual quantity, and region, branch, or dealer if those are how they plan. Optional columns (capacity, inventory, order bank) may be present. The contract says missing fields stay “not established.” They are not filled in by us.
- A weekly refresh using the upload path that already exists. We do not log into their ERP.
- The sponsor and the champion, as defined above.
- Someone who can explain a row that looks wrong. That is their analyst, for a bounded number of hours, not a Braltiq team living in the file.

**We provide**

- The template and the mapping, once, aiming to reuse the mapping the second week.
- An executive snapshot and the manufacturing forecast intelligence the current analysis code produces: demand movement, forecast accuracy, regional or model divergence, data quality, and a judgement posture. Where the code emits a capacity or inventory *implication* from a column they chose to include, it can be shown as an implication. It is not a promise that the inventory module, the capacity module, or the dealer module is active.
- A day-25 review against the success criteria below.
- Founder time inside the cap.

**Excluded, in writing, on the first page**

Live ERP, Dynamics, SAP, or dealer-system connection. MRP, APS, CMMS, and factory scheduling. Inventory optimisation. Dealer-allocation automation. Autonomous decisions. A custom Council seat. A Hitachi-specific or customer-specific fork. Any module the expansion model marks not active. Any security certification we do not hold. Unlimited analyst time.

### Success criteria

Agree these before the file arrives. Do not grade the pilot on a feeling.

| Criterion | Pass | Why this bar |
|-----------|------|----------------|
| File | A usable snapshot in the first ten days, with gaps stated rather than filled | Tests data readiness, which is the ICP screen |
| Executive use | The sponsor opens the brief on at least four different days in the 30 | Taken from the existing adoption definition. Still a hypothesis that this customer will do it |
| Decision | At least one decision framed from the snapshot, with the evidence visible, and the human choosing | The product’s job. Not a forecast-accuracy improvement. Thirty days is too short to claim that |
| Honesty | The customer can point to one variance or gap they did not have in one place, and to one thing the product could not see | Protects us from over-claiming |
| Return | “Would you start the next planning cycle here?” recorded as yes or no | The design-partner metric. Empty until they say it |
| Effort | Founder hours ≤ the cap. Customer preparation hours recorded, not estimated afterwards | The margin guardrail |

A failed criterion ends the pilot. A two-week extension is a founder decision, once, and it is not a second free pilot.

### Conversion

1. Day 25: evidence against the table above. No new demo.
2. If the criteria passed: offer the annual subscription at the approved list. If the pilot was one of the three zero-fee design partners, the offer is the list price, not a permanent discount. Case-study rights were the consideration.
3. If the pilot was the paid pilot, the fee is credited to year 1 only when they sign within 30 days of the review. It is a deposit against the subscription, not a discount that remains in the renewal.
4. If the criteria failed: stop. Do not invent a cheaper package to save the logo.

### Subscription and expansion

The ongoing product is the same workspace, weekly, for the included users and the included model allowance. Expansion that is honest today:

- More of the same entity’s executives, inside the allowance, then a stated user step if we ever meter it. Seats are not the product.
- A second operating entity at the second-entity price, when the product can isolate it. The design-partner work has been explicit about tenant separation. Do not sell the second entity on a handshake if isolation is not demonstrated for that customer.
- A higher refresh only if the cost model is re-run. Weekly is the design.

Expansion that waits for a product decision, and is **not** in the contract as a commitment: inventory, capacity, dealer allocation, live ERP, other industries. The commercial roadmap may talk about packs. The customer document for this offer should not.

This is how a forecasting pilot becomes an enterprise subscription without a consulting practice: the subscription is the right to keep the brief running on a standard file, and the enterprise step is another entity plus contractual care, not a new build.

---

## 9. SaaS cost structure

### What was actually inspected

The application is Next.js on a Vercel-shaped deployment, Supabase for auth and Postgres, Stripe in the billing schema, OpenAI as the only implemented model provider. `package.json` does not include a second observability vendor, an embeddings SDK, or a payments provider besides Stripe. Logging in the beta readiness note is stdout. There is no invoice in the repository, so every dollar below is a **list price or a hypothesis**, not our bill.

### Direct cost of revenue

| Cost | What the repo and the vendors show | Treatment |
|------|--------------------------------------|-----------|
| Vercel | Pro platform fee **USD $20 / month**, including a **USD $20** usage credit. Sydney active CPU **USD $0.180 / hour** and provisioned memory **USD $0.0149 / GB-hour** (Vercel function pricing, read 1 November 2026). | The **USD $20** is in the model as a company fixed cost. CPU and memory are **not** modelled per customer because there is no production trace. **Missing.** |
| Supabase | Pro **USD $25 / month**, **USD $10** compute credit, Micro **USD $10**, Small **USD $15**, Medium **USD $60**, Large **USD $110**. Disk **8 GB** included then **USD $0.125 / GB**. Storage **100 GB** included then about **USD $0.021 / GB**. Egress **250 GB** included. Backups **7 days** on Pro. Log drains **USD $60** each, not assumed. | Fixed platform plus a **hypothesis** of when compute steps up: Micro under 11 customers, Small from 11, Medium from 25, Large from 50. Those thresholds are not measured. |
| File storage and forecast compute | Excel or CSV, weekly, structured rows. The forecast math is in-process and deterministic. | Negligible next to a CSM until files become huge. **Missing:** a measured megabyte per snapshot. |
| Model inference | `gpt-4o-mini` at **USD $0.15 / $0.60 per 1M** input/output tokens (OpenAI pricing page, read 1 November 2026). Cached input **USD $0.075**. The model is **deprecated**, with API removal scheduled **14 January 2027**. The deprecation note names `gpt-6-luna` as the replacement, listed at **USD $0.10 / $0.50** per 1M on short context. | Base case uses mini prices and a **hypothesis** of 280 completions, 4,000 input tokens, 500 output tokens. That is about **AUD $0.36 per customer per month** at the RBA rate below. |
| Embeddings, retrieval, knowledge-graph model calls | No embeddings client in the repository. Agent “retrieval” in the current orchestrator is not a separate paid API in the code paths inspected. | **AUD $0** until a design adds them. If they are added without a cap, re-run the model before shipping. |
| Domain advisors and Council | Each agent reason and recommend call hits the same small model. A multi-agent consultation is several completions, which is already the basis of the 280 hypothesis. | Included in the completion count. Not a second bill. |
| Forecasting workload | No model call. | Included in Vercel CPU, which is unmeasured and, at this shape, should stay inside the Pro credit until customer count or refresh frequency changes. **Assumption.** |
| Monitoring | Not a paid dependency in `package.json`. | **Missing.** A later Datadog, Sentry, or status-page bill is opex or COGS depending on contract. Not invented here. |
| Payments | Stripe Australia domestic online cards **1.65% + A$0.30**, GST included (Stripe Australia pricing, read 1 November 2026). | Model default is **annual invoice, card share 0**. Card cost is a sensitivity, not the base. A Stripe Invoicing percentage was not confirmed and is an input left at zero. **Missing** if invoicing fees apply. |
| Onboarding, support, success | Not in any bill. Entirely time. | See section 10. This is the cost that decides the price. |
| Partner commission, referral fees, third-party royalties | None in the initial motion. | Input `commission_rate` is 0. |

**FX assumption:** RBA, 30 October 2026, **0.7040 US dollars per Australian dollar**, so **AUD 1.4205 per USD**. It is a conversion for a model, not a hedge.

### What is not cost of revenue

Founder **selling** time, travel, events, engineering salaries, G&A, and a future AE are overhead or acquisition cost. They sit in the 36-month sheet and in payback. They are not gross margin. Mixing them into gross margin would make the 80–85% target describe the whole company, which is an operating-margin target and a different conversation.

Two delivery definitions are shown on purpose:

- **Cash delivery margin** — vendor bills, card fees, and paid support or CSM wages.
- **Fully loaded delivery margin** — cash delivery plus founder hours at **AUD $250 an hour** opportunity cost.

The target is applied to both. A plan that hits 85% only because the founder’s week is priced at zero will break the month a CSM is hired, unless founder delivery on live accounts actually stops.

---

## 10. Customer-level unit economics

Default inputs are in the workbook. Figures below are that default, rounded. Change the yellow cells rather than editing these sentences.

**Base AI hypothesis (not measured):** 40 consultations a month, three agents, two model calls each plus a synthesis when more than one agent speaks, 4,000 input tokens, 500 output tokens. The code caps those calls at 600–700 output tokens and 1,200 for the chief-of-staff path. 500 is a midpoint.

**Stress hypothesis (not measured):** 4,400 completions, 20,000 input tokens, 1,000 output tokens, priced at **gpt-4o** list (**USD $2.50 / $10 per 1M**), i.e. someone routes the same product onto a frontier model and turns usage up. About **AUD $375 per customer per month**.

**People hypothesis:** founder opportunity **AUD $250 / hour**; 4 steady hours a month per account before a CSM; 12 onboarding hours; 1 support hour at **AUD $90** once that hour is paid for; CSM **AUD $180,000** fully loaded; 15 accounts per CSM; do not hire before 15 accounts.

### One customer, founder-delivered, whole platform on that one logo

Collected-rate illustration at the recommended annual equivalent is in the forecast. The price comparison uses **list**.

| | AUD $495 | AUD $1,995 | AUD $4,500 | AUD $7,500 | **AUD $9,500 list** | AUD $15,000 |
|--|----------|------------|------------|------------|---------------------|-------------|
| Cash delivery margin, this shape | About 69% if the support hour is paid; higher if that hour is the founder and `support_rate` is set to 0 | Above 90% cash | Above 90% cash | Above 90% cash | About **98%** cash | Above 90% cash |
| Fully loaded, with 4 founder hours | **Negative** | About **42%** | About **74%** | About **85%** | About **88%** | About **92%** |

Infrastructure on one customer is about **AUD $64** a month. It is not the reason $495 fails. Four founder hours at $250 are **AUD $1,000**, which is already twice the Individual price.

### Mature shape, 25 customers

The workbook charges **two** CSMs at 25 customers because 25 / 15 rounds up. That is idle capacity, not a law. A full ratio costs **AUD $1,000** per customer per month of CSM (180,000 / 12 / 15). The awkward row costs **AUD $1,200**.

| Price | Cash margin, awkward two-CSM row | Cash margin at a full 1:15 CSM load |
|-------|----------------------------------|--------------------------------------|
| AUD $495 | Negative | Negative |
| AUD $1,995 | About 35% | About 45% |
| AUD $4,500 | About 71% | About 76% |
| AUD $7,500 | About 83% | About 85% |
| **AUD $9,500** | About **86%** | About **88%** |
| Collected equivalent AUD $8,708 | About **85%** | About **87%** |
| AUD $15,000 | About 91% | About 93% |

First-year margin at the **$9,500 list**, charging onboarding once at 12 × $250 and the awkward CSM run-rate, is about **84%** (114,000 − 12 × 1,296 − 3,000). At the collected annual rate of about **$8,708** the same test is about **82%**. Both still depend on onboarding staying at 12 hours. Thirty hours of bespoke work per logo, at the same opportunity rate, adds another $4,500 and pushes the collected first-year result under 80%.

### Scale at the collected rate (AUD $8,708)

Fixed infrastructure stays in tens or low hundreds of Australian dollars a month across the company under the compute hypothesis. AI in the base case stays in single dollars per customer. From 15 customers upward the CSM line is the cost of revenue. Cash delivery margin stays around **85%** if the hour caps hold, and it falls through 80% if support becomes a standing half-day per account per month (see Sensitivity).

| Customers | What changes | Cash delivery margin, this hypothesis |
|-----------|----------------|----------------------------------------|
| 1 | Full platform, no CSM, founder time is the loaded cost | Cash above 95%. Fully loaded about 87% at the collected rate. |
| 5 | Same shape, founder hours start to compete with selling | Cash still very high. Fully loaded still inside the band if the 4-hour cap is real. |
| 10 | Still no CSM. About 40 founder hours a month of delivery. | A capacity problem, not a vendor-bill problem. |
| 25 | CSM hired. Second CSM appears only because of rounding. | About 85% cash at the collected rate on the awkward row. |
| 50 and 100 | CSM scales. Large compute is assumed and is **unproven**. The model does not add Vercel Enterprise or a second region. | Margin holds only if those bills stay small and the CSM ratio holds. **Missing** at this scale. |

**Onboarding** is not in the monthly margin. It is in the first-year margin and in the forecast, once per new logo.

**Contribution margin** after acquisition is section 13. **Operating profit** is section 14. They are not gross margin.

---

## 11. The 80–85% gross margin strategy

The target is a constraint on who we sell to and how the product is allowed to run, not a hope that a price will cover an uncapped service.

**What has to be true**

1. The collected price stays at or above the annual equivalent of the recommended list. A slide back to $1,995 or $495 makes the target impossible as soon as delivery is staffed.
2. Steady-state founder hours on a live account go to **zero** when a CSM is paid. Otherwise we pay twice.
3. Onboarding stays inside **12 hours**, on a standard file. The second customer of the same file shape should take less, not more.
4. Completions stay on a small model, inside **2,000 a month** included. Overage is priced at a multiple of vendor cost (the input is **4×**), so heavy use raises margin.
5. The forecast stays deterministic. Narrating it with a frontier model on every refresh is a product decision with a cost, and it is off until the workbook is re-run.
6. Refresh stays weekly. Continuous recompute of advisory chains is not the offer.
7. We do not staff a CSM before **15** paying accounts, and we do not staff the next CSM while the current one is half empty if that idle seat is what breaks 85%.
8. Card fees stay off the base case by invoicing annually. Monthly card at 1.65% is affordable at this price and is still a choice, not an accident.
9. No customer-specific build. A request for one is a disqualifier, not a change request we absorb.

**Where the target is comfortable.** Vendor COGS alone, at the current architecture and the base token hypothesis, are consistent with a margin well above 95%. The target is not won in the API console.

**Where it is thin.** The collected price against a hastily hired second CSM, plus a paid support hour, plus a one-month annual concession, is about **85%**, not 90%. There is not a large cushion for bespoke work or for a frontier model at high volume. That is acceptable if the guardrails are enforced, and it is fatal if they are slogans.

The in-code **AUD $7,500** production figure can clear 85% on a tidy CSM ratio and fails the awkward row. It is not recommended as the industrial list, because the annual concession and the idle-CSM case both need a little air. It remains a useful external reference, not an approved price.

---

## 12. Pricing and packaging recommendations

These require **founder approval**. They do not override `02_PRICING_AND_PACKAGING.md` until that approval is written down. Until then the website and this paper disagree, and the disagreement should stay visible.

### Why not the existing books

| Book | Verdict against this ICP and this cost |
|------|------------------------------------------|
| AUD $495 / $1,995, unlimited in spirit, “no implementation fee” | Reference price of a productivity seat. Fully loaded margin fails. Also teaches procurement to expect a card trial. |
| USD seat plans and AI allowances up to 100,000 requests | The allowance, on a frontier model, is large enough to consume a small subscription. The price is the wrong altitude. |
| AUD $4,500 pilot as a production rent | About 71–76% at a staffed CSM ratio. A pilot fee can be a one-off. A permanent rent at this level does not hold 85% once people are paid. |
| AUD $7,500 production band in code | The closest existing number. Short of the recommended list once annual concession and CSM rounding are included. |
| AUD $15,000 enterprise list in code | Clears the margin easily. Too blunt as the only SKU for a first Australian entity, and it is a list price the commercial library said enterprise would not publish. Leave enterprise as a floor for multi-entity and heavy procurement, not as the opening quote. |

### Recommended structure

**Platform subscription per operating entity**, not per seat and not per integration.

The value metric is the right to run the forecasting brief for one operating company. Users and model calls are **allowances** that stop the cost leaking, not the thing the customer thinks they bought.

| Element | Recommendation |
|---------|----------------|
| List | AUD $9,500 per month per operating entity |
| Term | Annual invoice, 11 months paid, as the default. Monthly is available and is not discounted. |
| Included users | 8 executives. More users are an allowance increase, not a reason to reopen the value story. |
| Included model use | 2,000 completions a month on the small-model route. |
| Overage | 4× the vendor cost of the extra completions, or a hard stop, at the customer’s election in the order. Never silent overage. |
| Second entity | AUD $3,000 per month, annualised the same way, only when isolation is real. |
| Enterprise | Multi-entity, invoice, security review, a named support response. Floor at the **AUD $15,000** a month already sitting in code, until a real security cost is known. Do not add residency or SSO as if they were shipped. |
| Design partner 1–3 | AUD $0, 30 days, 15-hour cap, written success criteria, case rights. Not a standing discount. |
| Paid pilot thereafter | AUD $15,000, credited to year 1 on timely conversion. |
| What we will not do | A permanent “founding customer” lock. A per-seat grid. A free tier. An implementation fee that is secretly unlimited hours. Metering that the customer cannot see. |

**Value argument, still a hypothesis.** The fee should be justified against one avoided mismatch of supply and demand, or against the cost of the planning cycle, in the customer’s numbers. We do not have those numbers. The day-25 review is where they are either produced by the customer or the value claim stays unmade. Do not borrow the business playbook’s “20× ROI” line. It was calculated on a $149 plan.

**Competitive position.** Copilot and ChatGPT remain the wrong price comparison, which the commercial library already says. The buyers who matter will compare us to an IBP project, a planner’s week, and doing nothing. We do not have a sourced price for Kinaxis, o9, SAP IBP, or a Big Four planning engagement. **Missing.** Do not invent one in a proposal.

### Packaging shape

One module now: Manufacturing Forecasting. The platform fee includes it. Additional intelligence modules are the right long-term package, and they are how we avoid stuffing every future cost into one unlimited subscription. They are not for sale until the expansion-model stop is lifted and the cost of the module is in this workbook.

Fair use is the included completions, the weekly refresh, the user allowance, and the hour cap. That is enough control for this architecture. A data-volume meter can wait until a snapshot is larger than the Supabase allowances, which a weekly planning file should not be.

---

## 13. Customer acquisition economics

### Motion

Founder-led, named accounts, no paid media, no partner commission, no event circuit in the base case. That matches the commercial go-to-market note and the margin constraint. A design partner is a learning contract with a cap, not a channel.

Industry partnerships, dealer associations, and technology alliances are **later**. They add commission (`commission_rate`) and a second story we would not control. Leave the input at zero until a specific partner has a reason and a number.

### Cost to win one logo — hypothesis

| Input | Figure | Status |
|-------|--------|--------|
| Hours on one opportunity | 15 | Assumption |
| Opportunities per win | 5 (a 20% win rate) | **Not observed** |
| Founder opportunity rate | AUD $250 / hour | Assumption |
| Cash outlay per win | AUD $2,500 travel and a contract read | Assumption |
| Fully loaded cost per win | 75 hours × $250 + $2,500 = **AUD $21,250** | Arithmetic |
| Cash CAC | **AUD $2,500** | Arithmetic, and it ignores every lost pursuit |

Lost pursuits do not show up in cash CAC. They show up as founder weeks. That is why a cheap CAC and a tired founder can be the same fact.

### Payback and LTV

Using mature cash gross profit at the collected price and the awkward CSM cost (about **AUD $7,400 a month** of cash gross profit):

| Case | Cash payback | Fully loaded payback | LTV : fully loaded CAC |
|------|----------------|----------------------|------------------------|
| 20% win, 10% annual logo churn | Under 1 month | About 3 months | Very high |
| 10% win, 10% churn | Under 1 month | About 5–6 months | Still high |
| 10% win, 25% churn | Under 1 month | About 6 months | Lower, still above 3× if gross profit holds |
| 10% win, 40% churn | Under 1 month | Still a few months | The ratio stops being a reason to feel safe |

The exact cells are on the Sensitivity sheet. **Do not quote the healthy ratio outside the building.** It is what happens when cash CAC is a plane ticket, gross margin is high, and churn is a guess. A 40% churn and a 10% win rate is a plausible early-enterprise outcome. The model still “works” on payback and still fails as a company if logos arrive too slowly to cover the engineer and the founder salary. That failure mode is section 14, not the LTV slide.

**Free design partner opportunity cost:** 15 × $250 = **AUD $3,750** each, **AUD $11,250** for the cap of three. If none converts, that is the research spend. If one converts at the annual fee, it is cheap. The cap exists so the research spend cannot become the delivery model.

---

## 14. 36-month financial scenarios

**These are not forecasts of demand.** They are three logo paths typed into yellow cells, run through the cost structure, so the founder can see what the company looks like if selling is slow, ordinary, or fast. No path assumes Hitachi specifically. No path uses the old $18k ACV.

**Overhead hypothesis, every month, all scenarios:** founder cash salary AUD $180,000, one engineer AUD $220,000 fully loaded, G&A AUD $60,000, sales cash (travel and tools, no media) AUD $24,000. Together about **AUD $40,300 a month**. The aggressive path adds an AE at AUD $180,000 from month 18. None of these salaries is in the repository. **Founder approval.**

**Churn hypothesis:** conservative 15% of logos a year, base 10%, aggressive 8%. Unobserved.

**Expansion hypothesis:** none in the conservative case. From month 13, 10% of base logos and 15% of aggressive logos carry a second entity at AUD $3,000. That is a guess about product readiness as much as about customers.

**New logos typed into the sheet**

| Path | Pattern | New logos over 36 months |
|------|---------|--------------------------|
| Conservative | First logo in month 9, then a slow drip | 8 |
| Base | First in month 6, then roughly one a quarter and a little faster later | 13 |
| Aggressive | Five in year 1, then a steadier founder-plus-AE pace | 19 |

Churn means ending logos are lower than new logos.

### Result at the default inputs

| | Conservative | Base | Aggressive |
|--|--------------|------|------------|
| Ending logos, month 36 | About 6.7 | About 11.5 | About 17.2 |
| Ending ARR | About **AUD $0.70M** | About **AUD $1.24M** | About **AUD $1.89M** |
| Cumulative cash operating profit, 36 months | About **−AUD $0.55M** | About **+AUD $0.18M** | About **+AUD $0.67M** |
| Cumulative fully loaded operating profit | About **−AUD $0.68M** | About **−AUD $0.04M** | About **+AUD $0.39M** |
| CSM hired inside the path? | No | No | Only near the end |
| Gross margin | Inside the band when a logo exists, because the price is high and the hours are capped | Same | Same, until an AE’s salary, which is overhead, not COGS |

Read that table as a warning, not as a plan to “go aggressive.”

The conservative path loses money for three years because the salary cost runs from month 1 and the first cheque arrives in month 9. The base path is roughly cash break-even across the whole period and still slightly negative once founder delivery time is priced. The aggressive path is the first one that pays the founder back for delivery hours, and it requires a win rate the company has not earned, plus an AE.

**What “good” looks like, without pretending.** Six to eight paying entities, on annual invoices, with onboarding inside the cap, is a real business under this cost structure: cash operating profit turns once monthly collected revenue clears about **AUD $40k** plus a thin COGS line, which is about **five or six** logos at the collected price, **before** a CSM. The fifteenth logo is what justifies the CSM. An AE before that is how the aggressive path could become the conservative path with a higher salary.

### Sensitivity that matters

| Move | Effect |
|------|--------|
| AI completions ×5 on the small model | Still noise at this price. |
| Same stress volume on gpt-4o prices | About AUD $375 per customer. Margin remains acceptable at $9,500 and becomes uncomfortable if many customers live there. A 100,000-request allowance on that model does not. |
| Support at 4–8 hours a month, paid | This is the lever that pushes mature margin under 80%. |
| CSM cost +50% | Noticeable, still survivable at the recommended list, not at $4,500. |
| Price at the Team list or the $4,500 band | The target fails once staffed. |
| Win rate halved, churn at 25–40% | Payback in months still looks short. Company cash does not, because logos are late. |
| Sales cycle 8–16 weeks | Already baked into “first logo in month 6 or 9.” A 9-month cycle is the conservative column. |
| Onboarding at 30 hours | First-year margin leaves the band. |

---

## 15. Commercial risks and margin protection

### Risks to the company

1. **Selling the Hitachi script.** We would be taking a pilot we cannot run, or building a bespoke one that destroys the margin.
2. **Adopting the website price** because it is the only price a document calls “agreed.” It is agreed inside a conflict, and it does not fund this ICP.
3. **A free-forever design partner.** Three capped pilots are research. An uncapped one is a services firm.
4. **Hiring ahead of logos.** An AE, a marketer, and a CSM in year 1 turn the base case into the conservative case.
5. **No measurement.** Without completion counts, snapshot sizes, and founder hours, the workbook stays a hypothesis and will be believed anyway.
6. **Global procurement on logo one.** A famous OEM that needs a certificate and a two-year MSA before a file test will consume the founder and produce no gross profit.
7. **Churn from a pilot that was a workshop.** If the weekly file is our job rather than theirs, they leave when we get tired, and the gross margin was never real.
8. **The January 2027 model removal.** `gpt-4o-mini` is scheduled to leave the API on 14 January 2027. A careless jump to a frontier model is a margin event. A planned jump to the cited small replacement (`gpt-6-luna` at the published short-context rates) is not, on today’s price list. Confirm the bill on the day. Do not rely on this sentence in 2027 without looking.

### Controls

| Control | Rule |
|---------|------|
| Model route | Small model for advisory calls. A larger model requires a workbook update and a separate included allowance. |
| Cache | Cache repeated system context. OpenAI’s cached-input price is half of mini input. Do not pay to resend the same policy every call. |
| Agents | Do not run the full advisor set on a refresh. Run them when an executive asks, or on a weekly schedule, not on a loop. |
| Forecast | Keep it deterministic. |
| Refresh | Weekly, customer-driven upload. |
| Meter | Completions, tokens, storage, and founder hours per tenant before the first paid invoice. |
| Alerts | At 70% of the included completions, tell the customer and ourselves. |
| Rate limit | The code already contemplates per-plan limits. The industrial plan needs a ceiling that matches the 2,000 inclusion, not the old 100,000 enterprise flag. |
| Retention | The posture file says retention is not configured. Set a retention period before a customer file lands, and do not promise a deletion SLA we have not built. |
| Onboarding | One template, one mapping record, a written hour cap. |
| Integrations | None in the pilot. A reusable connector is a later product, built once, or it is not a connector. |
| Support | A short written answer first. Live time is the metered hour. |
| Custom development | Decline. |
| Price | No silent discount. Annual concession is the one published concession. |
| Architecture that would break this | Per-customer always-on agents, per-refresh frontier narration, a dedicated Supabase project per logo “for comfort,” unlimited file history, and a services team hiding inside “white glove.” |

Customer-level cost attribution does not exist today. **Missing.** It is a precondition of believing the margin, not a reporting nicety.

---

## 16. Recommended decisions

For the founder. Each one is a yes, a no, or a number. This paper’s preference is stated. It is not in force.

| # | Decision | Recommendation | If you say no |
|---|----------|----------------|---------------|
| 1 | The first selling motion is the industrial forecasting ICP in section 3, not the SaaS Chief-of-Staff ICP. | Yes | Keep the old ICP and do not use this price. The two do not mix. |
| 2 | List AUD $9,500 per month, 11 months on annual invoice, second entity AUD $3,000, enterprise floor AUD $15,000, paid pilot AUD $15,000 after three free capped design partners. | Yes, as a hypothesis to test in market, not as a forever price | Pick another number in the workbook and read the margin row before it is quoted. |
| 3 | The first offer excludes every module the expansion model marks inactive, whatever the Hitachi script shows. | Yes | Do not take the Hitachi meeting. |
| 4 | Gross margin means delivery margin, reported both cash and fully loaded. Target 80–85% on both once a CSM exists, and on fully loaded founder time before that. Hour caps are part of the offer. | Yes | The target will be “hit” by ignoring founder time and then missed in the hiring month. |
| 5 | Named universe 30, active 10, design-partner cap 3. No paid acquisition. No AE until at least the conditions in section 14. | Yes | A larger list or an early hire needs a different overhead line in the forecast, written down first. |
| 6 | Hitachi may be approached only on the pilot term in section 8. | Yes | Leave the account parked. |
| 7 | Do not change Stripe, the website, or `02_PRICING_AND_PACKAGING.md` until decision 2 is accepted. | Yes | The conflict remains public, which is safer than a half-edit. |

---

## 17. Prioritised next steps

These are actions for after review, not work this paper has done.

1. Founder reads the yellow cells and either accepts the salary, hour, and price hypotheses or replaces them and looks at the margin again.
2. Decide the Hitachi term before any further meeting is booked.
3. One-page pilot order, taken from section 8 and the pilot-model exclusions, including the success table and the hour cap.
4. Finish the universe of 30 from public sources only. Stage A scores. No pain filled in from imagination.
5. Freeze the file template to the forecasting contract’s required and expected fields, so onboarding hour 1 is not a workshop.
6. Meter completions, tokens, and storage per organisation. This is product work. It is the missing measurement, and it should exist before the first paid invoice.
7. Log founder hours per account, selling and delivery separate.
8. Leave checkout and the marketing prices untouched until decision 2 is written into the commercial library on purpose.
9. After three real conversations, rewrite stage B and kill the ICP thresholds that were wrong. Do not wait for a perfect pilot to fix a bad screen.
10. Only then consider a second person, a CSM, or a change to the website.

---

## The five commercial decisions that matter most

1. **Industrial forecasting is the first motion**, and the Chief-of-Staff SaaS ICP is not the account we are built to serve first.
2. **The price is an annual platform fee in the band that clears 85% after a CSM**, recommended here as AUD $9,500 list and 11 months paid, and it is not approved until you say so.
3. **We will not sell the inactive modules** or a Hitachi-specific product.
4. **Delivery hours are capped and metered**, and gross margin is reported with founder time visible.
5. **Thirty names, ten pursuits, three free pilots**, and no sales hire until the overhead is covered by logos rather than by optimism.

## The five biggest risks to 80–85% gross margin

1. **Uncapped founder or consultant hours** dressed up as white-glove onboarding.
2. **Quoting AUD $495 or $1,995** (or the USD seat grid) to an industrial buyer.
3. **Unmetered or frontier-model use**, including a careless migration when `gpt-4o-mini` is removed from the API on 14 January 2027, and including the old 100,000-request enterprise allowance.
4. **Bespoke work per logo**, especially rebuilding the Hitachi demo as if it were the product.
5. **Hiring a CSM or an AE into an empty ratio**, and any architecture that runs agents continuously or gives each customer a dedicated stack “just in case.”

## The first ten practical actions

1. Review and mark up the yellow cells in the workbook.
2. Accept or replace the seven decisions in section 16, in writing.
3. Write the one-page pilot order from section 8.
4. Decide the Hitachi approach before outreach.
5. Complete the list of 30 from public footprints. Score stage A only.
6. Prepare the forecast file template from the existing field contract.
7. Add per-tenant meters for model calls, storage, and hours before any invoice.
8. Set a retention statement that matches the security posture, before a customer file is stored.
9. Do not edit the live price, the website, or the old strategy documents until decision 2 is approved.
10. After three discovery meetings, correct the ICP thresholds that the meetings disproved.

## Documents to update or retire later

Not in this change. When the decisions above are approved:

| Document | Later action |
|----------|----------------|
| `docs/commercial/02_PRICING_AND_PACKAGING.md` | Replace or clearly demote the $495 / $1,995 grid for the industrial motion. Until then it still claims to be the list. |
| `docs/commercial/README.md` | Point at this paper as a recommendation, not as the canonical price, unless decision 2 is accepted. |
| `docs/commercial/05_SALES_PLAYBOOK.md`, `08_DESIGN_PARTNER_PROGRAM.md`, `09_GTM_STRATEGY.md` | Replace the CoS-first ICP, the 8-week beta economics, and “Team as the default SKU” for the industrial motion. |
| `docs/commercial/06_DEMO_PLAYBOOK.md` and `docs/demos/HITACHI_*.md` | Cut any talk track that demonstrates inactive modules or quotes the website price. |
| `docs/business/*` | Mark the set historical. It still reads as the operating plan, including USD prices, $18k ACV, and SOC 2 as a GA success criterion. |
| `supabase/migrations/007_billing.sql`, `src/commercial/pricing/catalog.ts`, `src/growth/checkout/flow.ts`, `src/operations/analytics/commercial.ts` | One price implementation, after a decision. Not before. |
| `src/components/marketing/content.ts` | Only with the same decision. It correctly follows the commercial library, which is the problem if the library is the wrong price. |
| `docs/product/PRODUCT_STRATEGY.md` edition names (Solo / Business / Enterprise) | Reconcile names with whatever package is approved. Pricing there was explicitly out of scope. |
| `EXECUTIVEOS_COMMERCIAL_AUDIT.md` | Remains the inventory. It should not be rewritten into a strategy. A short note at the top, later, can point here. |

## Assumptions that require founder approval

1. The primary ICP thresholds, especially the **AUD $200 million** entity-size hypothesis and the decision to park miners and utilities.
2. The universe of 30 and the active ten, including the judgement that Hitachi is first and that the other nine are only public lookalikes.
3. List **AUD $9,500**, 11-month annual prepay, second entity **AUD $3,000**, enterprise floor **AUD $15,000**, paid pilot **AUD $15,000**, three free pilots, 15-hour and 12-hour caps.
4. Founder cash salary **AUD $180,000**, engineer **AUD $220,000** fully loaded, G&A **AUD $60,000**, sales cash **AUD $24,000**, founder opportunity **AUD $250 / hour**, CSM **AUD $180,000**, support **AUD $90 / hour**.
5. Token and consultation volumes, and the rule that forecasting stays off the model API.
6. Supabase compute steps at 11, 25, and 50 customers.
7. Churn of 15 / 10 / 8 percent and the logo counts in the three scenarios.
8. Win rate of 20% and 15 hours per opportunity.
9. Card share of zero, and ignoring any Stripe Invoicing fee until it is confirmed.
10. The FX rate of 0.7040 held flat. It is a conversion convenience.
11. That a second tenant is safe to sell when the time comes. The engineering record should confirm that per customer. This paper does not.
12. That we will not claim SOC 2, a deletion SLA, or a forecast-accuracy improvement in a 30-day pilot.

---

*Recommendation only. No price, checkout, or existing strategy document was changed.*
