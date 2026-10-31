# ExecutiveOS Commercial Documentation Audit

**Date:** 1 November 2026 (Australia/Brisbane)  
**Repository HEAD reviewed:** `3a8a310` (5 October 2026) — “feat: harden manufacturing evidence graph finalization”  
**Commercial library last edited:** `e429dd2` (23 August 2026) — “chore: prepare ExecutiveOS for design partner pilot”. No file under `docs/commercial/`, `docs/business/`, `docs/design-partner/`, or `docs/demos/` changed after that commit.  
**Company / product:** Braltiq · ExecutiveOS  
**Scope:** Existing commercial, strategic, positioning, go-to-market, pricing, marketing, and customer documentation. Product code is cited only where it encodes a commercial assumption that the documents do not settle.  
**Constraint:** This audit does not change strategy, pricing, packaging, or any existing file other than this report.

---

## Executive summary

ExecutiveOS already has a substantial commercial library. It is not one agreed commercial system.

Two written libraries claim overlapping authority:

- `docs/commercial/` (14 files) calls itself the **canonical commercial operating manual** for how Braltiq sells and tells the story. Public marketing copy in `src/components/marketing/content.ts` follows it.
- `docs/business/` (13 files) is a complete **beta-launch operating plan**. The commercial README says this set is superseded for pricing and packaging. The business README still presents itself as the current launch strategy, and it remains the only place with a scored ICP, a ten-competitor matrix, a beta operating calendar, success-metric definitions, and numerical revenue targets.

A third layer, `docs/design-partner/` (August 2026), is the most recent **operational** account of what a pilot can honestly claim. It is narrower than the commercial story: Manufacturing Forecasting from Excel/CSV, a 30-day clock, no live ERP, and a live executive session that has been designed and **not yet conducted**.

A fourth layer, `docs/product/PRODUCT_STRATEGY.md` and `docs/foundations/`, sets philosophy, jobs-to-be-done, and a different edition scheme (Solo / Business / Enterprise) with pricing explicitly out of scope.

**Pricing has not converged.** At least four price books coexist:

| Source | Model | Currency |
|--------|--------|----------|
| `docs/commercial/02_PRICING_AND_PACKAGING.md` and the marketing site | Individual AUD $495 / Team AUD $1,995 / Enterprise custom | AUD |
| `docs/business/PRICING.md` and `supabase/migrations/007_billing.sql` | Starter $49 / Professional $149 / Executive $349 / Enterprise $999 | USD (`currency` default `'usd'`) |
| `src/commercial/pricing/catalog.ts` | Pilot AUD $4,500 / Production AUD $7,500 / Enterprise AUD $15,000 per month, plus seat adders | AUD |
| `src/growth/checkout/flow.ts` and `src/operations/analytics/commercial.ts` | Same plan *names* as Stripe, with monthly figures of 990 / 4,500 / 7,500 / 15,000, and a separate internal MRR table (pilot 4,500, production 8,500, enterprise 18,000) | Unlabelled in checkout; analytics treats amounts as MRR |

The commercial library declares itself the source of truth and instructs engineering to migrate toward AUD $495 / $1,995. The commercial *module* and growth checkout implement a different AUD book. Stripe still stores the USD seat plans.

**There is no financial model.** Revenue figures exist only as targets inside the beta-era business plan: about $18k ACV, $25k MRR by month 6 of GA, $1M ARR at v2.0, $5M ARR at v3.0. Those targets assume the USD seat book, not the AUD list the website shows, and not the AUD $7,500 production book in code.

**Hitachi is a demonstration scenario, not a commercial agreement.** Two demo documents address Hitachi Construction Machinery Australia. They state there is no Hitachi product fork, use representative numbers, and point at the commercial library for trial terms. No Hitachi price, term sheet, success contract, or account plan is in the repository.

**What is stable across the later documents:** Braltiq sells an Executive Intelligence Platform; the philosophy line is “Confidence Through Clarity”; AI advises and the executive decides; the product sits above systems of record; industry depth is meant to arrive as packs, with Manufacturing first; customers are told they buy intelligence, not integrations; social proof waits for approval; security claims must stay inside what is evidenced.

The practical implication for further commercial work: settle which document is allowed to set price, pilot terms, and the first customer, and mark the others historical. Until that happens, a seller can quote four different numbers from inside this repository and be “following the docs.”

---

## How this audit treats status

| Label | Meaning in this report |
|-------|------------------------|
| **Declared current** | The commercial library says this is how Braltiq sells. Marketing copy follows it. Later pilot docs and product code do not fully match it. |
| **Operationally current** | Matches the August 2026 design-partner readiness work, including explicit “not implemented” limits. |
| **Foundational** | Still the philosophical or constitutional source. It does not set price or GTM motion. |
| **Beta-era** | Internally consistent launch plan. Superseded for packaging by `docs/commercial/README.md`, and behind the design-partner phases on pilot reality. The business README does not say so. |
| **Exploratory** | Written as options or workshop material. Not an adopted commercial decision. |
| **Incomplete** | Starts a commercial topic and stops before a decision, a number, or a customer proof. |

Internal commercial-document dates run from the Constitution (20 July 2026) through design-partner Phase 70 (23 August 2026). Product work continued after that, through 5 October 2026, without a matching commercial rewrite.

That later product work matters to this audit only as a constraint on claims:

- `docs/architecture/ADR-008-verified-connections-evidence.md` (13 September 2026) decides that a connection is not evidence, that Discovery must not invent Reality Lab fixtures, and that the Snapshot Studio Excel / user-upload path stays the manufacturing ingestion route. That agrees with the design-partner honesty rules. It does not add a price, an ICP, or a Hitachi term.
- Commits through 5 October 2026 harden organisation bootstrap, pilot persistence, recurring upload, and a manufacturing evidence graph. They do not update the commercial library, the business plan, or the Hitachi scripts.

Treat August 2026 commercial and pilot documents as the latest *written* commercial position, and October 2026 product work as engineering that the commercial documents have not yet absorbed.

---

## Existing commercial documentation inventory

### 1. Company and product positioning

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/00_EXECUTIVEOS_NARRATIVE.md` | Short commercial story: why the company exists, why “Executive Intelligence” is a category, vision, mission, five ambitions. Points at the long narrative for depth. | Declared current | Category name Executive Intelligence Platform (EIP). Investor analogy used sparingly: system of record for executive judgement. Product sits above Microsoft 365, Simpro, Salesforce, Dynamics. Philosophy: Confidence Through Clarity. | Claims a product surface list (Command Centre, Council, packs, provisioning, Operations / Commercial profiles, Manufacturing via packs) that the design-partner docs later narrow for the live pilot. |
| `docs/commercial/01_POSITIONING_BIBLE.md` | Category, positioning statement, messaging hierarchy, 15-second through 10-minute pitches, language registers, is / is-not, competitive stance, proof points. | Declared current | For executives who decide under load. Unlike dashboards, Copilot, and general chat, because outcome-grounded, explainable, Council-aware, human authority. Four pillars: proactive intelligence, structured judgement, industry packs, executive-grade trust. | 30-second pitch already quotes the 30-day trial and “no setup fee.” Competitive table is a stance, not a fact base. Proof points include a “≤5 minute” provisioning target and a Manufacturing production pack. |
| `docs/foundations/EXECUTIVEOS_NARRATIVE.md` | Long-form company narrative (v1.1). Problem, why now, beliefs, category, flywheel, mission, vision. | Foundational | Prefers the Constitution’s line: the operating system for executive decision making. Introduces **DecisionOS** as the sharp category label inside the broader EIP space. | Commercial library leads with EIP and uses DecisionOS rarely. Two category names are both “canonical” in different files. |
| `docs/architecture/EXECUTIVEOS_CONSTITUTION_v1.md` | Governing product document (v1.0, 20 July 2026). Article I is the positioning article. | Foundational | Position: the operating system for executive decision making. Category: EIP. Brand must not lead with “AI-powered” or assistant-first home. | Binds product and design. It does not choose a price, an ICP, or a first vertical. |
| `docs/product/PRODUCT_STRATEGY.md` | Product Strategy v1. Vision, who is served, jobs, editions, trust, AI philosophy, flywheel, success metrics, 5–10 year vision. | Foundational; packaging incomplete | Same mission language as the narrative. Four maturity stages from solo operator to enterprise. Editions: Solo, Business, Enterprise. “Pricing is out of scope.” AI is an advisor, never the decision maker. | Edition names do not match the commercial library (Individual / Team / Enterprise) or the business plans (Starter / Professional / Executive / Enterprise). Explicitly “design only.” |
| `docs/business/PRODUCT_STRATEGY.md` | Earlier three-year product vision and UVP aimed at beta. | Beta-era | Category EIP. Year-1 outcome: daily hub for 50+ executive teams. UVP centres Intelligence Center, graph, 10 advisors, health engine, meeting prep, memory. Stage 1 marked “we are here.” | Advisor-count and “10 specialist advisors” lead the story. Later commercial positioning leads with Council, packs, and profiles. “50+ executive teams” in year 1 is not reconciled with the 10-org beta or with design-partner capacity. |
| `docs/business/POSITIONING.md` | Beta messaging: why now, why not Copilot, why not ChatGPT, pitches, taglines. | Beta-era | EIP definition. Tagline test set; recommended primary: “The executive intelligence platform.” Pitches name Starter $49 and Executive $349 and “controlled beta.” | Price lines contradict the commercial pricing document, which says not to market these tiers. |
| `docs/design/BRAND_STRATEGY.md` | Brand purpose, personality, promise. | Foundational for voice | Promise: know what requires attention, and why, before the first meeting. Personality: Chief of Staff you trust; Sage + Steward. Vision horizon stated as 2029. | Commercial vision is “end of the decade” and “five years.” The 2029 date is a brand document choice, not a plan with milestones. |
| `docs/commercial/04_BRAND_GUIDELINES.md` | Commercial application of brand: voice, tone by context, writing rules, colour and photography stance, publish checklist. | Declared current | One voice for marketing and product. No hype words. “You decide” stays visible. Light premium, not dark admin, for customer surfaces. | Defers visual tokens to design docs. Does not resolve DecisionOS vs EIP. |
| `docs/design/studio/01-brand-positioning.md` | Ten brand *directions* (Navigator, Strategist, Compass, and others). Each is marked not final. | Exploratory | Recommendations are “borrow, don’t adopt.” | Must not be read as the brand decision. The adopted voice lives in brand strategy and the commercial guidelines. |

**Positioning decisions that recur and are not in dispute across the later documents**

- The buyer is a leader, not the general workforce.
- The job is ranked judgement under time pressure: what requires attention, why, what next.
- Dashboards, Copilot, and general chat are the comparison set, and the stance is a different job, not a cheaper seat.
- Human authority is non-negotiable in the story.
- “Confidence Through Clarity” is the philosophy line.

**Positioning that is not settled**

- Whether the category name used in market is Executive Intelligence Platform, Decision Operating System, or “the operating system for executive decision making.” All three appear, with EIP dominant in GTM files and DecisionOS dominant in the long narrative.
- Whether the lead proof is “ten AI advisors” (business positioning) or “Council + Intelligence Packs + Profiles” (commercial positioning).

---

### 2. Product narrative and value proposition

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/11_PRODUCT_VISION.md` | Five-year commercial ambition. Platform layers, future packs, future AI, definition of “autonomous” intelligence, geography. | Declared current | Manufacturing is the first production pack. Future packs are illustrative, not ship commitments. Autonomy means continuous preparation; authority stays with the executive. Near-term markets: English-first Australia, UK, US. | No success metric that would falsify the five-year claim. Qualitative test only: a buyer can answer four questions. |
| `docs/commercial/10_PRODUCT_ROADMAP.md` | Commercial reading of releases 1.0, 1.1, 1.2, 2.0. | Declared current as a lens; incomplete as a dated plan | 1.0 commercial outcome is paying Individual/Team customers and a defined Enterprise path. Priorities P0–P4. Messaging cheat sheet per release. | Release names do not match `docs/business/ROADMAP.md` (Beta → v1.0 → v1.5 → v2.0 → v3.0, with a 2026 Q2–2027 calendar). No statement of which release the August 2026 pilot actually is. |
| `docs/product/EXECUTIVE_EXPERIENCE_BLUEPRINT.md` | Workshop 15 experience design: magic moment, first 5 minutes, first week, daily/weekly/monthly rhythm, trust, AI role. | Foundational experience spec | First value is a briefing that reconstructs the morning. AI drafts language and explains; it does not decide. Vendors do not train public models on customer decisions by default — stated as a contractual and product default. | “When shipped” qualifiers are honest, but the blueprint is design-only. It is not a customer promise sheet. |
| `docs/customer/EXECUTIVEOS_CUSTOMER_JOURNEY_BLUEPRINT.md` | Lifecycle from discovery through exit (v1.0, effective 26 July 2026). Includes website, onboarding, email, support, renewal. | Foundational experience spec; commercial numbers absent | Customer promise: within five minutes, see what requires attention, why, and a recommendation with evidence. Value figures must be explainable or they are not shown as proof. | Purchase, pricing, and ROI sections specify *experience*, not a price. “Editions,” “seats,” and “no training on customer data” are assumed without pointing at one price book. |
| `docs/foundations/PRODUCT_PRINCIPLES.md` | Decade-horizon principles for product judgement. | Foundational | Reduce cognitive load. No silent auto-decisions on leadership matters. | Not a commercial document. It constrains what marketing may claim. |
| `docs/commercial/06_DEMO_PLAYBOOK.md` | 25 / 45 / 60 minute demos for Operations, Commercial, and Manufacturing, plus a Hitachi-class script. | Declared current as talk track; capability claims ahead of the pilot docs | One profile per demo. Start in Command Centre. Connectors are late and optional. Hitachi section: no product fork; representative data; pilot success is habit and decision clarity. | Manufacturing and Hitachi acts walk factory health, dealer demand, inventory, and working capital. `docs/design-partner/EXPANSION_MODEL.md` marks those modules **not active**. Forecasting is the only active manufacturing module. |

---

### 3. Market segmentation and ICP

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/business/IDEAL_CUSTOMER_PROFILE.md` | The only scored ICP. Primary and secondary firmographics, personas, triggers, objections, anti-ICP, 10-point qualification matrix. | Beta-era, and still the document the commercial library cites | Primary: executive office, 200–2,000 employees, $50M–$500M revenue, US/UK/Australia, English-first, C-suite plus a Chief of Staff or senior EA. Microsoft 365 required for calendar intelligence “today.” Pursue scores ≥7. Anti-ICP: solo founders under 20 employees, no planning discipline, on-premise, project-management-only buyers, no M365 and unwilling to connect calendar. Secondary: division leaders in $1B+ parents; 2 of 10 beta slots reserved. | Revenue currency is unspecified here. Commercial sales playbook later prefixes the same range with AUD. Budget table is written against Professional / Executive / Enterprise seat plans ($12–18k, $30–45k, $100k+; typical approval $15–40k ACV). That budget does not match AUD $495 Individual (~AUD $6k/year) or the code’s AUD $7,500/month production book. |
| `docs/commercial/09_GTM_STRATEGY.md` | Markets, channels, motion. Defers ICP detail to the business ICP. | Declared current | Priority 1 mid-market executive offices (AU/UK/US). Priority 2 industrial / OEM manufacturing. Priority 3 PE-backed multi-BU. Industries named: B2B SaaS, professional services, fintech, healthtech, industrial tech, manufacturing OEM. | One-line ICP still assumes manual assembly above M365/CRM/ERP. The live design-partner motion is Excel/CSV manufacturing forecasting and does not require M365. Field services (Simpro), which the Operations edition in code targets, is not a named GTM industry. |
| `docs/product/PRODUCT_STRATEGY.md` §4 | Four maturity stages as “who we serve.” | Foundational | Solo (1–10), growing (10–100), mid-market (100–1,000), enterprise (1,000+). Primary design centre is stages 2–4. Solo is “a valid early form of the same product.” | Directly conflicts with the business anti-ICP that excludes solo founders under 20 employees. Employee bands do not match 200–2,000. |
| `docs/commercial/05_SALES_PLAYBOOK.md` | Restates ICP inside the sales motion and adds AUD to the revenue band. | Declared current | Primary band restated as ≈200–2,000 employees and ≈AUD $50M–$500M. Geography first: Australia, UK, US. | Adding “AUD” changes the ICP if the business file meant USD. Neither file records the assumption. |

**Documented segments that are not the same decision**

| Segment | Where it is written | Role |
|---------|---------------------|------|
| Mid-market CoS-led office on Microsoft 365 | Business ICP, GTM priority 1 | Written primary ICP |
| Industrial / OEM manufacturing leadership | GTM priority 2, manufacturing blueprint, Hitachi demos | Strongest *artefact* of a named customer motion |
| Field-service / operationally intensive mid-market | `src/commercial/editions/registry.ts` Operations edition | In product packaging code, not in the GTM industry list |
| Growth B2B services with pipeline complexity | Same registry, Commercial edition | Matches “Commercial Executive,” not a researched segment file |
| PE / VC portfolio | GTM channel and beta recruitment | Channel, not a segment definition |
| Twelve researched industries | `docs/research/industries/` | Research for future packs. The README says research only, no pack code |

---

### 4. Target industries and customer personas

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/business/IDEAL_CUSTOMER_PROFILE.md` | Buyer personas: economic buyer (CEO/COO), champion (CoS / Head of Strategy), user (CFO, CRO, VP Ops), technical influencer (CIO/CISO), blocker (Copilot-only IT). | Beta-era; still cited | Pains, success metrics (decision velocity, 30–50% meeting-prep reduction, 2–4 hours/week reclaimed), buying triggers (new CEO, board pressure, CoS hire, failed Copilot, post-acquisition, planning cycle). | Manufacturing plant / dealer / CFO-of-OEM persona is not in this file. Hitachi-class buyers are specified elsewhere. |
| `docs/commercial/05_SALES_PLAYBOOK.md` | Same persona set, plus plant / BU lead as a user, and Manufacturing profile as a strong signal. | Declared current | Discovery questions choose Operations, Commercial, or Manufacturing before demo. | Persona pains are still CoS brief-assembly. Manufacturing buyer pains are in the demo playbook and the manufacturing blueprint, not in the ICP. |
| `docs/intelligence-packs/manufacturing/00_BLUEPRINT_OVERVIEW.md` | Manufacturing executive archetype for pack design. | Product design; commercially relevant | Discrete / OEM, multi-factory, dealer or distributor channel, working-capital exposure. Job: see factory, inventory, demand, and capital as one judgement surface. Pack, not Core. Reality Lab before customers. Dealer demand is not B2B SaaS pipeline. | Header still says the blueprint is **not** a Manufacturing Intelligence Pack implementation. Commercial and demo docs later speak of `pack-manufacturing-executive` as shipped. The two statements need a single status. |
| `docs/research/industries/README.md` and twelve industry files | Research foundations for future packs (manufacturing, mining, utilities, construction, healthcare, government, professional services, technology, financial services, retail, logistics, field services). Updated 8 August 2026. Canonical as research. | Research, not GTM | No pack code follows from these files by their own rule. | Hitachi journey slide 12 names Mining, Utilities, Construction, Healthcare, Technology, Government as the platform’s future. Commercial vision names adjacent industrial, regulated professional services, healthcare operations, and financial services. Field services has both a research file and a large product area (`src/industry/field-services/`) and is absent from the GTM industry list. |
| `docs/research/executives/README.md` and role files | How CEO, CFO, COO, CRO, CSO, and a wider set (CCO, CIO, CTO, CPO, CRISK) think. | Research | Permanent Council in product is CEO, CFO, COO, CRO, CSO. Wider set is for future Council expansion. | Not personas for buying. Useful for Council story. Not an ICP. |
| `docs/demos/HITACHI_EXECUTIVE_JOURNEY_PRESENTATION.md` | Narrative deck for Hitachi Construction Machinery Australia: CEO, MD, ELT, Sales, Supply Chain, Operations, Factory Planning, Dealer Network. | Sales artefact for one named audience | Explicit: not a product demo. Illustrative numbers are discussion scenarios. Design-partner ask is influence and early access, not a price. | Names a real customer organisation. No account plan, economic buyer map, or commercial terms sit beside it. |

---

### 5. Competitive positioning

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/business/COMPETITOR_ANALYSIS.md` | Ten alternatives with strengths, weaknesses, approximate price, differentiation, and an “opportunity score.” | Beta-era; still the only full competitor file | Set: Microsoft Copilot, ChatGPT Enterprise, Notion AI, Atlassian Rovo, ClickUp AI, Motion, Reclaim, Salesforce Agentforce, Google Gemini Workspace, human executive assistants. Copilot is scored the highest opportunity (9/10) and the highest threat. Stance: complement Copilot for the executive office. | Prices are approximate and undated (Copilot ~$30/user, ChatGPT Enterprise ~$60/user). Opportunity scores are judgement, not sourced. No manufacturing-specific competitors (ERP planning suites, MES, Kinaxis-class tools, dealer systems). |
| `docs/commercial/01_POSITIONING_BIBLE.md` § Competitive positioning | Short stance table: BI, Copilot, dashboards, consultants, coaching, traditional reporting. | Declared current | Lines to use: Copilot writes the email; ExecutiveOS asks whether the meeting should happen. ChatGPT is the analyst you visit; ExecutiveOS is the office that never closes. Win the job, not the seat-price comparison. | Drops several competitors that the business file treats as real (Notion, Motion, Agentforce, Gemini, human EA). Sales still needs the longer file, which quotes the old price. |
| `docs/commercial/02_PRICING_AND_PACKAGING.md` § Competitive price frame | Honest frame: do not win by being cheaper than Copilot per seat. | Declared current | Comparison anchors are Copilot, ChatGPT Enterprise, CoS time, consulting sprints. | The business pricing file makes the opposite rhetorical move: Professional at $149 is “half the price” of Copilot for 10 executives and “20× ROI.” |
| `docs/design/studio/09-competitor-experience.md` | Experience borrow/reject notes (Apple and others). | Exploratory UX | What to borrow in the interface. | Not a market map. |

No win/loss log, no battlecard with dated sources, and no competitor-pricing review after the commercial price change.

---

### 6. Product editions and packaging

Three written packaging schemes and two code registries describe different products.

| Scheme | Where | What the customer buys |
|--------|-------|------------------------|
| **Commercial library (declared GTM)** | `docs/commercial/02_PRICING_AND_PACKAGING.md` | Individual Executive, Executive Team, or Enterprise. **One** Executive Intelligence Profile included: Operations, Commercial, or Manufacturing. Connectors are not the SKU. |
| **Beta seat plans** | `docs/business/PRICING.md`, `007_billing.sql` | Starter, Professional, Executive, Enterprise. Value metric is leadership seats. Feature gates: meeting intelligence, health analytics, memory tier, “future integrations.” |
| **Product strategy editions** | `docs/product/PRODUCT_STRATEGY.md` §7 | Solo, Business, Enterprise. Shared loop; pricing out of scope. “We do not ship ExecutiveOS for Sales as a separate product identity.” |
| **Commercial module editions** | `src/commercial/editions/registry.ts` | Two editions only: `operations_executive` (M365 + Simpro; field-service / operational mid-market) and `commercial_executive` (M365 + Salesforce; growth B2B services). **No manufacturing edition.** |
| **Growth plan ids** | `src/growth/checkout/flow.ts` | Reuses Starter / Professional / Executive / Enterprise names. Professional tagline is “Operations or Commercial edition.” |

**Decisions the commercial library treats as agreed**

- Three packages. Simple on purpose.
- One profile included. Additional profiles and packs are future SKUs and must not be sold ahead of the product.
- Enterprise may carry residency, SSO, SLAs, and multi-profile only when the product supports them.
- Expansion is more profiles, more packs, more executives. Connector line items are not the expansion motion.
- No implementation fee and no setup fee. White-glove is a design-partner privilege, not a list-price tax.

**Packaging that is not agreed**

- Manufacturing Executive is a marketed profile (`content.ts`, pricing doc, demo playbook) and is **not** an edition in `registry.ts`. Design-partner pilot model says a dedicated `manufacturing_executive` catalogue id is **not yet implemented**; the Studio business profile `manufacturing` maps to `operations_executive`.
- Product strategy says vertical depth is connectors and outcome context inside one OS, and refuses a separate “ExecutiveOS for Sales.” The commercial library sells a Commercial Executive profile as a choice of how the platform thinks. Those can be reconciled, but no document does the reconciliation.
- Business feature matrix gates CRM integrations to Enterprise. Commercial packaging says connectors are available and are not the product. Design-partner onboarding proves value from a file export before any live system connection.

---

### 7. Pricing and monetisation strategy

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/02_PRICING_AND_PACKAGING.md` | Declared commercial model. | Declared current; not what billing or the commercial module charge | AUD. Individual $495/month. Team $1,995/month. Enterprise custom. 30-day free trial. No implementation fee. No setup fee. Card self-serve for Individual and Team. Enterprise is quote, MSA, optional annual invoice. Annual guidance ≈ two months free (~17%), “confirm exact figure at quote time.” | Says Stripe should migrate toward these SKUs and that obsolete tiers must not be marketed. Does not mention the AUD $4,500 / $7,500 / $15,000 book already in `src/commercial/pricing/catalog.ts`. |
| `docs/business/PRICING.md` | Beta pricing philosophy, plan matrix, usage limits, support SLAs, beta discounts, enterprise licensing, packaging hypotheses. | Beta-era; superseded for list price by the commercial README; still the only written usage-limit and SLA model | Value metric: leadership seats. Usage limits guard abuse. Land Professional via the CoS; expand seats and Executive tier. Annual default in product ≈ 20% off. Beta partners free for 8 weeks; 50% off year 1; extra 10% for a case study (cap 60%); founding logo lock Executive at $249/month for 24 months. Enterprise: $999/month minimum or $80k ACV floor; extra seats $25–40; AI volume $500 per 10k requests; professional services $200/hour; data residency premium 15% (v2.0); 90-day pilot at 50% of ACV. | Currency is not stated in the prose. The migration it cites stores prices in cents and defaults currency to **USD**. ROI copy (“Professional is half the price of Copilot,” “20× ROI”) depends on the $149 plan. |
| `supabase/migrations/007_billing.sql` | Plans inserted for Stripe-shaped billing. | Implemented USD seat book | starter 4900 / professional 14900 / executive 34900 / enterprise 99900 monthly cents. Seat limits 3 / 10 / 25 / 999. AI request limits 100 / 1,000 / 5,000 / 100,000. | This is the only database price list. It does not contain Individual or Team, and it does not contain 495 or 1995. |
| `src/commercial/pricing/catalog.ts` | In-process AUD price bands for trial, design partner, pilot, production, enterprise. | Implemented; undocumented as strategy | Trial and design partner list at 0. Pilot $4,500/month and $45,000/year, seat $250. Production $7,500/month and $78,000/year, seat $320. Enterprise $15,000/month and $156,000/year, seat $280. Quote adds seats above 5. Notes: design partner is “preferential conversion terms.” | No manufacturing band. Annual production ($78,000) is not “two months free” on $7,500×12. Enterprise here is a list price; the commercial library says Enterprise is custom. |
| `src/growth/checkout/flow.ts` | Self-serve checkout plan cards. | Implemented; mixed with the seat-plan names | Starter from 990 with a **14-day** trial highlight. Professional from 4,500. Executive from 7,500. Enterprise from 15,000. | 14-day trial vs 30-day commercial trial vs 8-week beta vs 30-day design-partner clock. |
| `src/growth/subscriptions/store.ts` | In-memory subscription activation. | Implemented shortcut | Paid invoice amount is **7,500 monthly or 78,000 annual regardless of which plan id was selected.** | A Starter checkout and an Enterprise checkout record the same invoice amount. |
| `src/operations/analytics/commercial.ts` | Internal MRR snapshot by licence tier. | Implemented assumption | design_partner 2,500; pilot 4,500; production **8,500**; enterprise **18,000**; unknown tier 4,000; if there are subscriptions and no licence MRR, **5,000 per active subscription**. | Production and enterprise figures do not match the pricing catalog ($7,500 and $15,000). |
| `src/components/marketing/content.ts` | Marketing site price strings. File header: sourced from `docs/commercial/`, do not invent price. | Matches the commercial library | AUD $495, AUD $1,995, Enterprise custom, 30-day trial, no setup fee, no implementation fee, one profile included. | The public site and the billing database disagree. |
| `src/commercial/sales-enablement/assets.ts` | Generated FAQ. | Code, not a controlled document | “Pilot pricing … from ~$4,500/mo AUD.” “Start with one edition: Operations or Commercial.” | This is the sentence a sales asset will speak. It contradicts the website. |

**Monetisation choices that appear in writing and then diverge**

- Commercial library: altitude pricing, premium vs $30–$60 AI add-ons, card for the first two packages, no services fee.
- Business file: seat pricing, AI and storage as guardrails, services hours and residency premium on Enterprise, beta discounts as a standing offer.
- Commercial module: edition-based AUD platform fee plus seats after five, design partner at zero list with “preferential conversion terms” unspecified.

No document records a decision to retire any of these.

---

### 8. Design Partner and pilot strategy

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/08_DESIGN_PARTNER_PROGRAM.md` | Selection, expectations, 8-week-shaped journey, metrics, case studies, conversion to Individual / Team / Enterprise. | Declared current as a program; duration and metrics overlap the beta file | Purpose: habit, profile fit, judgement quality, publishable evidence, conversion. Not perpetual free consulting and not a Core fork. Capacity on the order of ~10 organisations. Commercial consideration is **per deal**; standing discounts must not be invented in marketing. Two publishable stories before a broad GA push. | “Align with the beta program where helpful” imports an 8-week free pilot and 50% year-1 discount that this same document says not to standardise. Success metrics are labelled illustrative and then point at the beta file for “exact” targets. |
| `docs/business/BETA_PROGRAM.md` | 10-organisation, 8-week beta: composition, recruitment, weekly cadence, interviews, exit criteria. | Beta-era operating plan | Objectives: habit, ≥3 hours/week saved for a CoS, NPS ≥40, ≥3 paid conversions, two case studies. Slots 1–4 B2B SaaS on Professional; 5–6 CEO-direct on Starter; 7–8 fintech/healthtech on Executive; 9–10 enterprise-path divisions. M365 and calendar connection are must-haves. | Composition does not include a manufacturing forecasting pilot. “Beta in progress” language is stale relative to Phases 63–70, which are a different pilot shape. |
| `docs/design-partner/README.md` | Index for the manufacturing forecasting pilot. Phase 63 readiness. | Operationally current | Controlled environment inside ExecutiveOS. No separate Hitachi product. Partner name is tenant configuration. Prove value from an export before asking for ERP integration. Primary destination is Command Centre (`/today`). | Phase label in the header is “Phase 63” while Phases 64–70 also exist in the folder. |
| `docs/design-partner/PILOT_MODEL.md` | Environment modes, 30-day checkpoints, boundaries. | Operationally current | Focus module `manufacturing_forecasting`. 30-day clock only when `pilotStartedAt` is set. Includes forecasting, Excel/CSV, snapshot, Command Centre, judgement, decision, action. Excludes live ERP, Dynamics, SAP, MRP, CMMS, production execution, inventory optimisation, dealer allocation automation, autonomous decisions. | 30 days, not 8 weeks. Profile id in the sample provision call is `operations_executive`, with an explicit note that `manufacturing_executive` is not in the catalogue. |
| `docs/design-partner/DATA_ONBOARDING.md` | Upload → map → validate → snapshot → intelligence → Command Centre. | Operationally current | Honesty surfaces for what was received, understood, missing, and not interpretable. | This is the actual first-run, not the commercial “Discovery: role, three outcomes, briefing time, connect when ready.” |
| `docs/design-partner/SECURITY_POSTURE.md` | Allowed and forbidden security claims. | Operationally current | Forbidden unless evidenced: SOC 2, ISO 27001, “enterprise compliant,” guaranteed encryption at rest, automatic deletion SLA. Retention policy not configured by default. Fine-grained RBAC not fully enforced. Audit history page not built. | Business roadmap lists “SOC 2 Type II engaged” as a **GA success criterion**. Commercial roadmap says say it only when true. The security posture file is the constraint. |
| `docs/design-partner/PILOT_METRICS.md` | What may be recorded. Null means unmeasured. | Operationally current | Time to first insight, time to decision frame, decisions, actions, data-prep friction, executive return, “would you start here?” | These are not the same metrics as WAEx, NPS, and hours saved in the beta and CS docs. |
| `docs/design-partner/EXPANSION_MODEL.md` | Land-and-expand **signals**. | Operationally current | Forecasting is the only ACTIVE module. Inventory, production capacity, and dealer demand may show fields and are **not** active. Stop: do not start those modules, working capital, live ERP, or autonomous agents until the pilot loop has proved value from exports. | Phase 63’s own doc says the stop still applies after readiness was marked complete. Hitachi demo acts describe those inactive surfaces as the meeting. |
| `docs/design-partner/PILOT_PROVISIONING.md` | Manual four-user setup. | Operationally current | No automated invite email. Supabase users, one organisation, roles owner/executive. Manufacturing upload in Snapshot Studio. | Commercial onboarding assumes provisioning, invites, and a 45-minute kickoff. This procedure is the one written for the first pilot. |
| `docs/design-partner/PILOT_ACCESS_READINESS.md` | Access audit, 23 August 2026. | Operationally current | Verdict: **AMBER — ready after manual setup.** Not green: production URL, Vercel, migration 011, and a live four-browser run were unverified from the workspace. Prior verdict was RED. | A commercial “invite design partners” motion is ahead of this verdict. |
| `docs/design-partner/PHASE_64` through `PHASE_69` (experience, friction, continuity, command-centre compression, signature experience, simulation) | Internal validation of the executive loop. | Operational validation notes | Structural loop can be demonstrated in simulation. Friction is logged. | These are product-quality records. They are not customer evidence. |
| `docs/design-partner/PHASE_70_LIVE_EXECUTIVE_VALIDATION.md` and `PHASE_70_EXECUTIVE_SCORECARD.md` | Protocol for a real executive session. | Operationally current and incomplete | Protocol is defined. **Live session not conducted.** Timings and perceived value are **NOT ESTABLISHED**. Verdict of the protocol work: ready with P1 fixes. | Any case study, habit claim, or “executives start here” proof is unsupported by this file. The file says not to invent responses. |
| `docs/validation/PHASE_63_DESIGN_PARTNER_READINESS.md` | Outcome note for the forecasting pilot, 23 August 2026. | Operationally current | Can run a controlled pilot from Excel/CSV without hard-coding a customer. Known limits: process-local stores, RBAC, retention, no manufacturing profile id. | Stop condition repeated. |
| `BETA_READINESS.md` | Short pointer. Phase 33 verdict. | Older than the design-partner phases | **GO** for controlled commercial deployment and design partners. **CONDITIONAL** for public GA marketing that implies full Knowledge/Reports depth or multi-instance durability. | “GO” here is an earlier phase verdict. Pilot access on 23 August 2026 is AMBER, and Phase 70 has no participant. Both can be true only if “GO” means engineering permission for a controlled pilot, not permission to claim market proof. |
| `docs/commercial/07` and business onboarding | See §12. | — | Design partners get white-glove; self-serve uses provisioning. | Two clocks (30-day and 8-week) assign different owners and homework. |

---

### 9. Hitachi-specific commercial documentation

Only two customer-named commercial documents exist. Both are demonstration scripts. Neither is a proposal, order, or account plan.

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/demos/HITACHI_MANUFACTURING_EXECUTIVE_DEMO.md` | ~60 minute working session for a Hitachi-class industrial OEM. Phase label 52A. | Current as a talk track; ahead of active modules | No custom Core. Council stays CEO, CFO, COO, CRO, CSO. Domain Advisors advise and do not vote. Representative enterprise (3 plants, dealer channel). Commercial close: buy Manufacturing Profile / Pack; do not buy a Hitachi fork; 30-day trial, no setup fee, no implementation fee; ask is a design-partner pilot measured by WAEx, decisions logged, and “would you start here before email?” | Walks factory, dealer demand, inventory, production capacity, and working capital. Expansion model says those modules are not active. Close uses commercial-library trial terms, not the $4,500 pilot band and not the beta 50% discount. |
| `docs/demos/HITACHI_EXECUTIVE_JOURNEY_PRESENTATION.md` | 15-slide narrative for **Hitachi Construction Machinery Australia**. | Current as a discussion deck | Not a software walkthrough. Illustrative figures (for example ZX350 +8%, $4.8M) are scenarios, not Hitachi data. Horizon story: 30 days visibility, 90 days forecast confidence, 6 months allocation, 12 months capital and performance. Slide 13 forbids “would you buy this?” Slide 14 offers design-partner influence, workflow validation, early access, founder engagement. | No price, no term, no data-processing position specific to Hitachi, no named sponsor inside Hitachi, no success contract. Slide 12 extends the platform to six further industries without a packaging decision. Canvas path in the file points at a local Cursor canvas outside this repository. |
| `docs/commercial/06_DEMO_PLAYBOOK.md` § Hitachi | Shorter enterprise-industrial variant of the same idea. | Declared current | “Hitachi-class.” Explicitly not a custom build. 60 minutes including security and commercial close. Land Team or Enterprise; design partner is the alternative. | Same capability tension as the long demo. |
| `docs/design-partner/README.md` | One line of Hitachi policy. | Operationally current | Design partner is not a separate product (`HitachiApp` or similar). Customer names are not hard-coded. | This is the architectural decision. It is not a commercial relationship. |
| `docs/demos/mockups/` | Manufacturing command centre, council, demand planning, factory ordering mockups. | Demo visuals | Support the Hitachi session. | Mockups are not evidence of shipped modules. |

**Hitachi decisions that are established:** no fork, no confidential data in the script, representative numbers, design-partner conversation rather than a buy-now ask, Council membership fixed.

**Hitachi decisions that are absent:** price, discount, duration, data residency, who at Hitachi sponsors, what export they would provide, what “success” they have agreed, and whether the session has happened. Phase 70 says a live executive session has not been conducted in this environment. The Hitachi files do not record a meeting outcome.

---

### 10. Sales and GTM strategy

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/09_GTM_STRATEGY.md` | One-page GTM: markets, channels, marketing job, sales stages, partnerships, PLG, expansion, sequencing. | Declared current | Founder-led, evidence-based. Land a profile, prove habit, expand. Channels now: founder network, executive LinkedIn, PE/VC ops. Website trial at GA. Paid acquisition only after about $500k ARR. Partners after GA, with a guardrail against low-altitude resale. PLG means an executive can start alone; it does not mean company-wide freemium. Sequencing: design partner / beta → GA with public pricing and Team as the default leadership SKU → manufacturing narrative and Enterprise → AE and more profiles. | “Design Partner / Beta” is one phase in this file and two different programs in the repo. AE hire “when ARR justifies” points at the business sales doc ($500k ARR) and the CEO playbook uses a different trigger (3 paid customers and 20 demos/month). |
| `docs/commercial/05_SALES_PLAYBOOK.md` | Discovery through renewal on the AUD packaging. | Declared current for motion; price lines assume the $495 book | Founder-led, then AE. Cycles: Individual/Team 2–6 weeks, Enterprise 8–16 weeks. MEDDIC-lite. ICP score ≥7. Proposal is one page. Discount sparingly; prefer annual. Never trade an implementation-fee waiver, because the fee is already zero. Never sell unshipped capability. | ROI example uses Team at AUD $1,995 and “five hours a week” without a loaded-rate figure. The business sales playbook uses $75–$90 loaded and Professional at $149. Objection handling mentions a contractual no-training posture; the design-partner security file is stricter about what may be claimed. |
| `docs/business/SALES_PLAYBOOK.md` | Beta sales motion through to close. | Beta-era | Founder-led until $500k ARR, then one AE. Close Professional or Executive annual via Stripe; beta close is LOI then invoice. Pilot proposal: 90 days at 50% ACV. Procurement pack for deals under $50k ACV should not be custom-written each time. | Quotes $149. A seller following this file will not quote the website. |
| `docs/business/CEO_PLAYBOOK.md` | 90-day operating rhythm for a founder who is also the seller. | Beta-era; still the only weekly operating plan | Day 30: 5 beta orgs. Day 60: 10 orgs and 2 case drafts. Day 90: 3 paid conversions and GA date set. Monday metrics, Tuesday customers, Wednesday product, Thursday LinkedIn and PE intros, Friday retro. Fundraising is parallel and optional: beta is traction proof, not revenue proof. Deck line: EIP → 10 beta orgs → $18k ACV → path to $5M ARR. Hiring gates: AE after 3 paid and 20 demos/month; CS at 15 paying orgs; marketing at $30k MRR. | Day-90 MRR target is ≥$1,500 or 3 LOIs, which only makes sense on the cheap seat book (3 × ~$149 to $349, or discounted). It is incompatible with three Team logos at AUD $1,995 or three production logos at AUD $7,500. Risk register is beta-specific and still useful as a list of risks, not as a current status. |
| `docs/commercial/06_DEMO_PLAYBOOK.md` | See §2 and §9. | Declared current as method | Discovery before demo. Profile-specific narrative. | — |
| `src/commercial/sales-enablement/assets.ts` | Generated comparison, implementation, ROI, security, and FAQ text. | Not a controlled document | See pricing section. Implementation stages in `src/commercial/implementation/stages.ts` require provider connection as stage 3. | Design-partner onboarding treats live providers as future. The stage list says required providers connected before executive discovery completes. |

**GTM decisions that are repeated and stable**

- Founder sells first.
- English-first Australia, UK, United States.
- No paid acquisition until the business is past an early ARR threshold (written as about $500k).
- Category education over volume.
- Two approved stories before a broad public push.
- Do not market unshipped autonomy.
- Do not fork Core per logo.

**GTM decisions that are not stable:** who the first ten logos are, how long the pilot is, what they pay, whether M365 is required, and whether Manufacturing Forecasting is the wedge or a later vertical.

---

### 11. Website and marketing strategy

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/03_WEBSITE_BLUEPRINT.md` | Full marketing information architecture and page-level headlines. | Declared current as IA | Sitemap: Home, Product, three profile pages, Pricing, Security, About, Resources, Blog, Support, Start Trial. Home headline: “The operating system for executive decision making.” Primary CTA Start Free Trial; secondary conversation or demo. Prices on the pricing page must come from the commercial pricing doc (495 / 1,995 / custom). Social proof only with approval, or omit. No fake logos. | Primary CTA destination written as `/get-started` **or** the Start Trial flow. |
| `docs/commercial/12_MARKETING_WEBSITE.md` | Short note that the production marketing surface is Experience V3 (Phase 55B). | Current relative to the app routes | Copy source of truth is `docs/commercial/`. Routes live in `src/app/(marketing)/`. Primary CTA `/start-trial`. Authenticated product remains `/today`. Social proof stays placeholder until a design partner approves. | Does not resolve `/start-trial` vs `/get-started`. Growth README still names `/get-started`, `/subscribe`, `/activate`, `/value`. |
| `src/app/(marketing)/` and `src/components/marketing/content.ts` | Implemented pages: home, product, profiles (operations, commercial, manufacturing), pricing, security, about, resources, blog, support, start-trial. | Implemented against the commercial library | Price and headlines match `02` and `03`. | Implementation is evidence the commercial library was applied to the site. It is not evidence the billing stack matches the site. |
| `docs/business/MARKETING_PLAN.md` | Beta → GA demand plan: site section table, three launch phases, LinkedIn, thought leadership, light PR, webinars, content calendar, lead magnets, SEO keywords, email, 8-week budget. | Beta-era | Objective: 30 qualified conversations → 10 beta orgs → 3 paying customers → pipeline of 20 GA prospects. No paid acquisition until $500k ARR. Founder LinkedIn is the primary channel. Homepage CTA in this file is “Request beta access.” Pricing page “matches Stripe plans.” Budget about $3,800 (Sales Navigator $800, design $500, paid test $1,000, PR $1,500). SEO agency deferred until $30k MRR. | Phase timing (stealth weeks 1–4, controlled launch weeks 5–8, GA week 12–16) is a plan, not a record that it happened. Hero copy here (“specialist AI advisors”) differs from the commercial home headline. Lead magnets and ROI calculator are listed; they are not in the repo as finished assets. |
| `docs/customer/EXECUTIVEOS_CUSTOMER_JOURNEY_BLUEPRINT.md` Parts 3 and 10 | Experience spec for landing, industry pages, pricing, security, ROI, stories, FAQ, and a full email system. | Experience spec | Pricing page should make editions comparable, with no buried overages. Email set includes welcome, trial, weekly summary, monthly ROI, renewal, upgrade, referral, cancellation, win-back. | Industry pages in the blueprint are “Field Services, B2B Services, etc.” The website blueprint’s industry expression is three profiles, not those industry URLs. The email system is specified and not evidenced as built. |
| `docs/commercial/04_BRAND_GUIDELINES.md` | See §1. | Declared current | Governs how the site may sound. | — |

**Marketing decisions that are established in the commercial library and reflected on the site**

- Public list price is the AUD three-package model.
- Trial CTA is the primary action.
- No logos until a partner approves.
- Profile pages exist for Operations, Commercial, and Manufacturing.

**Marketing decisions that remain open**

- Beta waitlist (“request access”) versus open 30-day trial. Both are written. The site implements the trial CTA.
- Whether industry pages beyond the three profiles will exist.
- Content calendar, webinars, and the $3,800 budget are plans without a results record.

---

### 12. Customer onboarding and success

| Document | Purpose and summary | Status | Decisions already in the file | Gaps and tensions |
|----------|---------------------|--------|-------------------------------|-------------------|
| `docs/commercial/07_CUSTOMER_SUCCESS.md` | 30/60/90-day journey, adoption definition, health bands, expansion, renewal, executive reviews. | Declared current as a CS outline | Day-1 success: Command Centre opened, three outcomes, one decision. Adoption: executive opens the intelligence surface ≥4 days/week and can name what required attention. Health: WAEx ≥70% healthy, 40–69% at risk, under 40% critical. Reviews at day 30, 60, 90, then quarterly for Team/Enterprise. CS teaches Organisation Portal and does not remain shadow-admin for healthy accounts. | Targets are “aspirational” and then “align with beta metrics,” which use a different WAEx definition (see below). |
| `docs/business/ONBOARDING_PLAYBOOK.md` | Day 0 through an 8-week activation for beta. | Beta-era | Owner is the founder for beta, CS at v1.0. Success: Intelligence Center ≥4 days/week and ≥1 decision by week 2. Day 1 includes connecting Microsoft 365. Week 1 goal includes a graph of ≥20 nodes. Homework is artefact-heavy (decisions, initiatives, memory). | Connector-first and graph-population homework conflicts with design-partner export-first onboarding and with the commercial rule that connectors must not block first value. |
| `docs/design-partner/DATA_ONBOARDING.md` and `PILOT_PROVISIONING.md` | The procedure actually written for the first pilot. | Operationally current | Forecasting upload, snapshot, then Command Centre. Manual accounts. | This is onboarding for one use case. It does not cover Operations or Commercial self-serve. |
| `src/onboarding/docs/README.md` | Discovery engine: welcome → minimum questions → connect → validate → first brief. | Product note | Under 15 minutes to first briefing. Learning banner for 30 days. | “Under 15 minutes” vs customer-journey “five minutes” vs commercial “≤5 minute provisioning target.” Three time promises. |
| `docs/onboarding/docs/DISCOVERY_GUIDE.md` | Exists beside the discovery engine (product discovery, not a commercial playbook). | Product | — | Not a customer-success plan. Listed so it is not mistaken for the CS playbook. |
| `docs/customer/EXECUTIVEOS_CUSTOMER_JOURNEY_BLUEPRINT.md` | Full lifecycle including renewal and exit. | Experience spec | Renewal at T-90, T-60, T-30, T-14. Exit includes export and a dignified cancellation. Expansion suggested from engagement and Executive Value Score, not a cold upsell inside the Brief. | EVS is an experience concept. Commercial CS docs centre WAEx and NPS and do not define EVS thresholds for expansion. |
| `docs/business/METRICS.md` | North star, activation, engagement, retention, expansion, outcomes, business targets, ownership. | Beta-era; only full KPI dictionary | North star name: Weekly Active Executives. Definition in this file: unique executives who open Intelligence Center **≥1× per week**. Beta target ≥80% by week 8. GA ≥70% at day 90. NRR ≥110% year 1. CoS time saved ≥3 hours/week. NPS ≥40 at beta exit. | The same file’s engagement table asks for **≥5** Intelligence Center opens per week per active executive in beta and **≥4** at GA. Commercial CS uses ≥4 opens as the adoption definition and ≥70% WAEx as healthy. Design-partner metrics do not use WAEx at all. One acronym, three thresholds. |
| `src/commercial/README.md` | Internal commercial module: editions, licences, implementation, success plans, ROI, renewals. Admin route `/admin/commercial`. | Engineering note | Customer-facing PLG lives in `@/growth`, not in this module. | Confirms two packaging systems by design (“distinct from internal `@/commercial`”). |
| `src/growth/README.md` | Trial, checkout, activation, Executive Value Score. | Engineering note | Five-minute activation path. Value figures must stay explainable. | Aligns with the journey blueprint’s five minutes. Checkout prices do not align with the marketing site. |

---

### 13. Revenue model and financial projections

There is **no** financial model, unit-economics workbook, hiring cost plan, or board pack in the repository. The figures below are targets written inside the beta-era operating documents. They assume the USD seat business, founder-led sales, and a 10-org beta that converts three logos.

| Figure | Where stated | What it assumes |
|--------|----------------|-----------------|
| Beta MRR $0 | `docs/business/METRICS.md` | Beta is free (see beta discount table). |
| Day-90 MRR ≥ $1,500 **or** 3 LOIs | `docs/business/CEO_PLAYBOOK.md` | A small number of cheap seats, or letters of intent in place of cash. |
| GA month-6: 15 paying customers, $25k MRR, $18k ACV, CAC under $5k, sales cycle ≤45 days for primary ICP, pipeline coverage 3× | `docs/business/METRICS.md` | ACV of $18k matches a Professional/Executive annual seat plan, not AUD Team (~AUD $24k/year at $1,995) and not production at AUD $78k–$90k/year. |
| NRR ≥110% in year 1; seat expansion ≥15% per quarter; plan-upgrade rate ≥10% per quarter | `docs/business/METRICS.md` | Seat and plan-upgrade motion from the four Stripe plans. |
| v1.0 GA: 15 paying orgs, NPS ≥40, WAEx ≥70% at day 90, SOC 2 Type II **engaged** | `docs/business/ROADMAP.md` | Conflicts with the design-partner ban on SOC 2 claims until evidenced. |
| v1.5: NRR ≥110%, Executive plan ≥30% of paid orgs | same | “Executive plan” is the $349 tier. |
| v2.0: $1M ARR, 5 Enterprise logos, Enterprise ACV ≥ $80k | same | $80k floor also appears in business enterprise licensing. |
| v3.0: $5M ARR, category recognition, Microsoft and Salesforce ISV partnerships | same | Partnerships are a success criterion, not a signed plan. |
| Deck: 10 beta orgs, $18k ACV, path to $5M ARR | `docs/business/CEO_PLAYBOOK.md` | Fundraising narrative. File says use it only if raising, and that beta is not revenue proof. |
| Paid acquisition after ~$500k ARR | Marketing plan and GTM strategy | Shared threshold. |
| Marketing hire at $30k MRR; CS at 15 paying orgs | CEO playbook | Headcount gates. |
| AE at $500k ARR | Business sales playbook | Different from the CEO playbook’s “3 paid + 20 demos/month.” |
| Beta marketing spend ~$3,800 over 8 weeks | Marketing plan | The only costed marketing budget. |
| Primary ICP approves $15–40k ACV without board involvement | Business ICP | Written against seat plans. |

`docs/commercial/` contains **no** ARR, MRR, ACV, CAC, or NRR targets. `docs/product/PRODUCT_STRATEGY.md` success metrics are product outcomes (time saved, decision quality), not a forecast.

Internal analytics (`src/operations/analytics/commercial.ts`) can *compute* an MRR number from licences, using yet another price table. That is an instrument, not a forecast, and it will not match Stripe or the website.

---

### 14. Commercial assumptions and outstanding decisions

Assumptions that documents rely on and do not test:

| Assumption | Where it is doing work | Why it is still an assumption |
|------------|------------------------|-------------------------------|
| Executives will open the product ≥4 mornings a week if the brief is proactive | CS, beta, demos | Phase 70 habit and value scores are NOT ESTABLISHED. No pilot metrics file contains a measured WAEx. |
| A Chief of Staff’s reclaimed hours pay for the product | Both sales playbooks, business pricing ROI | Loaded rates differ ($75–$90 vs an unspecified “conservative” rate). The price being paid for differs by an order of magnitude, so the ROI multiple changes with the price book. |
| Microsoft 365 is the default system of record for the ICP | Business ICP, onboarding playbook, anti-ICP | The manufacturing pilot is specified to work without it. |
| One profile is enough to land | Commercial pricing | Additional-profile price is explicitly unwritten. Enterprise “may” include multi-profile only when product supports it, and the product note says the manufacturing profile id is absent. |
| Self-serve card checkout is the Individual/Team path | Commercial pricing and GTM | Stripe plans are different SKUs. Growth checkout invoices a flat 7,500. Design-partner provisioning is manual. |
| No implementation fee is sustainable | Commercial library | Business enterprise licensing still prices professional services at $200/hour and a paid pilot. No cost-to-serve is documented. |
| Ten design partners can be recruited from the founder network, LinkedIn, and PE ops | Beta program | No pipeline record, no filled-slot record. |
| Two case studies will exist before GA marketing | GTM, beta, commercial design-partner doc | Phase 70 forbids inventing executive responses. No approved quote is in the repo. Social proof on the site is specified to stay empty. |
| “No training on customer data” can be said in sales | Business ICP objections, customer journey security section | Design-partner security posture limits claims to what is evidenced. Commercial design-partner doc says “no training claims beyond contractual reality.” The contract itself is not in the repo. |
| English-first AU/UK/US is the near-term market | GTM and vision | ICP revenue band may be USD or AUD depending on the file. No territory plan, tax, or invoicing entity is documented. |
| Manufacturing pack is sellable now | Marketing profiles, demo playbook, commercial narrative | Pilot docs: forecasting only; several headline manufacturing decisions are future modules; profile id not in the catalogue. |
| Beta discounts (50% / 60% / $249 lock) are available | Business pricing | Commercial design-partner doc forbids standing discounts in marketing and says record consideration per deal. |
| SOC 2 will be in motion by GA | Business roadmap success criteria | Forbidden as a claim until true. No engagement letter or timeline document exists. |

**Outstanding decisions (posed in the documents, not closed)**

1. Which price book is allowed to be quoted, implemented, and put on the website. The commercial README asserts one answer. Code and the business file record three others.
2. Exact annual discount. Commercial text says confirm at quote time.
3. Price of a second profile or a second pack.
4. Design-partner commercial consideration: free, discounted, or paid pilot. Three answers exist (free 8 weeks plus 50% year 1; list price zero with unnamed preferential terms; 30-day free trial then card).
5. Trial length: 14 days (growth card), 30 days (commercial and pilot clock), 8 weeks (beta).
6. Whether Enterprise has a list floor ($15,000/month in code, $80k ACV or $999/month in the business file) or is always custom.
7. Whether implementation is free, included in a platform fee, or sold as professional services.
8. First wedge: CoS-led B2B SaaS on M365, or manufacturing forecasting from exports, or field service via Simpro.
9. Whether Manufacturing is a profile a customer can buy this quarter.
10. Category name used in public: EIP, DecisionOS, or the operating-system line.
11. When an AE, a CS hire, and a marketer are justified (two different AE triggers are written).
12. Whether the company is raising, and on which ACV story. The CEO playbook treats fundraising as optional and ties the deck to $18k ACV.
13. Data-residency premium (15% in the business file, “as product allows” in the vision, custom in Enterprise packaging).
14. What “GA” means relative to Phases 63–70. No document maps the phase numbers onto Release 1.0.

---

## Decisions already established

These are decisions that more than one later document repeats, or that a governing document states and later commercial files do not try to overturn. They are listed as **established in the writing**. Several are not yet true in billing code or in pilot evidence.

### Company and category

- The company is Braltiq. The product is ExecutiveOS.
- The philosophy line is **Confidence Through Clarity**.
- The product is positioned as infrastructure for executive judgement, above systems of record, and not as a replacement for Microsoft 365, Salesforce, Simpro, Dynamics, ERP, or MES.
- AI and any Council or advisor prepare judgement. The accountable person decides. Marketing must not say the product runs the company.
- The Constitution (20 July 2026) sets the position line as “the operating system for executive decision making” and the category as Executive Intelligence Platform. The commercial library sells under that category name.

### What is sold, in the commercial library’s own terms

- Customers are told they buy Executive Intelligence, expressed as a profile, not a list of integrations.
- The marketed packages are Individual Executive, Executive Team, and Enterprise.
- The marketed currency and list prices are AUD $495 / AUD $1,995 / custom.
- The marketed trial is 30 days, with no setup fee and no implementation fee, and card purchase for the first two packages.
- One profile is included. Operations, Commercial, and Manufacturing are the three named choices.
- Expansion, when it is sold, is more executives, more profiles, or Enterprise. It is not a connector catalogue.
- Public pages already use this story (`src/components/marketing/content.ts` and `src/app/(marketing)/`).

### How it is sold

- Founder-led sales first. Paid acquisition waits until roughly $500k ARR.
- Geography named for the near term: Australia, United Kingdom, United States. English-first.
- Discovery before demo. One profile per demo. Command Centre is the opening surface.
- Social proof, logos, and case studies require approval. The site is instructed to omit them until then.
- Design partners are a small cohort, not an open-ended free consulting offer, and they do not receive a custom Core.
- There is no Hitachi-specific product. Customer identity is tenant configuration.

### Pilot truth constraints (August 2026)

- A manufacturing design-partner pilot is specified as Excel/CSV forecasting through the Universal Data Gateway, then an Executive Snapshot, then Command Centre.
- Live ERP and the inventory, production-capacity, dealer-demand, and working-capital modules are documented as **not active**.
- Security claims are limited to what the security posture file allows. SOC 2 and ISO 27001 must not be claimed.
- A live executive validation protocol exists. A live session result does not.

### Explicitly rejected

- On-premise, in the beta and commercial qualification rules.
- Marketing unshipped autonomy as current product.
- Forking Core for a logo or an industry.
- Fake customer logos.
- Dark-pattern or hype language (“revolutionary,” “magical,” “AI-powered” as decoration).

---

## Commercial decisions discussed but not formally documented

“Formally documented” here means written as an adopted decision in `docs/commercial/` or an equally explicit decision record. The items below are present as code, as a draft, as a per-deal escape hatch, or as an exploration.

| Topic | Where it was discussed | What is missing |
|-------|------------------------|-----------------|
| AUD platform fees of $4,500 / $7,500 / $15,000 per month, with seat prices and a five-seat included assumption | `src/commercial/pricing/catalog.ts`, sales-enablement FAQ, growth checkout | No strategy document adopts or rejects this book. The commercial pricing doc does not mention it. |
| Internal MRR weights (design partner $2,500, production $8,500, enterprise $18,000, fallback $4,000 or $5,000) | `src/operations/analytics/commercial.ts` | No finance note. The weights disagree with the catalog they sit beside. |
| Flat invoice of $7,500 / $78,000 on every paid activation | `src/growth/subscriptions/store.ts` | Not described as a billing rule. |
| 14-day Starter trial | Growth checkout highlights | Not in the commercial trial policy. |
| Standing beta discounts: 8 weeks free, 50% year 1, extra 10% for a case study, $249/month logo lock for 24 months | `docs/business/PRICING.md` | Commercial design-partner doc says do not invent standing discounts and to record terms per deal. No per-deal term sheet template exists. |
| Enterprise building blocks: $80k ACV floor, $25–40 extra seats, AI overage, $200/hour services, 15% residency premium, 90-day pilot at 50% ACV | Business pricing | Commercial Enterprise is “custom” with no schedule. |
| Professional-services implementation despite “no implementation fee” | Business enterprise table vs commercial library | Unresolved. The commercial doc says never negotiate a waiver of a fee that is already zero, which leaves no place for the $200/hour line. |
| Field service as a packaged segment (Simpro + M365, operational mid-market) | Operations edition registry | Not in the GTM industry list or the ICP. |
| Second-profile and extra-pack SKUs | Commercial pricing “future” section | Direction only. No price, no entitlement rule, no timeline. |
| Exact annual discount | “~17%, confirm at quote” | No confirmed figure. Business file uses ~20% because that is what `007_billing.sql` encodes on the USD plans. |
| Willingness-to-pay tests | Business pricing “hypotheses to validate in beta”; design studio questions about paying $349 or a $499 instrument price (`docs/design/studio/`) | Marked as tests or explorations. No result is recorded. The $349 and $499 figures must not be treated as list prices. |
| Manufacturing executive as a licensable profile id | Marketing and commercial docs assume it; pilot model says the catalogue entry is not implemented | No decision record that says “sell the name, deliver operations_executive” or “do not sell Manufacturing until the id exists.” |
| Hitachi commercial terms | Demo close and journey slide 14 | Relationship intent only. No proposal. |
| Fundraising and the $18k ACV story | CEO playbook “if raising” | Optional. No round size, use of funds, or timeline. |
| AE, CS, and marketing hire triggers | CEO playbook and sales playbook | Two AE triggers. No approved headcount plan. |
| Email programs, ROI calculator, CoS PDF, webinars | Marketing plan and customer journey | Specified. Not present as finished commercial assets in this audit’s file set. |
| Territory, contracting entity, tax, invoicing currency policy | Implied by AUD list prices and a USD Stripe default | No billing-entity or FX decision. |
| Which WAEx definition is official | Metrics, CS, beta, demos | Discussed as if shared. The definitions differ. |
| Mapping of phase numbers (33, 52A, 55, 63–70) onto “beta” and “Release 1.0” | Scattered headers | No crosswalk. |

---

## Identified gaps

1. **Single commercial authority is declared and not enforced.** `docs/commercial/README.md` is the only file that says the business set is superseded, and only for pricing and packaging. The business README, sales playbook, and CEO playbook still instruct a founder to operate on the old book.
2. **No price-realisation record.** Nothing states what a customer has been quoted, invoiced, or has paid.
3. **No financial model.** Targets exist. A build-up from price × logos × discount × churn to cash does not.
4. **No win/loss or pipeline record.** CEO playbook specifies spreadsheet columns. The spreadsheet is not in the repo.
5. **No approved customer evidence.** Case-study ambition is repeated. Phase 70 is empty of a participant. The website is instructed to show no logos.
6. **ICP is not the pilot.** The scored ICP is a M365 mid-market CoS office. The operational pilot is manufacturing forecasting from a file. Field service is packaged in code and not chosen in GTM.
7. **Manufacturing offer is ahead of the module map.** Market and demo language covers factory, dealer, inventory, and capital. The expansion model allows forecasting only.
8. **Enterprise offer is a word.** “Custom” has no written schedule of what is included, what is extra, or what security artefacts can be handed to a CISO without violating the security posture.
9. **Support and success economics are unspecified on the current list price.** SLAs and CSM ratios exist only on the USD seat plans.
10. **Onboarding has three incompatible first runs:** M365 plus graph homework (business), five-minute discovery (journey and growth), and spreadsheet snapshot (design partner).
11. **Metric dictionary is split.** WAEx, time-to-value, and “would you start here?” are not tied together, so a pilot cannot yet be scored against the CS health model.
12. **Competitive set is incomplete for the manufacturing motion** and stale for the SaaS motion (no date, no sources, prices tied to the old comparison).
13. **Industry research is not a segment plan.** Twelve industry papers and a Hitachi slide that names six future industries could be misread as a roadmap of markets.
14. **Legal and trust pack is incomplete.** No MSA, DPA, subprocessors list, or retention schedule is in the commercial library. The security posture file says retention is not configured.
15. **Partner program is a paragraph.** Fractional CoS, SIs, Microsoft, and PE operating partners are named as intents with guardrails, without terms.
16. **Phase-to-release crosswalk is missing,** so “GA,” “Release 1.0,” “Phase 55 website,” and “Phase 70 validation” cannot be ordered by a reader without inference.

---

## Conflicting or outdated assumptions

### Price and currency

| Topic | Statement A | Statement B |
|-------|-------------|-------------|
| List price | Individual AUD $495 and Team AUD $1,995 (`docs/commercial/02`, marketing site) | Starter $49, Professional $149, Executive $349, Enterprise $999 USD (`docs/business/PRICING.md`, `007_billing.sql`) |
| Same product, third book | Commercial module: pilot AUD $4,500, production AUD $7,500, enterprise AUD $15,000 per month | Ops analytics MRR: production 8,500, enterprise 18,000 |
| How to talk about Copilot’s price | Commercial file: do not win by being cheaper per seat | Business file: Professional at $149 is half the price of ten Copilot seats and a 20× ROI |
| Implementation fee | None, and do not negotiate a waiver (`docs/commercial`) | Enterprise professional services $200/hour and a 90-day pilot at 50% ACV (`docs/business/PRICING.md`) |
| Trial length | 30 days | 14 days on the growth Starter card; 8 weeks free in the beta offer; 30-day pilot clock in `PILOT_MODEL.md` |
| Annual discount | About 17%, confirm at quote (AUD packages) | About 20% encoded on USD plans; 25% for a two-year Enterprise prepay in the business file |
| Design-partner price | Per-deal consideration; do not publish a standing discount | Free for 8 weeks, then 50% or up to 60% off year 1, plus a $249 lock |
| Enterprise price | Custom | $999/month or $80k ACV floor, and also AUD $15,000/month list in code |

### Who the customer is

| Topic | Statement A | Statement B |
|-------|-------------|-------------|
| Employee band | 200–2,000 primary ICP | Product strategy: solo 1–10 is valid; mid-market is 100–1,000; enterprise is 1,000+ |
| Solo founders | Anti-ICP under 20 employees | Solo edition and Individual Executive are land motions |
| Microsoft 365 | Required for the ICP and for beta admission | Optional for first value; manufacturing pilot needs no live system |
| First industry | B2B SaaS slots 1–4 of the beta | GTM priority 2 and the only operational pilot are manufacturing; Operations edition code targets field service |
| Revenue band currency | $50–500M with no currency in the ICP | “AUD $50–500M” in the commercial sales playbook |

### Offer and product reality

| Topic | Statement A | Statement B |
|-------|-------------|-------------|
| Manufacturing profile | A profile the website sells | Catalogue id not implemented; pilot provisions `operations_executive` |
| Dealer, inventory, factory, working capital | The Hitachi and Manufacturing demo | Not active. Stop condition still in force after Phase 63 |
| Advisors | “Ten specialist advisors” in beta positioning and UVP | Commercial story leads with a five-role Council plus pack advisors |
| Category label | EIP in GTM | DecisionOS in the long narrative; both claimed as the precise name |
| Vertical products | Commercial profiles are how you buy | Product strategy: do not ship a separate “for Sales” identity; vertical depth stays inside one OS |
| SOC 2 | GA success criterion includes Type II engaged | Forbidden claim until evidenced |
| Beta program status | “In progress,” Week-1 instrumentation still “required” (`docs/business/ROADMAP.md`) | Design-partner phases through 70 are written, dated 23 August 2026, and the live session is still unrun |
| Readiness | `BETA_READINESS.md`: GO for controlled commercial deployment | Pilot access: AMBER pending production setup; Phase 70: value not established |
| Provisioning time | ≤5 minutes commercial target; 5 minutes in the journey; 15 minutes in discovery-engine docs | Pilot provisioning is a manual Supabase and out-of-band password procedure |
| WAEx | ≥1 open per week is the north-star definition | ≥4 or ≥5 opens per week is the engagement target and the CS adoption definition |
| Default leadership SKU | GTM: Team is the default leadership SKU at GA | Business land motion: Professional via the CoS; Starter is the PLG top |
| Checkout amount | Plan chosen by the buyer | Growth activation writes 7,500 / 78,000 for every paid plan id |

### Time and ownership

The business roadmap draws Beta in 2026 Q2, GA in Q3, v1.5 in Q4, v2.0 in 2027 H1. This audit is dated 1 November 2026 (Australia/Brisbane). The commercial and pilot documents were last committed on 23 August 2026 and still speak in “beta now” and “week 1 of 8” language, even though product commits continued until 5 October 2026. Treat that calendar as a plan that was not updated after the design-partner work, not as a status report for November 2026.

---

## Recommended commercial priorities

These are priorities for the **next documentation pass**. They are not new strategy, and this audit does not choose the price or the wedge.

1. **Name one price book in force.** State, in `docs/commercial/02_PRICING_AND_PACKAGING.md` or a short decision note beside it, whether AUD $495 / $1,995, the USD seat plans, or the AUD $4,500 / $7,500 / $15,000 book is what sales may quote. Point the other documents at that choice and mark them historical. Until that sentence exists, the website, Stripe, and the sales FAQ will keep disagreeing.
2. **Write the design-partner commercial term that is actually on offer.** Duration (30 days or 8 weeks), price (zero, discounted, or pilot list), what “preferential conversion” means, and what is withheld (Core forks, inactive modules). One page. Per-deal variation can sit under it; it should not replace it.
3. **Align the manufacturing story with the expansion model.** Either the demo and the Manufacturing profile page describe forecasting-only value, or a decision record says which additional modules are allowed in a sales meeting. The stop condition in `EXPANSION_MODEL.md` and the Hitachi script cannot both be briefed as current.
4. **Decide the first ICP in one paragraph.** Mid-market CoS on Microsoft 365, manufacturing OEM forecasting, or field service. Keep the others as later segments. The scored ICP, the beta slot plan, the GTM priority list, and the pilot README currently describe different first customers.
5. **Do not build a forecast on $18k ACV until the price book is chosen.** The month-6, $1M, and $5M figures are internally consistent only with the beta seat plan. Re-basing them is a later exercise; using them in a deck now would repeat a superseded price.
6. **Hold customer-evidence claims to Phase 70.** No case study, NPS, or “would you start here” number should be written as fact until a live session is recorded in the scorecard that already exists for that purpose.
7. **Publish a one-page security claim sheet taken from `SECURITY_POSTURE.md`.** Sales objections currently answer with RLS, no-training, and SSO language that the posture file does not fully support.
8. **Crosswalk phases to the commercial roadmap.** A reader needs to know whether Release 1.0, the Phase 55 site, and the Phase 63–70 pilot are the same moment. They are documented as if they might be, without a map.
9. **Leave industry research and brand explorations labelled as non-decisions.** They are valuable. They are not a GTM commitment. The Hitachi future-industry slide should stay a discussion prompt.
10. **After the price and the pilot term are chosen, update only the documents that would otherwise mislead a seller:** business README status, business pricing and sales playbook headers, CEO playbook MRR line, and the growth/checkout figures. That update is outside this audit.

---

## Appendix A — Document map by authority

| Authority the file claims | Location | Use it for | Do not use it for |
|---------------------------|----------|------------|-------------------|
| Canonical GTM story and list price | `docs/commercial/` | Narrative, site, sales language, declared AUD $495 model | Evidence that billing matches, or that manufacturing modules beyond forecasting are live |
| Beta operating system | `docs/business/` | ICP detail, competitor longlist, metric definitions, founder weekly rhythm, the fact that numerical targets were once set | Current price, current pilot shape, SOC 2 status |
| Pilot truth | `docs/design-partner/`, `docs/validation/PHASE_63_DESIGN_PARTNER_READINESS.md` | What a manufacturing pilot may claim in August 2026 | A customer logo or a measured ROI |
| Constitution and philosophy | `docs/architecture/EXECUTIVEOS_CONSTITUTION_v1.md`, `docs/foundations/`, `docs/product/PRODUCT_STRATEGY.md` | What the product is allowed to become | Price, ICP firmographics, Hitachi terms |
| Experience standard | `docs/customer/EXECUTIVEOS_CUSTOMER_JOURNEY_BLUEPRINT.md`, `docs/product/EXECUTIVE_EXPERIENCE_BLUEPRINT.md` | Lifecycle and tone of onboarding, renewal, email | A price or a support SLA |
| Named-account narrative | `docs/demos/HITACHI_*.md` | How a Hitachi conversation is meant to feel | A commercial agreement |
| Research | `docs/research/industries/`, `docs/research/executives/` | Future pack and Council depth | Target-market selection |
| Brand exploration | `docs/design/studio/01-brand-positioning.md`, studio price musings | Rejected or unadopted directions | List price or category decision |

## Appendix B — Price books side by side

Amounts are monthly unless noted. Currency is stated only where the source states it.

| Package idea | Commercial library and website | Stripe `plans` (USD cents → dollars) | Commercial catalog (AUD) | Growth checkout `monthlyFrom` | Analytics MRR weight |
|--------------|--------------------------------|--------------------------------------|---------------------------|--------------------------------|----------------------|
| Free evaluation | 30-day trial | (not a zero plan; limits live on paid plans) | trial $0; design_partner $0 | Starter highlight says 14-day trial | trial $0; design_partner $2,500 |
| Entry paid | Individual Executive AUD $495 | Starter $49, 3 seats | Pilot $4,500 | Starter $990 | pilot $4,500 |
| Team / mid | Executive Team AUD $1,995 | Professional $149, 10 seats; Executive $349, 25 seats | Production $7,500 | Professional $4,500; Executive $7,500 | production $8,500 |
| Enterprise | Custom | Enterprise $999, 999 seats | $15,000 list | $15,000 | $18,000 |
| Annual | ~2 months free, unconfirmed | ~20% off (470 / 1,430 / 3,350 / 9,590 dollars) | Pilot $45,000; production $78,000; enterprise $156,000 | Invoice hard-coded $78,000 when annual, any plan | Not specified |
| Extra seats | Not a priced line on Individual/Team; Enterprise true-up | Included seat caps; overage policy draft only | $250 / $320 / $280 per seat after 5, by tier | Not in the card | Not specified |

## Appendix C — Reviewed and not treated as commercial strategy

These were read enough to confirm they are not commercial decision records:

- Product specifications `docs/specifications/PRODUCT_SPEC_001`–`006` (experience and engine spec).
- Architecture ADRs and domain model.
- Intelligence-pack manufacturing catalogues (decisions, KPIs, scenarios) beyond the blueprint overview cited above. They define industry vocabulary for a pack. They do not set price or a target account.
- Provider runbooks (Simpro, Salesforce, Microsoft 365).
- Release checklists, known issues, and technical-debt registers, except `BETA_READINESS.md`.
- Workshops 16 and 17 (experience).
- `docs/design/studio/` other than brand-positioning and the competitor-experience and price-exploration notes cited above.
- Validation phases 57–62 (product validation). Phase 57 is “commercial export” in the data sense (a Salesforce opportunity export fixture), not a pricing document.

---

*Audit only. No commercial decision in the repository was changed by this document.*
