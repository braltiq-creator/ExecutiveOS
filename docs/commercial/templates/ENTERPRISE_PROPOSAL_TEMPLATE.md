# ExecutiveOS Enterprise Proposal

**Braltiq**  
**Document:** Reusable enterprise proposal for an industrial manufacturing or OEM account  
**Working example:** Hitachi Construction Machinery Australia  
**Status:** Proposed terms for discussion. Exclusive of GST. Binding only when written on an order form.  
**Date:** 2 November 2026 (Australia/Brisbane)  
**Prepared for:** The Chief Executive, Chief Operating Officer, Chief Financial Officer, and the operational executives of the named account  
**Commercial basis:** `docs/commercial/17_ENTERPRISE_COMMERCIAL_ARCHITECTURE.md`. Prices in that paper remain proposed. This proposal does not approve them.

---

## How to reuse this template

Duplicate this file for the next industrial account. Keep sections 3, 5, 7, 8, and 9, and replace every engagement fact.

| Replace | In this working example |
|---|---|
| Legal name, audience, and public description | Hitachi Construction Machinery Australia |
| Challenges written in the customer’s words | Not yet recorded. The industry pattern is labelled as such. |
| Sponsor, economic buyer, planning lead | Placeholders |
| Pilot treatment | Design-partner path proposed. The zero-fee place is not yet offered. |
| Entities, service package, floor | One entity. Essential shown as the optional default. Floor does not apply. |
| Illustrative demonstration names and figures | The Hitachi demonstration scripts. Do not carry them to another account. |

Do not copy a mock figure, a demo plant, or a demo model code into another customer’s proposal. Do not add a module that `docs/design-partner/EXPANSION_MODEL.md` marks as not active.

---

## Engagement

| | |
|---|---|
| Customer | Hitachi Construction Machinery Australia |
| Proposal type | First industrial working example. Not a contract, and not evidence of a customer relationship. |
| Opening engagement proposed | A 30-day manufacturing forecasting pilot for one operating entity |
| Subscription proposed after a passed pilot | ExecutiveOS Platform for that entity, with Managed Intelligence Essential as the optional default service |
| What this proposal is not | A claim that a meeting has been held, that Hitachi data has been shared, that an executive has validated the product, or that a production deployment exists |

Public listings, as recorded in Braltiq’s industrial account note, describe Hitachi Construction Machinery Australia as a supplier of Hitachi excavators and rigid dump trucks, with a Brisbane presence. That is a public description. It is not a Braltiq study inside the account, and it is not evidence of a forecast problem, a sponsor, or an intent to buy.

The repository records no relationship, no completed meeting, no data share, no named sponsor, and no buying intent. A live executive validation session has been designed and has not been conducted.

---

## 1. Executive summary

ExecutiveOS is an Enterprise Executive Intelligence Platform. It sits above the systems an industrial company already runs and turns the organisation’s own information into a brief an executive can use. The executive decides. The platform does not run the plant, the dealer network, or the forecast.

For a machinery or industrial OEM, the first commercial entry point is manufacturing forecasting and executive decision support. The customer exports forecast and actual from the system they already trust. ExecutiveOS reads that file, shows what moved, shows where the evidence is too thin to support a claim, and frames the decision. It does not replace ERP, MRP, APS, or the dealer system.

This proposal asks Hitachi Construction Machinery Australia to consider a 30-day pilot of that single use case, for one operating entity. If the agreed success criteria are met, the subscription offered is the ExecutiveOS Platform. Managed Intelligence, Braltiq’s optional oversight service, is a separate line. During founder-led delivery the default service on that line is Essential. It is not included in the platform fee, and it is not included in the pilot.

The illustrative materials prepared for a Hitachi-class conversation use representative scenarios. Figures in those materials, including model movements and dollar amounts, are not Hitachi operational data. They are not the basis of this proposal. Several surfaces in those demonstration scripts, including inventory optimisation, dealer allocation, and working-capital management, are not active products and are not offered here.

All prices below are proposed, in Australian dollars, and exclusive of GST. GST is added where it applies. Nothing in this document is a price in force until it is on an order form.

---

## 2. Customer context and business challenges

### What this use case is built for

An Australian operating entity of a machinery or industrial OEM typically plans demand by model and by region or branch. Finished machines and parts tie up cash. The argument on a Monday is often forecast versus what the factory can build versus what the network is asking for. The planning lead can usually export forecast and actual without an integration project. The executive who owns the quality of that forecast is the buyer of the brief, not a new system of record.

That pattern is the reason ExecutiveOS enters through forecasting. It is an industry pattern. It is not a finding about Hitachi Construction Machinery Australia.

### What is not yet known about this account

The following are required before this proposal can describe Hitachi’s situation rather than the industry pattern. None of them is in Braltiq’s materials.

| Item | Status |
|---|---|
| Legal entity to be contracted, and ABN | [To be confirmed] |
| Operating entity in scope for the first file | [To be confirmed] |
| Executive sponsor | [Name, title] |
| Economic buyer | [Name, title] |
| Planning lead who owns the extract | [Name, title] |
| System the forecast is exported from | [To be confirmed. The pilot does not connect to it.] |
| Challenges in the customer’s own words | [To be recorded in the first meeting. Do not backfill from the demonstration script.] |
| Whether a forecast-versus-actual extract can be produced within two weeks | [To be confirmed] |
| Sites, plants, or dealer network in the first file | [To be confirmed. Scope is one entity, not the global group, unless a later order says so.] |

### Questions the pilot is designed to make answerable

These are the questions the forecasting brief is built to put in front of an executive, once a real file is loaded. They are not a claim that Hitachi cannot answer them today.

- Where did forecast and actual move, by model and by region or branch, in the periods the file actually contains?
- Which movements are large enough to deserve an executive, and which are noise?
- Where is the extract too thin to support a claim?
- What decision can be framed from that evidence, and what is still missing?
- What requires judgement this week?

Inventory position, factory slots, dealer allocation, and working capital are not answered as products in this proposal. If the customer chooses to include those columns in the file, the analysis may show an implication. An implication is not a module.

---

## 3. Proposed solution

### The platform

ExecutiveOS is the software. For this engagement it provides a manufacturing forecasting workspace for one operating entity: a weekly file in, an executive snapshot, and a brief that states what changed, how complete the evidence is, and what decision is framed. The customer’s executives remain accountable for the decision and for running the business.

The forecast comparison is calculated from the uploaded records. A missing field stays missing. It is not filled in. Where a narrative assistant is used, it advises. It does not decide, and it does not replace the forecast calculation.

### Current capabilities and planned capabilities

| In this proposal | Status |
|---|---|
| Manufacturing forecasting from the customer’s Excel or CSV export | Current. This is the use case being sold. |
| Field mapping, validation, and an immutable executive snapshot | Current. |
| Demand movement, forecast accuracy where actuals exist, regional or model divergence, data-quality gaps, and an executive judgement posture | Current, produced from the file. Accuracy is not concluded when actuals are absent. |
| Comparison of successive snapshots on the metrics both snapshots support | Current. |
| A decision framed from the evidence, chosen by the customer’s executive, with an owner and a next action when they record one | Current as a workflow. No decision has been recorded for Hitachi. |
| Weekly refresh by customer upload | Current path. |
| Capacity or inventory language when those columns are in the file | Implication only. The inventory, production-capacity, and dealer-demand modules are not active. |
| Live connection to ERP, Dynamics, SAP, or a dealer system | Not offered. Not required for the pilot. |
| Inventory optimisation, dealer-allocation automation, factory scheduling, MRP, APS, CMMS | Not active. Not in this proposal. |
| Working-capital management as a product | Not active. Not in this proposal. |
| Autonomous decisions, or Braltiq running the customer’s S&OP | Outside the product and outside the service. |
| A customer-specific or Hitachi-specific version of the software | Not offered. There is no Hitachi product fork. |
| SOC 2, ISO 27001, or an “enterprise compliant” certification | Not claimed. Braltiq does not hold these on the strength of the current record. |
| A configured retention and deletion SLA | Not yet configured. It will not be promised in this proposal. |

Planned capabilities stay on the commercial roadmap. They are not a commitment in this order. A later module is sold only when it exists, on its own line, with its own cost.

### Managed Intelligence, separate from the software

Braltiq Managed Intelligence is an optional recurring service. It is structured human oversight of intelligence the platform has already produced: what changed, whether the evidence is fit to use, which forecast movements matter, what deserves an executive, whether a decision has been framed, and where adoption is slipping.

It is not consulting, not a person placed inside the customer’s planning team, not an outsourced S&OP, and not an implementation project.

While Braltiq’s founder is delivering the service, **Essential is the default offer**. Advanced is the preferred enterprise offer only once specialist delivery capacity is funded and available. Strategic is reserved for a customer with a further executive forum and with capacity to support it. This proposal recommends Essential if Hitachi elects the service after a passed pilot. It does not include the service in the pilot fee or in the platform fee.

---

## 4. Initial use case and scope

### Use case

One operating entity. One forecasting use case. One file shape. Thirty days.

The file is a forecast-versus-actual extract. The minimum shape is model and forecast quantity. In practice the file should also carry period and actual quantity, and the region, branch, or dealer the customer actually plans with. Optional columns, such as capacity, inventory, or order bank, may be present. A missing field is reported as not established.

### In scope for the pilot

- The template and one mapping, aimed at reuse from the second upload.
- Upload of the customer’s file. Braltiq does not log into the customer’s ERP.
- An executive snapshot and the manufacturing forecast intelligence the current product produces from that file.
- One review against the success criteria in section 10.
- Braltiq delivery inside a cap of 15 hours.

### In scope only if a subscription follows

- The same workspace, weekly, for the contracted entity.
- Up to eight named executive users for that entity.
- Up to 2,000 small-model completions a month for that entity. Unused completions do not roll over. A larger model is not included.
- One hour a month of platform support for the account. The hour is for product use. It is not a meeting and not a written intelligence note.
- Standard hosting, product updates, maintenance, and product documentation.
- Activation, as a separate included line, capped at 12 hours. See section 7.
- Managed Intelligence only if it is on the order.

### Out of scope

- A second operating entity, unless a later order adds it.
- Any module that is not active.
- Custom software, bespoke integrations, and bespoke reports outside what the product produces.
- Data cleansing, re-keying the file, or building the customer’s forecast.
- Travel and on-site consulting.
- Unlimited model use.
- A change to the customer’s Council, planning calendar, or dealer contracts.

The demonstration scripts written for a Hitachi-class meeting walk factory health, dealer demand, inventory, production capacity, and working capital, and they use representative numbers. Those scripts are not this scope. If a meeting is held, the room is shown the forecasting pilot.

---

## 5. Solution workflow and outputs

### Workflow

The path is the one the design-partner pilot already runs. No production-system connection is required.

1. **Confirm the profile.** Manufacturing, forecasting, one entity.
2. **Upload.** The customer provides the Excel or CSV export.
3. **Map.** Source columns are confirmed against the forecasting contract. Model and forecast quantity are the minimum. Other columns are mapped only when they exist.
4. **Validate.** The product states what was received, what was understood, what is missing, what can be interpreted, and what cannot. Dataset readiness and judgement readiness are reported separately. Material problems are flagged. They are not silently repaired.
5. **Snapshot.** The accepted file becomes an immutable executive snapshot. A later upload creates another snapshot. History is not overwritten.
6. **Intelligence.** Manufacturing forecast intelligence is generated from that snapshot.
7. **Brief.** The executive opens the command centre on the question of what requires judgement, not on the upload screen.
8. **Decision.** The customer’s executive frames the choice, selects it, and names an owner when they choose to record one. Braltiq does not select the option.
9. **Refresh.** A weekly upload repeats steps 2 to 7. The same mapping is reused unless the file shape changes.

### Outputs the current product can produce

From the records in the snapshot:

- Demand movement.
- Forecast accuracy, only where actual demand is present. Without actuals, accuracy is reported as not concluded.
- Regional or model divergence, where those fields exist.
- Data-quality and coverage gaps, including missing periods, incomplete actuals, and inconsistent model identifiers.
- An executive judgement posture: monitor, investigate, insufficient evidence, or act. The posture is a classification of the evidence. It is not an instruction to the factory.
- A comparison with a prior snapshot where both snapshots support the metric.
- Where the customer included capacity or inventory columns, an implication drawn from those columns. The inventory module and the capacity module remain not active.

Each output carries the evidence it used. A claim without coverage is not upgraded to a fact.

### Outputs this proposal does not promise

- A forecast that is more accurate than the customer’s own forecast. Thirty days is not a window in which that can be claimed, and it is not a success criterion.
- A recommended factory order, a dealer allocation, or a stock transfer as a system action.
- A financial-impact figure. Demonstration materials that show dollar outcomes are scenarios. They will not be pasted into a Hitachi brief.
- An audit history screen for the executive. Ingestion and snapshot lineage are recorded. An executive-facing audit history page is not yet provided.
- Fine-grained permissions on every screen. Organisation roles exist. That is the claim. A full permission model is not claimed.

### Illustrative demonstrations

`docs/demos/HITACHI_MANUFACTURING_EXECUTIVE_DEMO.md` and `docs/demos/HITACHI_EXECUTIVE_JOURNEY_PRESENTATION.md` were written as conversation aids for a Hitachi-class audience. The journey document states that its illustrative numbers, including a model movement, a confidence figure, and a dollar figure, are discussion scenarios and not Hitachi confidential data. This proposal adopts that limit and goes one step further: those scenarios are not used as evidence of Hitachi’s operations, and the acts in the demonstration that depend on inactive modules are outside the offer.

---

## 6. Expected outcomes and measurement framework

### Outcomes this engagement is designed to produce

These are operating outcomes. They are not a savings claim. No revenue, margin, inventory, or working-capital improvement is stated for Hitachi, because no Hitachi file has been analysed and no result exists to report.

- A single snapshot in which forecast and actual, where actual exists, can be read together by model and by the region or branch in the file.
- Gaps stated in the open, rather than filled.
- At least one decision framed from that evidence, with the customer’s executive making the choice.
- A recorded yes or no to whether the next planning cycle should start from this brief.
- A plain record of what the product could not see.

### What will be measured

Measures are recorded when they happen. An empty measure stays empty. It is not estimated after the fact.

| Measure | What a number would mean | At the date of this proposal |
|---|---|---|
| Time from upload to the first executive insight | The file can be read as a brief | Not measured |
| Usable snapshot inside the first ten days | Data readiness | Not measured |
| Days the sponsor opens the brief | Whether the brief entered the week | Not measured. The pilot bar is four different days in the thirty. |
| Decisions framed from the snapshot | A choice with the evidence visible | None |
| Actions recorded | Follow-through the customer chose to log | None |
| Data-preparation issues | Friction in the file, counted | None |
| “Would you start the next planning cycle here?” | Yes or no, in the customer’s words | Not asked |
| Customer hours spent preparing the file | Effort, recorded at the time | Not recorded |

A passed pilot is a passed set of criteria in section 10. It is not a return-on-investment calculation. If Hitachi later wants a benefits case, it will be built from their figures, after the file exists, and it will be labelled as theirs.

---

## 7. Implementation and activation

### Pilot

The pilot is a fixed-term engagement. It is not a subscription and it is not Managed Intelligence.

| | Design partner | Paid pilot |
|---|---|---|
| When it applies | Only if Hitachi Construction Machinery Australia is accepted, in writing, as one of the first three design partners | Every pilot that is not one of those three |
| Fee | AUD $0 | AUD $15,000 |
| Term | 30 days | 30 days |
| Delivery cap | 15 hours | 15 hours |
| Use case | Manufacturing forecasting, one entity, one file | The same |
| Consideration if the fee is zero | Time, the file, and the right to discuss a case study. The case study is not published without agreement. | — |
| If the success criteria are met | The subscription is offered at the proposed platform rate. The zero fee does not become an ongoing discount. | The fee is credited in full against the first-year platform invoice for the initial entity, if the subscription is signed within 30 days of the review |
| What a credit does not reduce | — | Managed Intelligence, activation, or any additional entity |
| If the criteria are not met | The pilot stops | The pilot stops. The fee is not credited. The final clause is written on the order. |

This proposal does not itself accept Hitachi into a design-partner place. That acceptance is a separate written decision, and only three such places exist unless the cap is raised in writing.

No Managed Intelligence hours are included after day 30. A design partner is not given Essential or Advanced at no charge.

### Activation, if a subscription starts

Activation is the included setup of the subscription: the template, one mapping, the first snapshot, and the handover of the weekly upload. It is a separate line on the order.

| | Proposed term |
|---|---|
| Customer fee | AUD $0 |
| Cap | 12 hours |
| Travel | None |
| Custom integration | None |
| Data remediation | None |
| Consulting beyond the cap | None |

The line on the order reads: “Activation — included, 12 hours, no travel.”

The 15 pilot hours and the 12 activation hours are different work. The pilot tests the use case. Activation hands over the weekly rhythm of the subscription. If the pilot has already completed that handover, the activation hours on the subscription order are set to zero for the work already done. They are not billed twice, and they are not described as an implementation project.

Hours past the cap stop, or they are ordered as a prepaid block of three hours at AUD $450 an hour. That block is the same work, continued. It is not a cleansing or integration project.

### What the customer does

- Names the sponsor and the planning lead before the file arrives.
- Provides the extract, and a person who can explain a row that looks wrong.
- Attends the review.
- Decides.
- On a subscription, sends the file on the weekly rhythm.

Braltiq does not direct the customer’s week, and the customer does not direct Braltiq’s week beyond the agreed line.

---

## 8. Commercial investment

Proposed terms. Exclusive of GST. GST is added where it applies. Confirmed only on an order form.

The lines are separate so each one can be seen. A total is the sum of the lines. It is not a blended product.

### A. Opening pilot

| Line | Proposed investment |
|---|---|
| Pilot, if a design-partner place is granted | AUD $0. 30 days. 15 hours. One forecasting use case. |
| Pilot, if a design-partner place is not granted | AUD $15,000. Same term, same cap, same use case. |
| Managed Intelligence during the pilot | Not included. |
| Platform subscription during the pilot | Not included. The pilot is not an annual contract. |

### B. Subscription, offered only after the pilot criteria are met

One operating entity. Standard terms. The enterprise floor does not apply to this order. A single entity stays on the initial platform rate. A security questionnaire, by itself, does not change that rate.

| Line | What is being bought | Proposed investment |
|---|---|---|
| 1. ExecutiveOS Platform, initial operating entity | The forecasting workspace, the allowances in section 4, hosting, updates, maintenance, and one support hour a month for the account | AUD $9,500 a month. Term 12 months. 11 months charged. **Annual platform invoice AUD $104,500.** |
| 2. Managed Intelligence, Essential, or an explicit decline | Optional oversight. 6 hours a month. Not included in line 1. | AUD $3,000 a month if taken. **AUD $36,000 for the year, twelve months paid.** The platform’s concession does not apply to this line. |
| 3. Activation | Included setup, 12-hour cap, no travel | AUD $0 |
| 4. Additional operating entity | Not on this order | — |
| 5. Enterprise floor | Does not bind | AUD $0 |

The twelve-times monthly platform figure is AUD $114,000. That is the list value before the annual concession. The contracted platform amount is **AUD $104,500**. Proposals and invoices use the contracted amount.

If Essential is taken, the year-1 subscription total is **AUD $140,500** before GST: AUD $104,500 platform and AUD $36,000 service. If Essential is declined, the year-1 subscription total is **AUD $104,500**.

If the opening engagement was the paid pilot and the subscription is signed within 30 days of the review, AUD $15,000 is credited against the AUD $104,500 platform invoice. The customer does not pay the platform portion twice. The credit does not reduce the AUD $36,000 service line. If the opening engagement was a zero-fee design partnership, there is no credit and no lasting discount.

### C. What Essential includes, inside six hours a month

- A monthly intelligence review, preparation included, about 45 minutes in the room.
- A review of data quality and file readiness from the product’s own checks, not a re-key of the file.
- A review of forecast movement and of the exceptions that deserve a person.
- A one-page monthly summary: what changed, what is unfit to use, what decision is framed.
- Coordination of the service.
- A short quarterly note for the economic buyer, spread across the year inside the cap.

Unused hours expire at month end. A response is acknowledged in one business day. A substantive reply sits inside the reserved time, within two business days. This is not an incident desk.

### D. Service lines not recommended on this order

| Package | When it would be proposed | Proposed price | Cap |
|---|---|---:|---:|
| Advanced | After specialist delivery capacity is funded and available, and the planning argument needs the fuller review | AUD $6,500 a month | 12 hours |
| Strategic | A further executive forum, and capacity to support a named specialist | AUD $12,000 a month | 16 hours |

Neither package is the default while the founder is delivering. Neither is included in the Hitachi opening order unless a later written order says so.

Further hours of the same work, beyond a cap, are a prepaid block of three at AUD $450 an hour, and only when the person has the month. An on-site day is AUD $2,500 plus travel at cost, ordered on its own. Travel is never inside a package.

### E. Expansion, not committed here

| Later move | How it would be sold |
|---|---|
| Another operating entity | Platform, AUD $3,000 a month, 11 months charged on the annual invoice. Its own file, its own eight users, its own completion allowance. No Managed Intelligence hours. Sold only when tenant isolation for that customer has been confirmed. |
| Managed Intelligence for that entity | A second service line, bought explicitly. The first package does not stretch. |
| A material multi-entity contract | A platform floor of AUD $15,000 a month can apply when the order has two or more entities, the customer requires materially expanded governance, and the rate card is below the floor. A routine security questionnaire does not qualify. The floor is platform revenue. It does not include the service. It is not part of this single-entity proposal. |
| Inventory, capacity, dealer allocation, live ERP | Not available to sell. A future order, if a product exists, will be a new line. |

No renewal increase is quoted. Any later change is a separate order.

---

## 9. Governance, responsibilities and exclusions

### Responsibilities

| | Hitachi Construction Machinery Australia | Braltiq |
|---|---|---|
| The forecast number | Owns it | Does not own it and does not rebuild it |
| The decision | The executive decides | Frames evidence, choice, and the consequence of waiting, when the service is bought. Does not decide. |
| The file | Produces the extract and the weekly refresh. Explains a row that is wrong. | Maps once, validates, and flags gaps |
| The pilot review | The sponsor attends | Prepares and holds the review inside the hour cap |
| S&OP and the plant | Runs them | Does not run them |
| Case study | Agrees any public use, or refuses it | Does not publish without agreement |
| Commercial acceptance | Signs an order, or does not | Does not treat this proposal as an order |

### Data and security, stated only as far as the current record allows

- The pilot uses a file the customer provides. Braltiq does not take credentials to the source system for this use case.
- Uploaded files are processed through the product’s data gateway. An accepted dataset is stored as an immutable snapshot. Ingestion and snapshot lineage are recorded.
- Records are scoped by organisation in the current design. Durable enforcement across every production store is not claimed as complete.
- Retention for a pilot is not yet configured. This proposal does not state a deletion period.
- No certification claim is made. SOC 2 and ISO 27001 are not claimed. “Enterprise compliant” is not claimed.
- A routine security questionnaire can be answered from the written posture of what is implemented and what is not. Answering it does not change the platform price and does not certify the service.

### Exclusions, on every line

Managed Intelligence meetings are not in the platform fee. Platform access is not in the Managed Intelligence fee. Neither fee includes custom development, integrations, ERP implementation, data cleansing, operational management, running S&OP, travel, on-site consulting, or unlimited model use.

A request that the next industrial customer could not receive from the same offer is outside this proposal.

### Commercial governance

Each line in section 8 is identifiable on the proposal, the order, the invoice, and in Braltiq’s accounts. Service time is not invoiced as platform. A zero-price line is still printed, with its cap.

---

## 10. Success criteria and next steps

### Success criteria

Agreed before the file arrives. A failed criterion ends the pilot. A feeling that the meeting went well is not a pass. A forecast-accuracy improvement is not a criterion.

| Criterion | Pass |
|---|---|
| File | A usable snapshot in the first ten days, with gaps stated rather than filled |
| Executive use | The sponsor opens the brief on at least four different days in the thirty |
| Decision | At least one decision framed from the snapshot, with the evidence visible, and the customer’s executive choosing |
| Honesty | The customer can point to one variance or gap they did not previously have in one place, and to one thing the product could not see |
| Return | “Would you start the next planning cycle here?” answered yes or no |
| Delivery boundary | Braltiq’s time on the pilot stays inside 15 hours |

The review is on about day 25. It uses the file and the criteria. It is not a new demonstration.

If the criteria pass, Braltiq offers the subscription in section 8. If they fail, the engagement stops. A short extension is a separate decision. It is not a second pilot at no charge.

### Next steps

Nothing below has been done.

1. Hitachi confirms the legal entity, the sponsor, the economic buyer, and the planning lead.
2. Hitachi confirms that a forecast-versus-actual extract for one operating entity can be produced within two weeks, without an integration.
3. Both parties record the challenges in Hitachi’s words, and agree the success criteria, before a file is sent.
4. Braltiq confirms in writing whether one of the three design-partner places is offered. Until that letter, the paid pilot is the applicable opening fee.
5. On a pass, an order form is issued with the lines in section 8. This proposal is not that order.

No executive validation session has been held. No production deployment has occurred. No Hitachi operational result is claimed.

---

## Document history

| Date | What this file is |
|---|---|
| 2 November 2026 | First issue. Reusable industrial proposal. Hitachi Construction Machinery Australia is the working example. Prices follow the reconciled commercial architecture and remain proposed. |
