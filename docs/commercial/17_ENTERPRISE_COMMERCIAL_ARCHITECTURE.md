# 17 — Enterprise Commercial Architecture

**Braltiq · Commercial strategy · Working draft 1.0**  
**Status:** Founder approval required. Nothing in this paper is a price in force.  
**Date:** 2 November 2026 (Australia/Brisbane)  
**Built from:** the founder draft of this architecture, [`15_INDUSTRIAL_ICP_TARGET_ACCOUNTS_AND_UNIT_ECONOMICS_ANALYSIS.md`](./15_INDUSTRIAL_ICP_TARGET_ACCOUNTS_AND_UNIT_ECONOMICS_ANALYSIS.md), and [`16_MANAGED_INTELLIGENCE_SERVICES_STRATEGY.md`](./16_MANAGED_INTELLIGENCE_SERVICES_STRATEGY.md).  
**The source draft ended mid-sentence in the Advanced package.** Sections from that point are completed from those two papers. Where this draft changes an earlier recommendation, the change is marked and left unresolved.  
**Does not change:** application code, checkout, billing, the website, or any document that currently claims to be the price list.  
**Model:** [`models/industrial_unit_economics.xlsx`](./models/industrial_unit_economics.xlsx), sheet `OfferArchitecture`. Yellow cells are the order being tested. GST is not in the sheet.

Prices below are proposed **exclusive of GST**. Whether GST is added on the invoice depends on registration and the customer’s place of supply. That status is not in the repository. **Missing.** Do not print these numbers as GST-inclusive until finance confirms it.

---

## 1. Commercial philosophy

ExecutiveOS is an Enterprise Executive Intelligence Platform.

It sits above existing business systems and converts organisational information into executive intelligence, evidence-backed decisions and measurable business outcomes.

The commercial model is designed around five objectives:

1. Generate predictable, high-value recurring SaaS revenue.
2. Acquire enterprise customers through a focused, repeatable industrial use case.
3. Expand customer value through additional entities, capabilities and optional services.
4. Maintain SaaS gross margins of 80–85% or higher.
5. Avoid becoming a labour-intensive consulting or implementation business.

**Core principle.** We sell the platform as software. We sell Managed Intelligence separately as a defined professional service.

The customer must always be able to distinguish what they are paying for in each line.

The first use case remains manufacturing forecast intelligence from the customer’s own file. Capabilities that the design-partner documents mark as not active are not part of any line on the order.

---

## 2. The commercial architecture

ExecutiveOS has five commercial components.

| Component | Revenue type | Purpose |
|---|---|---|
| ExecutiveOS Platform | Recurring SaaS | Core software subscription |
| Managed Intelligence | Recurring managed service | Structured intelligence oversight and executive support |
| Pilot / Design Partner | Fixed-term engagement | Validate a defined use case and establish commercial value |
| Onboarding / Activation | One-off fee, or an inclusion whose cost is shown | Standard customer setup and activation |
| Enterprise Expansion | Recurring SaaS, and optional services only if bought again | Additional entities, and later capabilities once they exist |

These components are separately identifiable in proposals, order forms, contracts, invoices and the management accounts.

No component is included in another fee unless its direct cost and its effect on margin have been modelled. Inclusion at a zero price is still a cost. It is shown as its own line with a fee of zero and a cap, not omitted.

### How a proposal is laid out

| Line | What the customer sees | What we record |
|------|------------------------|----------------|
| 1. Platform — initial operating entity | The monthly rate, the annual commitment, and the invoice amount | Platform SaaS |
| 2. Platform — each additional entity | The incremental rate, and a statement that it does not include service hours | Platform SaaS |
| 3. Enterprise floor, if it binds | The amount the rate card was lifted, and why | Platform SaaS. Not a service. |
| 4. Managed Intelligence, or “not taken” | Package name, monthly fee, hour cap, or an explicit decline | Service revenue, or zero |
| 5. Pilot or design partner, if this order starts there | Term, fee, hour cap, and whether the fee credits to line 1 | Its own revenue, unless credited |
| 6. Activation | “Included, capped at 12 hours” or a stated fee | Cost either way. Revenue only if a fee is charged. |

A single number on a cover page is allowed only as the sum of these lines, with the lines underneath it. A blended SKU is not.

### Management accounts

Until a chart of accounts is formally adopted, report at least:

- Platform subscription, initial entity
- Platform subscription, additional entities
- Managed Intelligence, by package
- Pilot and design-partner fees, with credits shown as a reduction of platform, not as a second sale
- Activation fees, which will be zero on the standard order

Do not post service labour against the platform account.

---

## 3. ExecutiveOS Platform subscription

### Proposed initial platform pricing

| Item | Working commercial assumption |
|---|---:|
| Initial operating entity | AUD $9,500 / month |
| Additional operating entity | AUD $3,000 / month |
| Annual commitment | 12 months |
| Annual platform payment | 11 months charged |
| Annual platform invoice, first entity | AUD $104,500 |
| Enterprise minimum | AUD $15,000 / month — unresolved. Interpretation below. |

All of these remain subject to founder approval. They are the working assumptions already tested in the industrial paper. They are not a published list.

The 11-month concession applies to the platform only, including additional entities and a floor-adjusted platform rate. Managed Intelligence does not receive a free month. The workbook applies `annual_months_paid` (11) to the invoiced platform monthly rate.

### What the platform subscription includes

For **each** operating entity on the order:

- The manufacturing forecasting workspace that the product can actually run, from the customer’s file, on the weekly upload path.
- Up to **8** named executive users for that entity.
- Up to **2,000** small-model completions a month for that entity. Unused completions do not roll over. A larger model is not included.
- Weekly refresh when the customer uploads.
- Standard hosting, product updates, and maintenance.
- Standard platform support inside a **one-hour-a-month** cap for the account, not one hour per entity. The hour is for product use. It is not a meeting and not a written intelligence note.
- Standard product documentation.

These allowances are the entitlement model the earlier papers used as a hypothesis. They are the definition this draft adopts for testing. They are not enforced in billing yet.

### What the platform subscription does not include

- Managed Intelligence meetings, notes, or hours.
- A dedicated analyst or consultant.
- Bespoke reports outside what the product already produces.
- Custom software development.
- Bespoke integrations.
- ERP implementation.
- Data-cleansing projects.
- Running the customer’s operation or their S&OP process.
- Travel or on-site time.
- Unlimited AI usage or processing.
- A second entity’s service hours, user stories, or a private success manager.

An additional operating entity is another software tenant of the same product: its own file, its own users, its own completion allowance. It does not automatically include Managed Intelligence.

### The AUD $15,000 floor

**Recommended interpretation, still to be approved.**

- AUD $9,500 is the initial single-entity platform price. A first customer is not lifted to $15,000 for being a large company.
- AUD $3,000 is the incremental platform price for each further entity.
- AUD $15,000 a month is a minimum **only when** the customer requires the enterprise contractual set and the rate card for the entities they are buying is below that minimum.

The enterprise contractual set means a multi-entity order that also asks for a security review, a named commercial term, or procurement paperwork beyond the standard annual invoice. A single entity never triggers the floor. Wanting Managed Intelligence does not trigger it either. The floor is platform revenue, not a bundle that hides service hours.

| Configuration | Rate card | Floor | Invoiced platform monthly | Annual platform invoice |
|---|---:|---|---:|---:|
| 1 entity, standard terms | $9,500 | Does not apply | $9,500 | $104,500 |
| 2 entities, standard terms | $12,500 | Does not apply | $12,500 | $137,500 |
| 2 entities, enterprise contractual set | $12,500 | Applies | $15,000 | $165,000 |
| 3 entities, either way | $15,500 | Dormant. The card is already above the floor. | $15,500 | $170,500 |

The two-entity enterprise case is a platform premium of **AUD $2,500 a month** (AUD $27,500 on the annual invoice). It buys the contractual set. It does not buy Managed Intelligence, and it does not buy a fourth entity.

If a later capability is sold as platform — and none is ready to sell — it is a new line with its own cost, not a silent expansion of this floor.

---

## 4. Managed Intelligence

### Positioning

**Braltiq Managed Intelligence** is an optional recurring service that helps an enterprise customer take more from ExecutiveOS.

It is structured human oversight of intelligence the platform has already produced. It helps them see what changed, whether the evidence is fit to use, which forecast movements matter, what deserves an executive, whether a decision has been framed, and where adoption is slipping.

The customer’s executives remain accountable for the decision and for running the business.

It is not consulting, not staff supplied into their planning team, not an outsourced S&OP, and not an implementation project. A request that a second customer could not receive from the same playbook next month is outside the service.

### Proposed packages

| Package | Monthly price | Monthly hour cap | Full-book specialist margin |
|---|---:|---:|---:|
| Essential | AUD $3,000 | 6 hours | about 70% |
| Advanced | AUD $6,500 | 12 hours | about 73% |
| Strategic | AUD $12,000 | 16 hours | about 80% |

These are the working prices from the unit-economics paper. They are not operating results. AUD $2,500 and AUD $5,000 were tested and fall short of a 65% service margin at these caps. They are not on this rate card.

Hours are a maximum. Unused hours expire at month end. They do not roll over. Travel and on-site days are never inside the fee. Further hours of the **same** work are sold only as a prepaid block of three at AUD $450 an hour, and only if the person has the month to give. An on-site day is AUD $2,500 plus travel at cost, ordered on its own line.

The service is an annual commitment, invoiced in advance, **twelve months paid**. The platform’s free month does not apply.

### Essential

For a customer who wants a light oversight rhythm.

Includes, inside 6 hours:

- A monthly intelligence review, about 45 minutes, preparation included.
- Data-quality and file-readiness review, from the product’s own checks, not a re-key of the file.
- Forecast-movement review.
- Identification of the exceptions that deserve a person.
- A one-page monthly summary.
- Standard coordination of the service itself.

Response: acknowledged in one business day, a substantive reply inside the reserve in two business days.

### Advanced

**This draft names Advanced as the preferred starting package for an enterprise customer.**

That is a change from the managed-intelligence paper, which put Essential on the order as the default and left Advanced for a heavier planning argument. Both cannot be the default. The capacity consequence is in section 8. **Founder approval decides which sentence survives.**

Includes, inside 12 hours:

- Everything in Essential.
- A structured monthly executive intelligence review. This is the same monthly room, held to a written agenda, not a second meeting.
- Forecast performance analysis: bias, repeated misses, and where the extract is too thin to support a claim.
- Review of up to two decisions framed from the evidence. Framed means the evidence, the choice, and the consequence of waiting are written down. It does not mean Braltiq makes the decision.
- A short written note after the review.
- The quarterly value review with the economic buyer, spread across the year inside the cap.

Response inside the cap: one business day.

### Strategic

For an account with more than one executive forum, or a converted design partner that wants a named person and a renewal dossier. Sixteen hours is about two working days a month. The order says that in numbers.

Includes, inside 16 hours:

- Everything in Advanced.
- Preparation for one further forum.
- The renewal dossier at the −90-day mark already described in the customer-success calendar.
- A short note on adoption and on whether a further entity is earned.
- A named specialist, once one is employed. Not a rotating inbox, and not a dedicated team.

A quarterly visit is not included. A second entity is not included.

### Customer responsibilities, every package

The file arrives on the weekly rhythm. The sponsor attends the reviews they bought. They decide. They correct a number that is wrong. They do not direct the person’s week.

### What every package excludes

Managed Intelligence does not include the platform. The platform does not include Managed Intelligence. Neither includes custom development, integrations, ERP work, data cleansing, operational management, running S&OP, travel, or unlimited model use.

---

## 5. Pilot and design partner

One component, two treatments. Both are fixed-term. Neither is a subscription and neither is Managed Intelligence.

| | Design partner | Paid pilot |
|--|----------------|------------|
| Who | The first three accounts, and no more, unless the cap is raised in writing | Every pilot after those three |
| Fee | AUD $0 | AUD $15,000 |
| Term | 30 days | 30 days |
| Delivery cap | 15 founder hours | 15 founder hours |
| What they receive | The forecasting pilot described in the industrial paper: one file, one snapshot, one review. Not the inactive modules. | The same pilot |
| What the fee becomes | Nothing. The consideration is the time, the file, and the right to discuss a case study. | A credit against the first-year **platform** invoice if they sign within 30 days of the review. It is not a discount that survives renewal, and it is not credited against Managed Intelligence. |
| If the success criteria fail | Stop | Stop. The fee is not refunded as a matter of this draft. Counsel writes the actual clause. |

The success criteria stay the ones already written: a usable file in ten days, the sponsor in the brief on at least four days in the thirty, one decision framed, an honest gap, and a yes or no on whether they would start the next cycle here. A pilot does not promise a forecast-accuracy improvement.

A design partner is not given Essential or Advanced for free after day 30. That would turn the bridge into the delivery model.

---

## 6. Onboarding and activation

Standard activation is the twelve hours already used in the industrial cost model: template, one mapping, a first snapshot, and the handover of the weekly upload. It is not an implementation project.

**Recommendation.** On the standard order the fee is **zero**, the cap is **12 hours**, and the line is still printed: “Activation — included, 12 hours, no travel.” The internal cost at the founder rate is **AUD $3,000**. That cost is inside the year-1 margin in `OfferArchitecture`. It is not absorbed invisibly.

Hours past 12 are not included. They are the same prepaid block as service overage, AUD $450 an hour, or the activation stops. We do not open a cleansing or integration project under this line.

A separate activation fee is a founder choice, not the default. Charging cost (AUD $3,000) makes the component’s own margin zero. Charging enough for a 65% margin on founder time would be about AUD $8,600, which is an implementation price and fights the fifth objective. The zero-fee, capped, visible line is the one that matches the philosophy. The cost is modelled. The customer can see the line.

---

## 7. Enterprise expansion

Expansion that can be sold now:

| Move | Which line | Rule |
|------|------------|------|
| Another operating entity | Platform, AUD $3,000 / month, 11 months charged on the annual invoice | Own file, own 8 users, own 2,000 completions. No service hours. |
| The enterprise contractual set on a two-entity order | Platform floor, lifting $12,500 to $15,000 | Only when section 3 says the floor binds. |
| Essential to Advanced, or Advanced to Strategic | Managed Intelligence | A new service line. Not a platform uplift. |
| A second entity that also wants the service | A second Managed Intelligence line | Bought explicitly. The first package does not stretch. |

Expansion that waits until a product exists, and is not written into this order as a commitment: inventory, capacity, dealer allocation, live ERP, and other industries. The commercial roadmap may discuss them. The contract for this architecture does not.

Price steps at renewal, if approved later, are separate for platform and service. The service model uses a 4% working hypothesis from the second year. The platform forecast does not yet apply an uplift. Do not quote a platform increase until it is in the order.

---

## 8. Margin of a whole order

SaaS margin and service margin stay separate. The company view adds them. It does not blend them into one product.

Platform direct cost in this architecture sheet is the reclassified figure from the unit model: about **AUD $96 a month per entity** for infrastructure, the small-model allowance, and the thin support hour, at a 25-customer allocation. It does not also include a success manager. If an account buys Managed Intelligence, those human hours are the service cost and are not charged again as platform time.

Activation at 12 founder hours is AUD $3,000, once.

| Order | Year-1 cash, before any pilot | Loaded margin if the founder delivers the service | Loaded margin if a specialist’s book is full |
|------|---:|---:|---:|
| Platform only | $104,500 | about **96%** | about **96%** |
| Platform + Essential | $140,500 | about **84%** | about **89%** |
| Platform + Advanced | $182,500 | about **78%** | about **86%** |
| Platform + Strategic | $248,500 | about **79%** | about **87%** |
| Two entities + Advanced, no floor | $215,500 | about **81%** | about **88%** |
| Two entities + Advanced, floor binds | $243,000 | about **83%** | about **89%** |
| Three entities, platform only | $170,500 | about **96%** | about **96%** |

The SaaS line itself stays well above 80–85% on every row, because the labour is not in it.

The combined order does not. **Founder-delivered Advanced on a single entity is about 78%. Founder-delivered Strategic is about 79%.** Both are under the combined band. Essential, founder-delivered, stays about 84%. A specialist at a full book clears the band on every recommended package.

That is why the earlier service paper defaulted the order form to Essential while the founder is the only person delivering, and why this draft’s preference for Advanced has a condition attached:

- Advanced can be the preferred package **offered** to an enterprise buyer.
- The founder can carry **two** Advanced accounts inside the 24-hour monthly bridge, and should expect the year-1 combined margin on a single-entity Advanced order to sit under 80%.
- The third Advanced account waits until a specialist is justified. The hire rule is unchanged: about **78 hours** of ready demand, which is roughly **seven** Advanced accounts, not two.
- Do not hire a specialist to make Advanced feel like the standard start. At five Advanced accounts the salary is real and the book is not full. The service paper already shows that pattern near a 10% margin when the hire is forced early.

`ServiceForecast36` still uses the thinner attach rates from 1 November. Adopting Advanced as the default attach is a yellow-cell change on `ServiceAssumptions`, done after this decision, not before.

Paying a platform success manager **and** a service specialist for the same account is still the double count that pulls the combined customer to the edge of 80%. This architecture does not do that.

---

## 9. What is still unresolved

| Item | Working position in this draft | What approval must say |
|------|--------------------------------|------------------------|
| AUD $9,500 and AUD $3,000 | Use them as the rate card | Yes, or replace the yellow cells and re-read `OfferArchitecture` |
| 11 months charged on a 12-month platform term | Applies to every platform line, including the floor | Confirm, or charge 12 |
| AUD $15,000 floor | Only the two-entity enterprise contractual case, among the configurations above | Confirm the trigger. A different trigger changes who pays $15,000 |
| Advanced as the preferred start | Offer it. Do not staff it as the founder’s default beyond two accounts | Or keep Essential as the default line and offer Advanced only when the planning argument is heavier |
| Activation at a zero fee, 12-hour cap | Included, costed, visible | Or set `arch_onboarding_fee` and accept the component margin that results |
| GST | Excluded from every figure here | Finance confirms registration and the invoice treatment |
| Design-partner cap of three, paid pilot AUD $15,000, credit to platform only | Unchanged from the industrial paper | Confirm before the next Hitachi or equivalent meeting |
| Service prices and caps | Unchanged from the service paper | Confirm, including that $2,500 and $5,000 are off the card |
| Entitlements: 8 users, 2,000 completions, one support hour per account | The definition of the platform fee | Confirm before an order is sent. Billing does not enforce them yet |
| Renewal increases | Not quoted | A later decision. Service model has a 4% hypothesis only |

The website prices, the USD seat plans, and the in-code catalogues still disagree with this rate card. This draft does not retire them. Quoting from them for an industrial order would break the architecture.

---

## 10. Decisions required before an order uses this paper

1. Adopt the five-line order, with a zero-price line still printed, and reject blended SKUs.
2. Confirm the platform rate card, the 11-month platform concession, and the floor rule in section 3. In particular, confirm that a single-entity customer is never moved from $9,500 to $15,000 by the floor.
3. Choose the starting service line. Advanced may be what we recommend in the room. Essential is what the founder can deliver inside an 80% combined year-1 margin. Those are different choices.
4. Confirm activation as included, capped at 12 hours, costed at the founder rate, and not an implementation fee.
5. Confirm GST treatment, the pilot credit rule, and that additional entities do not inherit Managed Intelligence hours.
