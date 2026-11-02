# 17 — Enterprise Commercial Architecture

**Braltiq · Commercial strategy · Working draft 1.0, reconciled**  
**Status:** Strategic direction below is adopted for this draft. Every price is still proposed. Nothing here is a price in force, and nothing may be quoted as approved.  
**Date:** 2 November 2026 (Australia/Brisbane). Reconciled the same day after review of this paper and the workbook.  
**Built from:** the founder draft, [`15_INDUSTRIAL_ICP_TARGET_ACCOUNTS_AND_UNIT_ECONOMICS_ANALYSIS.md`](./15_INDUSTRIAL_ICP_TARGET_ACCOUNTS_AND_UNIT_ECONOMICS_ANALYSIS.md), and [`16_MANAGED_INTELLIGENCE_SERVICES_STRATEGY.md`](./16_MANAGED_INTELLIGENCE_SERVICES_STRATEGY.md).  
**Does not change:** application code, checkout, billing, the pricing catalogue, the website, production entitlements, or any document that currently claims to be the price list.  
**Model:** [`models/industrial_unit_economics.xlsx`](./models/industrial_unit_economics.xlsx). `Forecast36` and `ServiceForecast36` are unchanged. This reconciliation adds `PlatformCost`, `CustomerMargins`, `PilotEconomics`, `RevenueReporting`, `CapacityTransition`, and `DecisionRegister`, and it rewrites the order logic on `OfferArchitecture`.  
**GST:** every figure is exclusive of GST. GST is added on the invoice where registration and the customer’s place of supply require it. That status is not in the repository.

The decision register at the end separates direction, proposed terms, unresolved items, and assumptions that still need evidence.

---

## 1. Commercial philosophy

ExecutiveOS is an Enterprise Executive Intelligence Platform. It sits above existing business systems and converts organisational information into executive intelligence, evidence-backed decisions, and measurable business outcomes.

The commercial model has five objectives:

1. Generate predictable, high-value recurring SaaS revenue.
2. Acquire enterprise customers through a focused, repeatable industrial use case.
3. Expand customer value through additional entities, capabilities, and optional services.
4. Maintain SaaS gross margins of 80–85% or higher.
5. Avoid becoming a labour-intensive consulting or implementation business.

**Core principle.** The platform is sold as software. Managed Intelligence is sold separately as a defined professional service. The customer can see each line.

The first use case remains manufacturing forecast intelligence from the customer’s own file. Capabilities the design-partner documents mark as not active are not on the order.

---

## 2. The commercial architecture

| Component | Revenue type | Purpose |
|---|---|---|
| ExecutiveOS Platform | Recurring SaaS | Core software subscription |
| Managed Intelligence | Recurring managed service | Structured intelligence oversight |
| Pilot / Design Partner | Fixed-term engagement | Validate one forecasting use case |
| Onboarding / Activation | Zero-price line, cost recognised internally | Standard setup, inside a hard cap |
| Enterprise Expansion | Recurring SaaS, and a further service line only if it is bought | Another operating entity, or a later capability once it exists |

These lines stay separate on the proposal, the order form, the contract, the invoice, and in the management accounts. A cover-page total is the sum of the lines. A blended SKU is outside this draft.

Inclusion at a zero price is still a cost. Activation is printed as its own line with a fee of zero and a cap of 12 hours. Its direct cost is recognised once. It is not folded into the monthly platform cost, and it is not added a second time in the year-1 margin.

Management accounts, until a formal chart of accounts exists, report at least:

- Platform subscription, initial entity
- Platform subscription, additional entities
- Platform floor premium, when the floor binds
- Managed Intelligence, by package
- Pilot fees, with a conversion credit shown as a reduction of the initial-entity platform invoice, not as a second sale and not as ARR
- Activation fees, which are zero on the standard order, and activation cost, which is internal

Service labour is not posted against the platform account.

---

## 3. Platform subscription

### Proposed rate card

| Item | Proposed term |
|---|---:|
| Initial operating entity | AUD $9,500 / month |
| Additional operating entity | AUD $3,000 / month |
| Commitment | 12 months |
| Platform concession | 11 months charged |
| One-entity list value (rate × 12) | AUD $114,000 — not ARR |
| One-entity net contracted platform ARR | AUD $104,500 |
| Enterprise floor | AUD $15,000 / month, on the trigger below |

The concession applies to every platform line: the initial entity, each additional entity, and a floor-adjusted platform rate. Managed Intelligence does not receive a free month.

### What one entity includes

- The manufacturing forecasting workspace the product can run, from the customer’s file, on the weekly upload path.
- Up to 8 named executive users.
- Up to 2,000 small-model completions a month. Unused completions do not roll over. A larger model is not included.
- Weekly refresh when the customer uploads.
- Standard hosting, product updates, and maintenance.
- One hour a month of platform support for the account, not one hour per entity. The hour is product use. It is not a meeting and not a written intelligence note.
- Standard product documentation.

These allowances are the definition of the fee for this draft. Billing does not enforce them yet.

The platform fee does not include Managed Intelligence, a dedicated analyst, bespoke reports, custom development, bespoke integrations, ERP implementation, data cleansing, running the customer’s operation or S&OP, travel, or unlimited model use.

An additional entity is another software tenant of the same product: its own file, its own users, its own completion allowance. It does not include Managed Intelligence hours. Buying the service does not change the platform price.

### The floor

AUD $9,500 remains the initial single-entity rate. The floor does not lift a single-entity customer, including a customer who asks for a security questionnaire or for heavier contract terms.

AUD $3,000 remains the incremental platform rate for each further entity.

AUD $15,000 a month is a platform minimum only when all three of these are true:

1. The order contains two or more operating entities.
2. The customer requires materially expanded enterprise governance, as defined below.
3. The rate card for the entities on the order is below AUD $15,000.

**Materially expanded enterprise governance** means at least one of the following, beyond the standard annual invoice and beyond a routine security questionnaire:

- A negotiated security schedule, custom data-processing terms, or a right to audit or penetration-test.
- A customer-paper contract, or liability, indemnity, or governing-law terms that have to be drafted.
- A named data-residency, dedicated-environment, or segregation requirement beyond the standard hosted tenant.
- Procurement that requires a security review meeting, a policy exception, or ongoing governance reporting.

A routine security questionnaire does not qualify. That includes a standard SIG, CAIQ, or spreadsheet answered from the published security posture, with no negotiated schedule and no audit right. Asking for that questionnaire does not change the platform price, on one entity or on several.

This draft does not invent a single-entity premium. A single-entity order that needs custom paper is accepted on the standard rate or declined. It is not moved from $9,500 to $15,000.

Managed Intelligence does not trigger the floor. The floor premium is platform revenue. It does not buy service hours and it does not buy another entity.

### Worked platform amounts

Every row shows the rate card, the amount invoiced each month, and the annual contracted platform amount (invoiced monthly × 11). List value is the rate card × 12 and is not ARR.

| Configuration | Rate card / month | List value × 12 | Invoiced / month | Annual contracted platform |
|---|---:|---:|---:|---:|
| 1 entity, standard terms | $9,500 | $114,000 | $9,500 | $104,500 |
| 1 entity, routine questionnaire | $9,500 | $114,000 | $9,500 | $104,500 |
| 1 entity, material governance | $9,500 | $114,000 | $9,500 | $104,500 |
| 2 entities, standard terms | $12,500 | $150,000 | $12,500 | $137,500 |
| 2 entities, routine questionnaire | $12,500 | $150,000 | $12,500 | $137,500 |
| 2 entities, material governance | $12,500 | $150,000 | $15,000 | $165,000 |
| 3 entities, standard terms | $15,500 | $186,000 | $15,500 | $170,500 |

On the two-entity material order the floor premium is AUD $2,500 a month, AUD $27,500 on the annual contract. Of the AUD $165,000, AUD $104,500 is the initial entity, AUD $33,000 is the second entity, and AUD $27,500 is the premium.

Three entities are already above the floor, so the floor is dormant.

The first architecture draft would have applied the floor to a two-entity order on any “enterprise terms” flag, including a routine questionnaire. That row is preserved on `OfferArchitecture` and labelled superseded. It is not a quote.

---

## 4. Managed Intelligence

Braltiq Managed Intelligence is an optional recurring service. It is structured human oversight of intelligence the platform has already produced. The customer’s executives remain accountable for the decision and for running the business.

It is not consulting, not staff supplied into the planning team, not an outsourced S&OP, and not an implementation project.

### Which package is offered

The package to recommend and the package the current delivery model can sustain are different.

| Moment | What is offered | Why |
|---|---|---|
| Founder-led delivery | **Essential is the default** | It is the package that fits the 24-hour founder bridge. Advanced and Strategic are available when the account has a real reason and the hours fit the bridge. They are not the default line. |
| Specialist capacity is funded and the person is employed | **Advanced becomes the preferred enterprise offer** | The fuller monthly review is what an enterprise buyer should be offered once someone other than the founder can carry 12 hours. |
| Either stage | **Strategic is reserved** | It is for a second executive forum, a renewal dossier, and a named specialist. It is not the starting line. |

This resolves the earlier conflict. The 2 November draft of this paper named Advanced as the preferred starting package. The managed-intelligence paper named Essential. The rule now is the table above. `ServiceForecast36` attach rates were already an Essential-weighted book. They were not rewritten.

### Proposed packages

| Package | Monthly price | Monthly hour cap | Full-book specialist margin |
|---|---:|---:|---:|
| Essential | AUD $3,000 | 6 hours | about 70% |
| Advanced | AUD $6,500 | 12 hours | about 73% |
| Strategic | AUD $12,000 | 16 hours | about 80% |

AUD $2,500 and AUD $5,000 were tested and fall short of a 65% service margin at these caps. They are not on this rate card.

Hours are a maximum. Unused hours expire. Travel and on-site days are outside the fee. Further hours of the same work are a prepaid block of three at AUD $450 an hour, and only if the person has the month. An on-site day is AUD $2,500 plus travel at cost, on its own line.

The service is an annual commitment, invoiced in advance, twelve months paid.

**Essential**, inside 6 hours, is a monthly intelligence review, a data-quality and file-readiness review from the product’s own checks, a forecast-movement review, the exceptions that deserve a person, a one-page summary, and coordination of the service. Response is acknowledged in one business day, with a substantive reply inside the reserve in two business days.

**Advanced**, inside 12 hours, is everything in Essential, held as one structured monthly executive review with a written agenda, plus forecast performance (bias, repeated misses, and where the extract is too thin), up to two decisions framed from the evidence, a short written note, and the quarterly value review with the economic buyer spread across the year. Framed means the evidence, the choice, and the consequence of waiting are written down. The customer decides. Response inside the cap is one business day.

**Strategic**, inside 16 hours, is everything in Advanced, plus preparation for one further forum, the renewal dossier at the −90-day mark, a short adoption note, and a named specialist once one is employed. A quarterly visit is a separate on-site line. A second entity is a second service line, bought explicitly.

The customer sends the file on the weekly rhythm, attends the reviews they bought, decides, and corrects a number that is wrong. They do not direct the person’s week.

---

## 5. Pilot and design partner

One component, two treatments. Both are 30 days, one manufacturing forecasting use case, and a maximum of 15 delivery hours. Neither is a subscription and neither is Managed Intelligence.

| | Design partner | Paid pilot |
|--|----------------|------------|
| Who | The first three approved accounts | Every pilot after those three |
| Fee | AUD $0 | AUD $15,000 |
| What they receive | One file, one snapshot, one review. Not the inactive modules. | The same pilot |
| If they sign within 30 days of the review | No credit, because there was no fee | The full fee is credited against the first-year **initial-entity platform** invoice |
| What the credit does not touch | — | Managed Intelligence, activation, and any additional entity |
| If they do not sign | Stop | Stop. The fee is kept in this draft. Counsel writes the clause. |

The credit is a year-1 invoice adjustment. It does not reduce net contracted ARR, and it does not survive renewal.

`Assumptions!pilot_fee` is still the earlier AUD $12,000 hypothesis. No forecast formula reads it. The order uses AUD $15,000. The old cell was left in place so it would not be overwritten without a trace.

### Fully loaded pilot cost

| Direct cost | Amount | Basis |
|---|---:|---|
| Founder time | AUD $3,750 | 15 hours × AUD $250 |
| Infrastructure | AUD $64 | One month of the current single-customer stack |
| Model usage | under AUD $1 | One month of the unmetered base hypothesis |
| **Fully loaded cost** | **AUD $3,814** | |
| Cash cost | AUD $64 | Founder time is not cash |

A paid pilot’s fully loaded margin is about **74.6%**. Its cash margin is about 99.6%. The cash figure is not the commercial margin.

Forecasting analysis in the product makes no model call. The model line is the base hypothesis, not a meter reading. If the company is already hosting other customers, the incremental infrastructure is smaller than a whole stack. The labour dominates either way.

### Converted and not converted

The paid fee is not extra profit when the customer converts. They pay the fee, then the same amount comes off the first-year initial-entity platform invoice. Year-1 platform-related cash equals the contracted platform amount. The economic cost of having run the pilot, compared with starting on the subscription directly, is the AUD $3,814 delivery cost.

| Case | Revenue | ARR | Fully loaded result |
|---|---:|---:|---|
| Design partner, stops | $0 | $0 | Cost AUD $3,814 |
| Design partner, converts to the platform | The platform contract. No pilot fee. | Platform ARR only | Direct platform economics, minus the AUD $3,814 pilot cost |
| Paid pilot, stops | AUD $15,000 pilot fee | $0 | About AUD $11,186 loaded profit. Not ARR. |
| Paid pilot, converts to the platform | Platform contract. The fee is credited, so it is not a second sale. | Platform ARR, unchanged by the credit | Same as a converting design partner: the fee nets off, and the delivery cost remains |
| Paid pilot, converts with Essential | Platform contract plus Essential at full price | Platform ARR plus Essential ARR | The credit does not reduce the service |
| Paid pilot, converts with a second entity and Essential | Initial entity, second entity, and Essential | All three, with the pilot outside ARR | The credit reduces only the initial-entity platform invoice. The second entity’s AUD $33,000 contracted amount is untouched |

Activation is added once on conversion and is not inside the pilot cost. The 15 pilot hours and the 12 activation hours are different caps. If a real pilot has already done the activation work, the activation hours on that order are set to zero. They are not both counted for the same work, and activation is not also sitting inside the monthly platform cost.

---

## 6. Activation

Standard activation is included.

- Maximum 12 hours.
- No travel.
- No custom integration.
- No bespoke data remediation.
- No consulting outside that cap.

The customer line is “Activation — included, 12 hours, no travel.” The fee is zero. The internal direct cost is **AUD $3,000**, which is 12 × AUD $250.

That cost is recognised once in the year-1 customer margin. The monthly platform cost on `PlatformCost` does not contain it. The year-1 formulas add it one time. The order sheet counts that inclusion and the count is one.

Hours past 12 are the same prepaid block as service overage, AUD $450 an hour, or the activation stops. This line is not a cleansing or integration project.

Charging the AUD $3,000 cost would make the component’s own margin zero. Charging enough for a 65% margin on founder time would be an implementation price and fights the fifth objective. The zero-fee line is the one that matches the philosophy. The cost is still in the margin.

---

## 7. Platform direct cost

The figure near **AUD $96 a month** is real and narrow. At a 25-logo allocation it is:

| Line | Monthly amount | In the $96? |
|---|---:|---|
| Shared infrastructure, allocated | about $5.40 | Yes |
| Model usage, base hypothesis | about $0.36 | Yes |
| Card fees | $0 at the default annual invoice | Yes, at zero |
| Paid support, one hour at $90 | $90 | Yes |
| Storage as its own meter | not billed | No separate line |
| Data processing as its own vendor | not contracted | No separate line |
| Monitoring | $0. No Datadog or Sentry contract | Excluded |
| Platform customer success | about $1,200 at 25 logos, because two salaries are spread across 25 | Removed from the $96 |
| Founder platform time, four hours | $1,000 | Not in the $96 |
| A second support charge on top of those four hours | — | Not added. That hour sits inside the four. |
| Activation | $3,000 once | Not in the monthly cost |
| Managed Intelligence labour | on the service line | Not in the platform cost |

A margin that uses only the $96 is about **99%** of the $9,500 list. That is not the validated commercial margin.

### The two costs this draft quotes

**Variable cost per operating entity.** About **AUD $0.36** of model usage, plus card fees, plus zero incremental infrastructure while the compute step stays put. Card fees are zero while the industrial motion invoices annually. Storage, processing, and monitoring do not yet have their own variable bills.

**Fully loaded cost.** It depends on who is actually delivering.

| Delivery | What is in the monthly cost | Amount | Gross margin |
|---|---|---:|---|
| Founder-led, one entity | Whole current stack, model usage, four founder hours. Support is not charged again. | about **$1,064** | **88.8%** of list. **87.8%** of the collected rate. |
| Same, year 1, activation once | Those months plus $3,000 | — | **84.9%** of the AUD $104,500 contract |
| Platform-only book at 25 logos, CSM employed | Allocated stack, model, support hour, and the awkward two-salary CSM allocation | about **$1,296** | **86.4%** of list. **85.1%** of the collected rate. |
| Same CSM at a full 15-account load | Allocated stack, model, support, one fifteenth of a salary | about **$1,096** | **88.5%** of list |

The SaaS line clears 80–85% on these fully loaded figures. The 99% figure does not get quoted beside them.

A second entity adds another model allowance. It does not add another stack, another four founder hours, or another support hour, while the account stays on one hosted tenant. A second Supabase project, if engineering requires one before a second entity can be sold, is not in this cost.

The service-led platform cost — the $96, with founder platform hours stopped and no CSM beside a specialist — is used only in the specialist column of the customer margin, and only with that staffing condition written next to it.

---

## 8. Customer margin

SaaS margin and service margin stay separate. The combined figure is the customer, not a blended product.

One initial entity. No pilot. Activation included once in the year-1 figure. Founder-led means the founder carries the four platform hours and the service hours.

| Order | Year-1 contracted revenue | Founder-led year-1 margin | Specialist full book, founder platform hours stopped | 2 November partial-cost margin, kept for comparison |
|---|---:|---:|---:|---:|
| Platform only | $104,500 | **84.9%** | 96% on the partial platform cost. Not the quoted platform margin. | 96.0% |
| Platform + Essential | $140,500 | **76.0%** | **89.4%** | 84.2% |
| Platform + Advanced | $182,500 | **71.6%** | **86.0%** | 78.0% |
| Platform + Strategic | $248,500 | **74.3%** | **86.9%** | 79.0% |

The 2 November paper said founder-delivered Essential stayed about 84%. That used the $96 platform cost. With founder platform time included, year-1 Essential is **76.0%**. Advanced is **71.6%**. Strategic is **74.3%**. None of those combined year-1 results sit inside 80% while the founder delivers both lines.

Monthly list margin, before activation, is higher: 88.8% platform only, 79.5% with Essential, 74.6% with Advanced, and 76.4% with Strategic, all founder-led.

If a specialist delivers the service and the founder’s four platform hours are still loaded, year-1 combined margin is **81.2%** for Essential, **79.6%** for Advanced, and **82.2%** for Strategic. Founder time has not been dropped. Advanced is under 80%.

Two entities plus Essential, founder-led, standard terms: year-1 revenue AUD $173,500, margin **80.5%**. The same order with the floor bound: revenue AUD $201,000, margin **83.2%**. The premium is platform revenue on the same delivery cost. Three entities, platform only, founder-led: contracted AUD $170,500, margin **90.7%**, because the founder hours and the stack are per account, not per entity. The platform rate card on that three-entity order is AUD $15,500 a month, invoiced at AUD $15,500, contracted at AUD $170,500.

The specialist column clears the combined band only when three things are true together: the book is full, founder platform delivery has stopped, and a CSM is not also paid for that account. `MarginMix` still shows the double count. This draft does not recommend it.

`CustomerMargins` holds the formulas. The partial-cost column is still there so the 2 November result can be read beside the reconciled one.

---

## 9. Revenue reporting

Book these. Do not collapse them.

| Measure | One entity, platform only | What it is |
|---|---:|---|
| Platform list value | **AUD $114,000** | $9,500 × 12. Not ARR. |
| Net contracted platform ARR | **AUD $104,500** | $9,500 × 11. This is the platform ARR. |
| Managed Intelligence ARR | The package × 12 | Twelve months paid. Zero when the service is declined. |
| Total net contracted ARR | Platform ARR + service ARR | Pilot and activation are outside it. |
| Annual invoiced revenue, year 1 | The platform invoice after any pilot credit, plus service, plus any activation fee, plus any pilot fee | A credit lowers this and does not lower ARR. |
| Cash collected | The invoices, while card share stays at zero | Card share is a separate test on `Assumptions`. |
| Pilot revenue | The fee, or zero | Never ARR. On conversion it is offset by the credit. |
| Activation cost | AUD $3,000 | Internal. The customer fee is zero. |
| Expansion ARR | Additional entities × $3,000 × 11 | Already inside platform ARR. Shown on its own so it is not lost. One extra entity is **AUD $33,000**. |

`Forecast36` was not rewritten. Its first-entity MRR uses the collected rate, so ending MRR × 12 matches net contracted platform ARR for those logos. From month 13 it adds a second entity at the full $3,000 a month, not at eleven twelfths. Annualising that expansion line overstates expansion ARR by one conceded month per additional entity. The order sheets use × 11 for every platform line, including expansion and the floor premium.

---

## 10. GST and renewal

Prices in this paper and in the order sheets are exclusive of GST. GST is added where it applies. Finance still has to confirm registration and the customer’s place of supply.

The 4% annual step on the service, from month 13 in `ServiceForecast36`, is an unapproved assumption. It is subject to final contract wording and to legal and accounting review. It is not a renewal term in force. The platform forecast has no uplift. A platform increase is not quoted until it is written on an order.

---

## 11. Hiring and founder capacity

The hire test remains **78 hours a month of demand that is contracted and ready to start**. That threshold is a working assumption. It is the point an Essential-priced book covers one specialist salary at about a 65% service margin before any leftover founder oversight.

These are different numbers:

| | What it is | What it does not do |
|---|---|---|
| Founder delivery capacity | 24 hours a month on the service, until a specialist exists | It is not a hiring signal |
| Contracted service hours | Caps the customer has signed | Hours still in contracting are not ready |
| Ready demand | Contracted hours that can start | This is the only hire test |
| Available specialist capacity | About 91 delivery hours a month once a person is employed, at the utilisation assumption | It does not exist before the hire |
| Forecast pipeline | A view of future demand | It never triggers a hire |
| Verbal commitments | A conversation | They never trigger a hire |
| Actual utilisation | Delivered hours over the employed specialist’s capacity | It is not the 65% planning assumption, and a thin month is not a reason to hire the next person |

`ServiceForecast36` still sets founder delivery hours to zero in the month a specialist is hired. That sheet is the historical scenario and was not overwritten. It is not the operating rule.

The operating rule prices a residual founder oversight cost after the hire. The yellow assumption is **8 hours a month**, AUD $2,000 at the founder rate. It is not a timesheet. Founder salary already sits in company overhead and is not added a third time.

At 13 Essential accounts (78 hours) the loaded service margin including that residual is about **60%**, under the 65% floor. The salary-only test is still about 65%. The book that clears 65% after the residual is about **89 Essential hours**, roughly 15 accounts. The 78-hour rule stays the cash coverage test. The thicker book is what the loaded test requires, and it is on `CapacityTransition`.

Advanced is not used as the book that justifies the first hire. It becomes the preferred offer after the specialist is funded, not the reason to fund the specialist early.

---

## 12. Decision register

### Approved strategic direction

Adopted for this draft. Not a licence to publish a price.

- Five separate commercial lines. A zero-price line is still printed.
- While the founder delivers, Essential is the default Managed Intelligence offer.
- Advanced is the preferred enterprise offer only once specialist capacity is funded and available. Strategic is reserved.
- A standard single-entity customer stays at the initial platform rate.
- A routine security questionnaire does not create a platform premium.
- The floor can bind only on a multi-entity order with material governance, and only when the rate card is below the floor.
- Managed Intelligence does not change the platform price. A further entity does not inherit service hours.
- Activation is included, capped, and costed once internally.
- The pilot is 30 days, one forecasting use case, 15 hours, three approved design partners at no fee, then a paid pilot whose fee credits only the first-year initial-entity platform invoice, and only on a signature within 30 days of the review.
- Prices are exclusive of GST. GST is added where it applies.
- Hiring uses ready contracted hours. Founder time is still costed after a specialist is hired.
- ARR is net contracted platform revenue plus Managed Intelligence. List value at twelve times the monthly rate is not booked. Pilot and activation are not ARR.

### Proposed commercial terms

Not approved prices: AUD $9,500, AUD $3,000, the 11-month concession, the AUD $15,000 floor, Essential AUD $3,000 / 6 hours, Advanced AUD $6,500 / 12 hours, Strategic AUD $12,000 / 16 hours, paid pilot AUD $15,000, activation cost AUD $3,000 at AUD $250 an hour, and the 78-hour hire test.

### Unresolved

- GST registration and place of supply.
- The 4% service step, which needs contract wording and legal and accounting review. No platform uplift is proposed.
- The clause if a paid pilot stops. This draft keeps the fee.
- Second-tenant isolation, and the cost of a second project if one is required.
- Entitlement enforcement in billing.
- Which of the older price documents, if any, is retired. This draft does not retire them.
- The residual founder hours after a hire. Eight is a working input.

### Assumptions requiring validation

- The $96 partial cost, the unmetered token hypothesis, and the infrastructure steps.
- Monitoring, storage, and data-processing bills that do not yet exist.
- Treating the support hour as part of the four founder hours rather than a second charge.
- The 24-hour founder bridge, the 78-hour salary test, and the residual that pulls the loaded service margin under 65% at that point.
- `ServiceForecast36` attach rates, which match founder-led Essential and were not changed.
- Workers compensation at 1%, other on-cost at 2%, payroll tax left off, and the 30 October 2026 exchange rate.
- No observed cohort for wins, churn, hours, or tokens.

---

## 13. What founder approval still has to say

The direction in section 12 can stand while every dollar amount remains proposed. Approval of a price is a separate act. Until that act:

1. Confirm or replace the platform rate card, the 11-month concession, and the floor amounts. The trigger itself is the direction above.
2. Confirm or replace the three service prices and caps. The choice of Essential as the founder-led default is the direction above.
3. Confirm the paid pilot at AUD $15,000 and the credit rule, including that a stop does not refund the fee unless counsel changes the clause.
4. Confirm activation at a zero customer fee and an internal cost of AUD $3,000, counted once.
5. Confirm that GST is added where it applies, and that no renewal percentage is quoted until the contract wording exists.

Quoting the website, the USD seat grid, or the in-code catalogues for an industrial order would break this architecture. Those prices were not reconciled into this rate card, and they were not deleted.
