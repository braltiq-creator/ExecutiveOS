# ExecutiveOS Sales Playbook

## Sales Motion Overview

**Model:** Founder-led sales (beta) → 1 AE hire at $500K ARR  
**Cycle:** 2–6 weeks (Primary ICP) | 8–16 weeks (Enterprise)  
**Entry point:** Chief of Staff or CEO warm intro  
**Close:** Professional or Executive annual plan via Stripe (beta: LOI → invoice)

---

## Discovery (Call 1 — 30 min)

### Goals
- Qualify ICP (score ≥7 on ICP matrix)
- Identify champion + economic buyer
- Uncover quantified pain

### Discovery Questions

**Situation**
1. Walk me through how your CEO starts their day today.
2. Who assembles leadership context — CoS, EA, strategy team?
3. How many strategic initiatives are actively tracked? Where?
4. What's your executive stack — M365, Salesforce, Notion?

**Pain**
5. How long does weekly exec brief preparation take?
6. When did a decision get lost or re-debated because context was missing?
7. What did your last board prep cycle look like? Hours spent?
8. Have you rolled out Copilot or ChatGPT? What's the executive adoption?

**Impact**
9. If your CEO reclaimed 3 hours/week, what would they reinvest in?
10. What happens when initiative health is invisible until quarterly reviews?

**Decision**
11. Who signs software for the executive office — CEO, CoS, CIO?
12. Timeline for improving executive operating rhythm?
13. Budget envelope for leadership tooling this fiscal year?

### Qualification (MEDDIC-lite)

| Element | Question to Answer |
|---------|------------------|
| **Metrics** | Hours/week on briefs; # initiatives at risk |
| **Economic buyer** | CEO? COO? |
| **Decision criteria** | Security, M365, proactive vs. chat |
| **Decision process** | IT review needed? |
| **Identify pain** | Assembly time, visibility, decision loss |
| **Champion** | CoS engaged and credible? |

**Disqualify if:** No exec sponsor, no M365, no strategic planning discipline.

---

## Demo Flow (Call 2 — 45 min)

**Rule:** Demo the prospect's reality, not a scripted fake company. Use their objectives if pre-collected.

| Min | Section | Screen | Talk Track |
|-----|---------|--------|------------|
| 0–3 | Hook | Intelligence Center | "This is what your CEO sees before email — ranked priorities, no prompting." |
| 3–10 | Proactive intelligence | Priority strip + cards | "Critical attention scored by impact, urgency, alignment. Pulled from *your* initiatives and risks." |
| 10–18 | Operating artifacts | Initiatives + Decisions | "Strategy isn't slides — it's tracked execution with health scores." |
| 18–25 | Knowledge graph | `/graph` | "Which meetings connect to Initiative Alpha? Which risks block Objective 2?" |
| 25–33 | Advisors | `/advisors` collaborative query | "Strategy Advisor and Risk Advisor collaborate; Chief of Staff synthesizes." |
| 33–38 | Meeting prep | `/calendar` | "Tomorrow's board prep — linked decisions, risks, memory." |
| 38–42 | Team + billing | Organization, seats | "Built for executive offices, not individuals." |
| 42–45 | Next steps | — | Beta invite or trial terms |

**Demo don'ts:** Don't start in chat. Don't apologize for beta. Don't feature-dump integrations unless Enterprise.

---

## ROI Conversation

### Time-Saved Model (CoS)

| Input | Conservative | Moderate |
|-------|--------------|----------|
| CoS hours/week on briefs + prep | 8 hr | 12 hr |
| % reclaimable by ExecutiveOS | 40% | 50% |
| Loaded hourly cost | $75 | $90 |
| **Monthly value** | **$960** | **$2,160** |
| Professional plan cost | $149 | $149 |
| **ROI** | **6.4×** | **14.5×** |

### Decision Velocity Model (CEO)

*"If ExecutiveOS accelerates one strategic decision by 2 weeks, what's that worth to your Q3 objective?"* — Qualitative anchor for CEO buyers.

### ROI Slide (Verbal)

> "Professional is $149/month. If your CoS saves 5 hours a week at $75 loaded, that's $1,500/month in reclaimed capacity — 10× ROI before counting better decisions."

---

## Handling Objections

| Objection | Response |
|-----------|----------|
| **"We have Copilot."** | "Copilot helps inside Word and Outlook. ExecutiveOS is the layer above — proactive priorities, initiative health, decision graph. They coexist; we replace the CoS spreadsheet, not M365." |
| **"We use ChatGPT."** | "ChatGPT is stateless. ExecutiveOS maintains executive memory, logs decisions, and surfaces overnight changes on your dashboard. ChatGPT answers; ExecutiveOS anticipates." |
| **"Execs won't adopt."** | "That's why we built proactive intelligence — no prompting required. Beta partners see CEOs open the dashboard before email within Week 2." |
| **"Security / AI data."** | "Org-scoped RLS, encrypted integration tokens, no model training on your data by contract. Happy to walk your CISO through architecture." |
| **"Too early / beta risk."** | "Controlled beta with 8-week white-glove onboarding, founder access, 50% Year 1 pricing. You shape v1.0." |
| **"Too expensive."** | "Compare to CoS time, not Copilot seats. One hour saved per week pays for the platform." |
| **"Build internally."** | "12–18 months to replicate graph, advisors, health engine, billing, integrations. You're live in 2 weeks." |

---

## Security Questions (CISO Cheat Sheet)

| Question | Answer |
|----------|--------|
| Where is data stored? | Supabase (Postgres), region configurable at Enterprise |
| Authentication? | Supabase Auth; SSO SAML on Enterprise roadmap v1.0 |
| Authorization? | Row-level security per organization |
| AI provider? | OpenAI API; data not used for training (API terms + DPA) |
| Integration tokens? | AES encrypted at rest (`INTEGRATION_TOKEN_ENCRYPTION_KEY`) |
| Audit trail? | Usage metering; full audit log on Enterprise roadmap |
| Rate limiting? | Per-user AI limits; abuse prevention |
| Compliance? | SOC 2 Type II target: Q2 post-GA |

---

## Competitive Positioning in Deals

See `COMPETITOR_ANALYSIS.md`. In every deal, establish:

1. **Category:** Executive Intelligence Platform (not PM, not generic AI)
2. **Wedge:** Proactive Intelligence Center (10-second "aha")
3. **Moat:** Compounding graph + memory
4. **Coexistence:** M365 required; Copilot complementary

---

## Enterprise Procurement

| Stage | Duration | ExecutiveOS Action |
|-------|----------|-------------------|
| Security questionnaire | 1–2 weeks | Provide architecture + security review docs |
| Legal (MSA/DPA) | 2–4 weeks | Standard SaaS MSA; redlines on liability cap |
| Pilot proposal | 1 week | 90-day pilot, 50% ACV, success criteria defined |
| PO + provisioning | 1 week | Enterprise plan, dedicated onboarding |

**Beta shortcut:** Design partner MSA-lite (2 pages) + DPA for 8-week beta.

---

## Closing Strategy

### Beta Close (Week 8)

1. Present ROI worksheet from onboarding data
2. Share product roadmap through v1.0 (what they asked for → committed dates)
3. Offer: **50% Year 1** + locked pricing for 24 months if signed within 30 days of GA
4. Ask: *"If we ship [their #1 blocker] by [date], will you sign Professional/Executive annual?"*
5. Send Stripe checkout link or enterprise invoice same day

### GA Close (Post-Beta)

- **Champion close:** CoS internal memo template provided
- **Executive close:** 15-min CEO call — ROI + peer reference
- **Procurement close:** Security pack pre-built; no custom docs per deal under $50K ACV

### Closing Timeline

| Day | Action |
|-----|--------|
| 0 | Demo + beta invite |
| 1–3 | Follow-up: recap + ROI one-pager |
| 7 | Check-in: onboarding started? |
| 14 | Mid-beta: usage review |
| 56 | Exit interview + conversion offer |
| 60 | Contract signed or disqualified |

---

*Related: `POSITIONING.md`, `PRICING.md`, `IDEAL_CUSTOMER_PROFILE.md`*
