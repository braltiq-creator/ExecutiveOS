# 16 — Managed Intelligence Services

**Status:** Recommendation. Not an approved price, package, or hiring plan.  
**Later draft:** [`17_ENTERPRISE_COMMERCIAL_ARCHITECTURE.md`](./17_ENTERPRISE_COMMERCIAL_ARCHITECTURE.md) (2 November 2026) proposes Advanced as the preferred starting package. That conflicts with the Essential default in this paper. Neither is approved. The 36-month attach rates in the workbook are unchanged.  
**Date:** 1 November 2026 (Australia/Brisbane)  
**Depends on:** [`15_INDUSTRIAL_ICP_TARGET_ACCOUNTS_AND_UNIT_ECONOMICS_ANALYSIS.md`](./15_INDUSTRIAL_ICP_TARGET_ACCOUNTS_AND_UNIT_ECONOMICS_ANALYSIS.md). The platform list of AUD $9,500 a month remains a recommendation in that paper. It is not approved by this one.  
**Does not change:** application code, checkout, billing, the website, or any document that currently claims to be the price list.  
**Model:** [`models/industrial_unit_economics.xlsx`](./models/industrial_unit_economics.xlsx). Platform sheets are unchanged. Managed intelligence lives on `ServiceAssumptions`, `ServicePackages`, `ServiceScale`, `MarginMix`, `ServiceForecast36`, and `ServiceSensitivity`. Yellow cells are inputs. Green cells on `ServiceAssumptions` are formulas. Rebuild with `python3 docs/commercial/models/build_industrial_unit_economics.py`.

Labels mean the same thing as in the industrial paper: existing decision, assumption, conflict, missing, recommendation, founder approval.

---

## 1. The proposition

**Managed Intelligence** is a capped, repeating operating rhythm on top of ExecutiveOS. The product produces the evidence. A named person, inside a published hour cap, makes sure the evidence is fit to use, puts the exceptions in front of the sponsor, and keeps a record of whether the subscription is earning its place.

It is sold as its own line. It is not folded into the AUD $9,500 platform fee, and it is not a way to discount that fee.

### What the customer is buying

Once a month, and once a quarter in a longer room, they get a prepared view of:

- Whether the file is still the file we can trust (data quality, freshness, broken columns).
- Whether forecast and actual are moving in a way that deserves an executive, using the manufacturing analysis the product already computes.
- What the sponsor opened, and what they did not (adoption).
- Which decisions were framed from the evidence, and which are still unmade.
- Whether a second operating entity, or a step up in the service itself, is earned.

Between those meetings they get a bounded response when something in the queue is wrong. They do not get a person on call.

### What it is not

| This offer | What people will try to turn it into | The line |
|------------|----------------------------------------|----------|
| Managed intelligence | Management consulting | We do not run a diagnostic, write a target operating model, or stay until a transformation is “finished.” |
| A capped review | Staff augmentation | Their planning lead does not direct our person’s week. We do not sit in the seat. |
| Oversight of the evidence | Outsourced operations | We do not own the forecast number, the S&OP decision, or the factory schedule. The executive decides. That is already the product rule. |
| Activation and a monthly rhythm | Implementation | We do not connect ERP, build a data warehouse, or map a new source as a project. The pilot remains a file. |
| Priority inside the cap | Unlimited support | Hours end. The next hour is a prepaid block or it does not happen. |

The test of a request: if a second customer cannot receive the same activity from the same playbook next month, it is not this service. It is a project, and this company is not taking the project.

### Why it exists

The industrial paper showed that vendor costs are small and human hours are the margin. A platform fee that quietly includes those hours will miss 80–85% as soon as the hours are real. A separate service lets a customer who wants a person in the room pay for the person, and lets a customer who will run the file themselves stay on the platform. Retention comes from the review having a date and a record, not from us becoming their planning department. Expansion comes from a second entity or a higher cap, not from a custom build.

---

## 2. Packages

The ranges in the commercial discussion were starting points: Essential AUD $2,500–3,500, Advanced AUD $5,000–7,500, Strategic AUD $10,000–15,000 or more. They are not approved. Tested against a fully loaded specialist at about **AUD $148 a delivery hour** (the derivation is in section 3), the low end of Essential and the low end of Advanced do not clear a 65% service margin at a scope that is actually a monthly service.

| Discussed price | Hours needed for a real monthly service | Specialist gross margin | Verdict |
|-----------------|------------------------------------------|-------------------------|---------|
| AUD $2,500 | 6 | About **64%** | Below the floor. Do not quote. |
| AUD $3,000 | 6 | About **70%** | Recommended Essential. |
| AUD $3,500 | 6 | About **75%** | Clears. Use only if the buyer is heavier to serve, not as a quiet discount back to $2,500. |
| AUD $5,000 | 12 | About **64%** | Below the floor at a 12-hour scope. A $5,000 offer would have to be closer to Essential. Do not create that third thing. |
| AUD $6,500 | 12 | About **73%** | Recommended Advanced. |
| AUD $7,500 | 12 | About **76%** | Clears, with less work per dollar. Ceiling, not a reason to add hours. |
| AUD $10,000 | 16 | About **76%** | Clears. Thinner than the recommended Strategic price for the same cap. |
| AUD $12,000 | 16 | About **80%** | Recommended Strategic. |
| AUD $15,000 | 16 | About **84%** | Margin is fine. The danger is the buyer expecting a retained consultant. Do not quote it unless the cap stays 16 hours in the order. |
| AUD $15,000 | 30 | About **70%** on the service | Combined customer falls to about **81%** on the list price and **under 80%** if a platform CSM is still being paid as well. Do not sell this shape. |

### Essential — AUD $3,000 a month, 6 hours

**Customer.** One operating entity that has converted, with a sponsor who will attend. The planning lead remains the owner of the file. This is the default proposal on the order form, and it is optional.

**The 6 hours, every month.**

| Activity | Hours |
|----------|-------|
| Four weekly passes over the exception queue the product already raises | 2.0 |
| Prepare and hold the monthly intelligence review (about 45 minutes in the room) | 2.5 |
| Adoption and file-freshness note | 0.5 |
| Quarterly value review, spread across the year | 0.5 |
| Reserve for a bounded reply when something breaks | 0.5 |

**Deliverables.** A one-page note after the monthly review: what changed, what is unfit to use, what decision is framed, what we will not do. A quarterly note for the economic buyer: habit, decisions framed, renewal posture, expansion only if it is earned. No slide theatre.

**Response.** Acknowledge in one business day. A substantive reply inside the reserve in two business days. This is not a 15-minute production incident SLA. Platform defects follow the platform support path and do not consume the whole reserve by default.

**Excluded.** On-site time. Travel. ERP or file-mapping projects. Building their forecast. Chairing S&OP. Custom models. A Council seat. Writing the decision for them. Hours above 6. Anything listed as excluded in the industrial pilot.

**Customer’s job.** The file arrives on the weekly rhythm. The sponsor attends the monthly review and the quarterly review. They choose. They tell us when a number in the note is wrong.

**Extra.** Further hours only in prepaid blocks of three at **AUD $450 an hour**. An on-site day is **AUD $2,500 plus travel at cost**, ordered separately, and it is not a standing visit. Both figures are hypotheses.

**Expansion.** Advanced, if the second pass and the decision frames are real. A second operating entity is a platform charge, not a free doubling of this package.

**Full-book cost and margin.** About **AUD $890** a month. Gross margin about **70%**. Founder-delivered, the same 6 hours cost AUD $1,500 at the AUD $250 opportunity rate and the margin is **50%**. That is a bridge, not the design.

### Advanced — AUD $6,500 a month, 12 hours

**Customer.** A multi-site or multi-model planning argument, where one monthly pass is not enough, and where the CFO should be in the quarterly room. Still one operating entity.

**On top of Essential.** A forecast-performance pass (bias, misses, where the extract is thin). Up to two decisions framed for the sponsor from the evidence, not decided by us. A slightly longer written note. Substantive response in one business day, still inside the cap.

**The extra 6 hours.** Forecast review 3. Two decision frames 2. The longer note 1.

**Excluded.** The same list as Essential, plus running the S&OP meeting and “being available on Slack.”

**Full-book margin.** About **73%**. Founder-delivered, about **54%**. A contractor at the hypothesis rate of AUD $220 an hour lands about **59%**, under the floor. Do not staff Essential or Advanced with contractors.

### Strategic Enterprise Partnership — AUD $12,000 a month, 16 hours

The name is a partnership of cadence and attention. It is not a joint venture, a dedicated team, or an open retainer.

**Customer.** An account with more than one executive forum, or a converted design partner that wants a named specialist and a renewal dossier. One Strategic account is 16 founder hours. That is most of the founder’s entire service cap. The founder does not deliver two of these.

**On top of Advanced.** A short expansion and adoption note. A renewal dossier at the −90-day mark, which the customer-success document already asks for. Prep for a second forum. A named person once a specialist exists, not a rotating inbox.

**The extra 4 hours.** Dossier and expansion 2. Second forum 2.

**Still excluded.** A quarterly site visit. Travel. A second operating entity. Implementation. Unlimited advisory. Sixteen hours is about two working days a month, and the order should say so in numbers, not in adjectives.

**Full-book margin.** About **80%**. Founder-delivered, about **67%**, which clears the floor and still consumes the founder. One Strategic customer is the bridge. A second one waits for a specialist.

**Response.** Next business day for items already inside the month’s plan. New topics wait for the next review unless the buyer pays a block.

### Rules that apply to every package

- The cap is a maximum, not a balance the customer is entitled to exhaust with unstructured calls.
- Unused hours expire. They do not roll over. Rolling hours become a consulting retainer.
- We do not staff above the cap to “save the relationship.”
- Travel is never inside the fee. One domestic trip can consume an Essential month of delivery budget.
- The service renews annually. It is not month-to-month. A salary cannot be hired against a cancel-any-month book.
- The platform’s one-month annual concession does **not** apply to the service. Eleven-for-twelve is a software term. The service is twelve months paid, because the cost is a person every month.

---

## 3. Delivery economics

### What a specialist costs

These are hypotheses except where a statute is cited. None of them is a payroll record.

| Piece | Figure | Standing |
|-------|--------|----------|
| Base salary | AUD $140,000 | Hypothesis. Intelligence specialist, not a partner-level consultant. |
| Superannuation | 12% | ATO super guarantee, 12% from 1 July 2025 and still 12% for the year starting 1 July 2026. |
| Workers compensation | 1% of salary | Hypothesis. WorkCover rates are industry-specific and are not quoted here. |
| Other on-costs | 2% of salary | Hypothesis for insurance and small employment costs. |
| Tools | AUD $150 a month | Hypothesis. No tool is contracted. |
| Payroll tax | 4.75% of salary plus super, only above the threshold | Queensland rate for employers at or under $6.5 million of Australian taxable wages. Threshold **$1.3 million**. Off in the default model, because this company is under it. The mental-health levy applies above $10 million and is ignored. |
| Nominal year | 45 weeks × 37.5 hours | 4 weeks leave, about 2 weeks of public holidays, 1 week sick and training. |
| Delivery utilization | 65% | The other 35% is service management, internal work, and slack. A second “management overhead” is not added on top. |
| Delivery hours | About **1,097 a year**, **91 a month** | Formula. |
| Fully loaded cost | About **AUD $162,800 a year**, **AUD $13,600 a month** | Without payroll tax. |
| Cost per delivery hour | About **AUD $148** | At that utilization. A half-empty book raises the effective rate. It does not lower it. |

Founder time remains **AUD $250 an hour**, carried forward from the industrial model. It is an opportunity cost. It is not cash, and it is not zero.

Switching payroll tax on adds about **AUD $7 an hour**. Essential stays above 65%. It is not the thing that breaks the design. Utilization and scope are.

A scheduled small-model note of 40 completions a month, on the same token prices as the platform model, is about **AUD $0.05** a customer. It is in the cost and it does not move the margin. A continuous agent is not in the cost because it is not in the offer.

### One package at a full book

| | Essential | Advanced | Strategic |
|--|-----------|----------|-----------|
| Price | $3,000 | $6,500 | $12,000 |
| Hours | 6 | 12 | 16 |
| Specialist cost | about $890 | about $1,780 | about $2,380 |
| Specialist gross margin | about **70%** | about **73%** | about **80%** |
| Customers per full specialist | about **15** | about **8** | about **6** |
| Founder gross margin | **50%** | about **54%** | about **67%** |

A 50/30/20 mix of the three packages is about **9.8 hours** and **AUD $5,850** a customer. One full specialist carries about **nine** of those customers at about **75%** margin. That mix is a scale-sheet input, not a forecast of what we will sell. The 36-month paths below sell a thinner mix on purpose.

### 1, 5, 10, 25 and 50 customers

Two different questions get two different answers. “What if we hire a person and serve everyone in the row?” and “What does the staffing rule actually do?”

**If a hire is forced** so that every Essential customer is served, rounded up to a whole salary:

| Essential customers | Hours | People | Loaded margin |
|---------------------|-------|--------|----------------|
| 1 | 6 | 1 | Negative. The salary is about $13,600 against a $3,000 fee. |
| 5 | 30 | 1 | About **10%**. |
| 10 | 60 | 1 | About **55%**. Under the floor. |
| 25 | 150 | 2 | About **64%**. Still just under, because the second person is not full. |
| 50 | 300 | 4 | About **64%**. Same reason. |

Advanced and Strategic fail the same way at one and five customers, and they recover only when the book is close to 8 or 6 customers per person. The workbook’s Block A on `ServiceScale` has every package and the blend.

**The rule this paper recommends**

- The founder may spend up to **24 hours a month** on the service. That is about four Essential accounts, or two Advanced, or one Strategic. Demand above 24 hours is not taken.
- A specialist is hired only when there are at least **78 hours** a month of demand ready to start. That is the point an Essential-priced book (about 13 customers) covers one salary at a 65% margin.
- The next person is added only when the remainder, after the current people are full, is itself at least 78 hours. A remainder of a few hours does not create a head.

Under that rule, Essential looks like this:

| Customers who want it | What happens | Margin on the work actually done |
|-----------------------|--------------|-----------------------------------|
| 1 | Founder, 6 hours | 50% |
| 5 | Founder keeps 4. The fifth waits. | 50% on the four |
| 10 | Still the founder cap. Six accounts wait. | 50% |
| 25 | One specialist, about 15 accounts served, the rest wait for a real second book | About **70%** |
| 50 | Three specialists, book held to their delivery hours | About **70%** |

Waiting is a feature. Hiring at customer number five is how a software company becomes a firm with a 10% service margin.

---

## 4. Keeping the SaaS margin intact

Four margins, and they are not interchangeable.

| Margin | What it includes | What it must not include |
|--------|------------------|--------------------------|
| SaaS | Platform fee, minus infrastructure, model calls, card fees, and any support that is still inside the platform | The specialist’s salary. The founder’s service hours. |
| Managed intelligence | Service fee, minus the specialist or the founder hours, the small scheduled model note, and tools inside the loaded salary | Platform hosting. Engineering. A CSM who is also being paid on the platform line. |
| Combined customer | Both fees, both direct costs, for one account that buys both | Company overhead. |
| Company | All customers, all direct costs, then overhead on the way to operating profit | A blended “gross margin” that hides a 50% service inside an 85% software line. |

### At a full book, reclassified

“Reclassified” means the high-touch labour moves to the service invoice. The platform no longer carries the 1:15 customer-success salary from the industrial model for an account that has bought the service. Support of about one paid hour stays in the platform line in this calculation. At 25 platform logos the industrial sheet still shows that success salary; `MarginMix` prints both versions.

| | Platform only | Plus Essential | Plus Advanced | Plus Strategic |
|--|---------------|----------------|---------------|----------------|
| SaaS margin at the $9,500 list, success salary still inside the platform | About **86%** | Same **86%**. The service does not change it. | Same | Same |
| SaaS margin, success salary removed | About **99%** | About **99%** | About **99%** | About **99%** |
| Service margin, specialist full | — | About **70%** | About **73%** | About **80%** |
| Combined, list price, labour counted twice | About 86% | About **83%** | About **81%** | About **83%** |
| Combined, list price, reclassified | About 99% | About **92%** | About **88%** | About **89%** |
| Combined, collected platform rate (about $8,708), reclassified | About 99% | About **92%** | About **88%** | About **88%** |
| Service share of the list invoice | 0 | 24% | 41% | 56% |

The SaaS target of 80–85% is met on the platform line either way at this price. It is met comfortably once the person is not hiding in the platform. The combined customer also stays **above 85%** in the reclassified full-book case for every recommended package.

It does **not** stay comfortable if the platform still pays a success manager at the old ratio and the customer also buys the service. On the collected platform rate that double count is about **81%** for Essential and about **80%**, slipping under, for Advanced. So the operating rule is simple. An account is either platform-supported inside the thin cap, or it is on a package. It is not both.

### What “the company at 80–85%” can and cannot mean

A weighted average cannot be 85% if a large share of revenue is a 70% service, unless the software line is well above 85%. After reclassification, the software line is. The arithmetic then allows a substantial service mix and still clears 80%, and it can clear 85% while the specialist is full and the caps hold.

The months that miss are the months the book is not full, and the months the founder is the service. Those are visible in section 8. They are not a reason to bury the service inside the subscription so the software margin looks worse and the service margin disappears.

**Recommendation.** Service-line floor **65%** fully loaded, once a specialist is the delivery engine and their book is at the hire threshold or better. Design aim at a full book: **70% or higher**. The recommended packages land at 70–80% when the book is full. Founder delivery of Essential and Advanced will sit near **50–55%**. That is tolerated only inside the 24-hour bridge, and it is reported as its own number. It is not averaged into the SaaS margin to make a slide.

---

## 5. What the software should do, and what a person should do

The manufacturing path in the repository does not call a model. It already emits data-quality, forecast-accuracy, and posture signals. Weekly upload freshness already has a due and overdue state. That is the automation. A person who re-does those checks by hand is wasting the only scarce input.

| Activity | Who does it | Why |
|----------|-------------|-----|
| Data-quality checks on the uploaded file | Software. Already the shape of the forecasting analysis. | A person reviews the exception, not every row. |
| Forecast monitoring | Software, on the weekly upload. Not a loop overnight. | The variance is arithmetic. |
| Exception queue | Software raises it. The specialist confirms what is worth the sponsor’s time. | Judgement of attention is the service. |
| The monthly note | Person, from the snapshot. A small-model draft of 40 calls is allowed if it is cached and inside the allowance. | Continuous generation is not justified. The cost is cents. The habit of re-running agents is not. |
| Executive briefing | The product, on upload, cached. | Do not add a nightly agent per customer. |
| Usage and file freshness | Software, once meters exist. They do not exist yet. The industrial paper already marked that missing. | Alerts, not a health narrative written from memory. |
| Health score | A composite of signals that already have names: WAEx, opens, decisions logged, sponsor attendance, file on time. | Do not invent a second scoring language. |
| Adoption alert | The freshness pattern that already exists. | A person calls only when the score is in the existing “at risk” or “critical” band. |
| The monthly and quarterly reviews | Person. | This is the productised service. |
| Hours against the cap | Internal log. Required before the second paying service customer. | Otherwise the cap is a sentence. |
| Renewal dossier | Person, from the log and the product record. | Already in the customer-success renewal cadence. |
| Strategic expansion advice | Person, quarterly, inside the cap. | A sentence in the quarterly note, not a workshop. |

**Do not run agents continuously.** Nothing in the customer value of a monthly review requires a model to wake up every hour. The industrial stress case, a frontier model at high volume, is still the way to punch through the software margin. The service does not get its own uncapped key.

As the book grows, hours per customer fall only if the queue, the note, and the usage view are product. They do not fall if each new logo adds a meeting format. The caps above are the steady-state hours. They are not a year-one number we quietly double.

---

## 6. How it sits on the commercial model

**Scenario assumption, still unapproved:** platform AUD $9,500 a month list, collected at about AUD $8,708 if the annual term is 11 months paid. Second operating entity AUD $3,000 a month on the platform only. The service does not copy itself onto the second entity unless someone buys it again.

### Annual value of one operating entity

| | Platform, collected | Service, 12 months paid | Together |
|--|---------------------|-------------------------|----------|
| Essential | about $104,500 | $36,000 | about **$140,500** |
| Advanced | about $104,500 | $78,000 | about **$182,500** |
| Strategic | about $104,500 | $144,000 | about **$248,500** |

A second entity adds about **$33,000** of platform (11 months at $3,000) and **nothing** on the service until it is ordered. That is deliberate. Expansion revenue and service revenue are different motions.

### How it is sold

**Optional add-on. Proposed on the order. Not required in order to be a customer. Not included inside the platform fee.**

A higher enterprise order may show one commercial conversation and must show **two invoice lines**: platform, and service, if they take the service. “Included in the enterprise tier” is acceptable only as that split. A single blended SKU would put labour back inside the software margin, which is the failure this paper is trying to avoid.

It is not mandatory. A mandatory service selects for buyers who want a firm, and it forces delivery cost onto logos that would have renewed on the product. The boundary that **is** mandatory: the platform fee does not include attendance at their meeting, a written commentary, or hours past the platform support cap. If they want us in the room, they buy a package. If they do not, they still have the product.

Design partners stay inside the pilot hour cap from the industrial paper. They do not receive an ongoing free Essential. Free service is how the bridge becomes permanent.

### Renewal and price

- Annual commitment, invoiced with the platform, in advance.
- No free month on the service.
- The customer-success calendar already has the renewal at −90, −60, and −30 days. Use it. Do not invent a second one.
- From the first renewal, a step of the lesser of CPI and **5%**. The model uses **4%** a year on the service only, from month 13. Platform price steps are **not** in `Forecast36`. Do not pretend they are.
- Mid-year exit: recommend that the current quarter is not refunded, so a hire is not stranded by a 30-day cancel. That is a term to have counsel write. It is not written here as a contract.

### How the offer refuses to become consulting

The order states the hour cap, the expiry of unused hours, the exclusion list, and the prepaid-block rate. A request outside the list is declined in writing. It is not “absorbed this once.” The $450 hour is for more of the **same** activity, in a block of three, not a door into implementation. If the block would blow the person’s month, it is not sold. Capacity is the constraint, not the buyer’s willingness.

---

## 7. Lifecycle and the metrics we already have

The industrial buyer’s champion is the planning lead, not a Chief of Staff. That conflict with `07_CUSTOMER_SUCCESS.md` is already recorded. The lifecycle below follows the industrial pilot and the existing success calendar. It does not create a third definition of an active executive.

| Stage | What happens | Which existing measure | What this service adds |
|-------|----------------|------------------------|------------------------|
| Qualification | Stage A then stage B from the industrial paper. A buyer who wants a consultant in the pilot is a mismatch. | ICP screen. Not a product metric. | None. |
| Pilot | 30 days, file, hour cap, success table in the industrial paper. | “Would you start the next cycle here?” as a yes or no. | No managed service during the pilot. |
| Conversion | Annual platform order. Service line accepted or struck. | Trial-to-paid, in spirit: pilot-to-annual. The beta metric assumed a card trial. **Conflict** of motion, not of the word. | Attach recorded as yes or no. Not a target we have earned. |
| Onboarding | Template, mapping, 12-hour cap from the industrial paper. | Do not use the marketing “under five minutes” or the beta “first insight in 24 hours” as the industrial promise. **Conflict.** Operational bar: a usable snapshot in ten days. | Service, if bought, starts at the first monthly review, not during onboarding. |
| First value | Sponsor can see a variance with the evidence attached. | Time-to-first-value exists as a name. The beta definition is a different clock. Keep the name, use the ten-day operational bar, and label it. | None until the first review. |
| Monthly review | Only if a package is in force. | Command Centre habit and decisions logged. | Review held or missed. Hours used against the cap. Decisions **framed**, which is not “decisions made by Braltiq.” |
| Quarterly review | Economic buyer. The success document already sets a quarterly executive review for larger accounts. | Health band: healthy, at risk, critical. | Value note: habit, evidence, renewal flag, expansion only if earned. |
| Expansion | Second entity, or a step from Essential to Advanced. | NRR is defined in the beta metrics as including expansion, with a **target** of 110% that is not a result. | A written yes or no. Not a project proposal. |
| Renewal | −90 / −60 / −30 as already written. | Logo retention. | Service renewed, reduced, or ended, separate from the platform. |

### Indicators, without a new religion

Use these names. Do not rename them in the service deck.

- **WAEx**, as written in `docs/business/METRICS.md`: an executive who opens the intelligence surface at least once in the week. The day-90 target of 70% is a beta goal, not a measured baseline.
- The stricter habit in the customer-success document, four days a week, is a **different** measure. So is the pilot’s “four days in thirty.” Report them under their own labels until someone retires the conflict. Do not average them into one “adoption score.”
- **Decisions logged**, trailing 30 days, as the health table already has it.
- **File on time**, from the weekly freshness state. This is data readiness for this ICP.
- **Sponsor attended**, yes or no, against the reviews they paid for.
- **NPS**, if a survey is actually sent the way the metrics note describes. Do not add a service CSAT beside it.
- **Gross margin per customer**, platform and service separate. The beta CEO metrics already care about margin. This is where it becomes real.
- **Logo retention** and **NRR**, existing definitions. Service contraction is visible inside NRR only if the service is in the revenue. That is another reason the lines stay separate: a platform renewal with a dropped service should be readable as such.
- **Hours used / hours included.** New, and necessary. It is an operational measure, not a replacement for WAEx.
- **Renewal probability** is the flag the success document already sets at −90 days. It is not a model output.

Healthy, at risk, and critical stay the bands already written. At risk still means a champion conversation. Critical still means the sponsor. The service does not get a private escalation ladder.

---

## 8. Thirty-six months

`Forecast36` is the platform path from the industrial paper and is not rewritten. `ServiceForecast36` reads its ending logos. Attach rates are inputs. Revenue is booked only for hours the staffing rule will cover. Prices on the service step up 4% a year from month 13. Platform prices do not.

| Path | Attach on platform logos | What the book does |
|------|--------------------------|--------------------|
| Conservative | 15% Essential. No Advanced. No Strategic. | Stays inside the founder cap. No hire. |
| Base | 20% Essential, 8% Advanced. No Strategic. | Month 36 is about 25 hours. The founder cap holds. No hire. A fraction of an hour is refused. |
| Aggressive | 25% Essential, 20% Advanced, 10% Strategic. | Crosses 78 hours late. **One** specialist, hired around month 32. Not two. |

These attaches are deliberately lower than a “half the book buys a package” story. On the logo counts in the industrial forecast, a heavier attach either breaks the founder cap or hires a person into a book that cannot pay the salary at 65%.

### Month 36, at the default inputs

Rounded. The sheet is the source if an input moves.

| | Conservative | Base | Aggressive |
|--|--------------|------|------------|
| Platform logos | about 6.7 | about 11.5 | about 17.2 |
| Platform MRR | about $58,000 | about $104,000 | about $157,000 |
| Platform ARR | about **$0.70M** | about **$1.24M** | about **$1.89M** |
| Service heads | 0 | 0 | 1 |
| Service MRR actually staffed | about $3,300 | about $13,500 | about $58,000 |
| Service ARR run-rate | about **$39,000** | about **$162,000** | about **$0.70M** |
| Service share of that month’s revenue | about 5% | about 12% | about 27% |
| Service loaded margin | about **54%** | about **55%** | about **77%** |
| SaaS cash margin that month | about 99% | about 99% | about 99% after the success salary is moved |
| Combined **cash** margin | about 99% | about 99% | about **93%** |
| Combined **loaded** margin, founder hours priced | about **86%** | about **84%** | about **93%** |

Cash margin looks excellent in the conservative and base paths because the founder’s service hours are not cash. Loaded margin is the one that belongs in the conversation. It sits inside 80–85% on those two paths, and above the band on the aggressive path once a nearly full specialist replaces the founder. None of this is a demand forecast.

### Operating profit, cash, over 36 months

Platform overhead is untouched: the founder salary, one engineer, G&A, and a small sales-cash line from the industrial model, and an account executive from month 18 on the aggressive path only.

| Cumulative cash operating profit | Platform only | With the service, cash |
|----------------------------------|---------------|------------------------|
| Conservative | about −$0.55M | about **−$0.50M** |
| Base | about +$0.18M | about **+$0.40M** |
| Aggressive | about +$0.67M | about **+$1.35M** |

Read the improvement carefully. In the conservative and base paths almost all of it is service revenue with no specialist salary, while the founder has spent about **$24,000** and **$99,000** of opportunity cost respectively. The company is not $220,000 richer in any sense that survives the founder doing the work. The aggressive path does pay a specialist for a handful of months, and the cash result is real, and it still depends on the unobserved win rate behind that logo path.

The service does not pull a slow logo path up to a healthy company. It makes a full book more profitable if the caps hold, and it makes a thin book look profitable on a cash slide if founder time is ignored.

### Sensitivity

| Move | What happens |
|------|----------------|
| Salary +20%, or the book half empty | Essential at a “full” hour rate drops through 65%. The hire threshold was set so this would show up. Do not hire early to hide it. |
| Utilization edited from 65% to 75% | Hour cost falls and every package looks safer. Do not type 75% until a log shows it. |
| Essential scope drifts from 6 hours to 10 or 12 | The 70% margin compresses into the mid-50s or worse, and the combined customer follows. This is the ordinary way the offer dies. |
| Quote $2,500 or $5,000 at the recommended hours | About 64%. Under the floor before anyone travels. |
| Payroll tax switches on | About one and a half points. Survive it. Do not design around it. |
| Strategic at $15,000 and 30 hours, success salary still on the platform | Combined customer **under 80%**. |
| Platform cut back to the in-code $7,500 and Essential stacked on a full specialist | Combined still clears 80% in the sensitivity sheet. The industrial paper’s reason for not using $7,500 was the platform’s own fully loaded test. The service does not repair that. |
| Heavier attach than the table | Either refused demand, or a hire, or the founder past 24 hours. The third is the one that quietly becomes a firm. |
| AI stress volume on the service note | Still noise at 40 calls. The stress case in the platform sheet remains a routing problem, not a service-package problem. |

---

## 9. What was and was not changed

Added:

- This paper.
- Managed-intelligence sheets and the two cited labour sources (super guarantee, Queensland payroll tax) inside the existing workbook.
- A builder module, `docs/commercial/models/add_managed_services.py`, called from the existing generator.

Not changed: platform assumption values, `Forecast36` formulas, unit-economics formulas, application code, checkout, billing, marketing prices, or any document that presents itself as the current price list.

---

## 10. Recommendations

### Positioning

Managed Intelligence is the capped human rhythm on top of evidence the product already produces. It is a line item. It is not consulting, not staff augmentation, not outsourced planning, and not implementation.

### Packages

Three, and only three. Essential, Advanced, and Strategic Enterprise Partnership. Hour caps of 6, 12, and 16. Unused hours expire. Travel and on-site days are outside. Extra work is a prepaid block of the same work, or it is declined.

### Prices, for approval, not in force

AUD **$3,000**, **$6,500**, and **$12,000** a month. The discussed floors of $2,500 and $5,000 fail the margin test at those caps. $15,000 is not the default, because the buyer will hear “retainer” and the hours will follow.

### Delivery

Founder bridge of 24 hours a month, reported at $250 an hour, known to be about a 50% margin on Essential. A specialist at the salary and on-cost hypothesis above, hired at 78 hours of ready demand, and not a person sooner. About 15 Essential, or 8 Advanced, or 6 Strategic accounts per full specialist. Contractors are not the Essential or Advanced engine.

### Gross margin by stream, full book, reclassified

| Stream | Margin |
|--------|--------|
| SaaS platform at the recommended list, labour not hiding inside it | About **99%** cash. The industrial paper’s **86%** still applies if the old success-manager ratio stays on the platform. Both clear 80–85%. |
| Essential / Advanced / Strategic | About **70% / 73% / 80%**. |
| Combined customer, collected platform rate | About **92% / 88% / 88%**. |
| Company, month 36 of the three paths, loaded | About **86% / 84% / 93%**. |

### Combined outlook

The combined business can sit inside or above 80–85% **if** the service is invoiced separately, the hour caps hold, the specialist is not hired early, and high-touch labour is not paid twice. It misses as soon as the service is dumped into the platform fee, or a second salary is opened for a remainder that cannot fill it, or Strategic is allowed to become 30 hours. The base and conservative paths do not justify a specialist inside 36 months. That is a capacity fact, not a delay to feel bad about.

### Hiring

No specialist on the conservative or base attach. One specialist late on the aggressive attach, and only just. The first honest hire in the real world is when about 13 Essential-equivalent accounts are ready at once, not when the first enthusiastic buyer asks for a monthly workshop.

### Risks to scale

1. The 24-hour founder bridge becomes the permanent delivery model, and the 50% service margin is never replaced.
2. Hour caps drift. Ten hours of Essential is a different product and a worse one.
3. A hire at five customers, because a salary feels like progress.
4. Travel, site visits, or “unlimited priority” written into the fee.
5. A success manager on the platform **and** a specialist on the service for the same account.
6. Continuous agents added because the service “should feel intelligent.”
7. The second operating entity copied onto the service without a second fee.
8. Month-to-month cancellation of a service we hired against.
9. A $15,000 label with no hour cap.
10. Metrics that rename WAEx, NPS, or NRR and then cannot be reconciled with the documents that already define them.

### Five decisions for the founder

1. **The service is a separate line, not part of the $9,500.** Yes or no. If no, do not sell the hours at all. Do not hide them.
2. **The three prices and the three caps** ($3,000 / 6, $6,500 / 12, $12,000 / 16), annual, twelve months paid, 4% renewal step as the working hypothesis. Replace the numbers in the yellow cells if you want different ones, and read the margin before anyone quotes them.
3. **The delivery rule:** 24 founder hours, hire at 78 hours of ready demand, 65% floor, no contractor as the default, travel excluded.
4. **Optional, not mandatory,** with a hard boundary that meetings and written commentary are not inside the platform fee. Enterprise may be one conversation and must be two invoice lines.
5. **The labour hypothesis:** $140,000 salary, 12% super, the small on-cost rates, 65% utilization, $250 founder hour. These are not approved by being printed. Payroll tax stays off until wages cross $1.3 million.

Nothing in this paper should be put on an order form until those five are answered.
