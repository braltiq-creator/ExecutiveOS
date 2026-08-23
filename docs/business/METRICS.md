# ExecutiveOS Success Metrics

## Metrics Philosophy

Track **executive outcomes**, not vanity usage. Every metric maps to beta success criteria or GA growth engine.

**Review cadence:** Weekly (beta) → Monthly (GA)  
**Source of truth:** Product usage tables + beta surveys + Stripe

---

## North Star Metric

**Weekly Active Executives (WAEx)** — Unique executives who open Intelligence Center ≥1× per week.

*Why:* ExecutiveOS value is daily proactive intelligence. If CEOs aren't opening the dashboard, nothing else matters.

**Beta target:** ≥80% of enrolled executives by Week 8  
**GA target:** ≥70% WAEx at Day 90 post-signup

---

## Activation Metrics

| Metric | Definition | Beta Target | GA Target |
|--------|------------|-------------|-----------|
| **Signup → Org created** | User completes org setup | ≥95% | ≥90% |
| **Onboarding complete** | Profile + ≥3 objectives | ≥90% | ≥85% |
| **Calendar connected** | M365 integration active | ≥80% | ≥75% |
| **Time to first insight** | Hours from signup to Intelligence Center with ≥1 card | <24 hr | <24 hr |
| **Time to first decision** | Days until first decision logged | ≤3 days | ≤5 days |
| **Time to first advisor query** | Days until first `/advisors` consultation | ≤7 days | ≤14 days |
| **Activation rate** | Org hits Week 2 milestones (`ONBOARDING_PLAYBOOK.md`) | ≥70% | ≥60% |

---

## Engagement Metrics

| Metric | Definition | Beta Target | GA Target |
|--------|------------|-------------|-----------|
| **DAEx (Daily Active Executives)** | Execs opening Intelligence Center per day / total execs | ≥40% | ≥35% |
| **WAEx (Weekly Active Executives)** | North star | ≥80% | ≥70% |
| **Intelligence Center opens/week** | Per active executive | ≥5 | ≥4 |
| **Morning brief opens** | Digest type = morning_brief views | ≥3/week/exec | ≥3/week |
| **Advisor consultations/week** | `consultAdvisorsAction` per org | ≥3 | ≥2 |
| **Chief of Staff messages/week** | AI assistant usage per org | ≥5 | ≥3 |
| **Graph searches/week** | Search + query actions | ≥2 | ≥1 |
| **Meeting prep views/week** | Calendar page + prep sections | ≥2 | ≥2 |

---

## Feature Depth Metrics

| Metric | Definition | Insight |
|--------|------------|---------|
| **Knowledge Graph node count** | Nodes per org | Graph richness |
| **Graph rebuild frequency** | Rebuilds per month | Data freshness |
| **Decisions logged** | Cumulative per org | Judgment compounding |
| **Initiatives at risk %** | At-risk + off-track / total | Health engine value |
| **Memory entries** | Active memory count | Knowledge capture |
| **Multi-agent chains** | Collaborative orchestration % | Advisor depth |
| **Integration connections** | Connected providers per org | Enterprise readiness |

---

## Retention Metrics

| Metric | Definition | Beta Target | GA Target |
|--------|------------|-------------|-----------|
| **Week 1 retention** | Orgs active in Week 1 who are active in Week 2 | ≥85% | ≥80% |
| **Week 4 retention** | Orgs active in Week 4 | ≥75% | ≥70% |
| **Week 8 retention (beta exit)** | Orgs still WAEx ≥60% | ≥70% | — |
| **Logo churn** | Orgs cancel or go dark >14 days | ≤10% beta | ≤5% monthly GA |
| **Seat churn** | Individual exec stops logging in >30 days | Track | ≤8% quarterly |

---

## Expansion Metrics

| Metric | Definition | GA Target |
|--------|------------|-----------|
| **Seat expansion rate** | Net new seats / existing seats per quarter | ≥15% |
| **Plan upgrade rate** | Starter→Pro, Pro→Executive per quarter | ≥10% |
| **AI limit upgrade triggers** | Orgs hitting 80% AI limit | Track → upsell |
| **Net revenue retention (NRR)** | Including expansion | ≥110% Year 1 |
| **Multi-department adoption** | Enterprise: >1 division | Track v2.0 |

---

## Outcome Metrics (Qualitative + Proxy)

| Metric | Measurement | Beta Target |
|--------|-------------|-------------|
| **Time saved (CoS)** | Weekly survey: hours saved | ≥3 hr/week |
| **Decision velocity** | Avg days decision stays in draft/under_review | ↓20% by Week 8 |
| **Executive satisfaction** | CSAT (1–5) weekly | ≥4.0 |
| **NPS** | Week 4 + Week 8 survey | ≥40 at exit |
| **Meeting prep adequacy** | "Prep was sufficient" (1–5) | ≥3.8 |
| **Would pay at GA** | Exit survey % "Likely" or "Very Likely" | ≥60% |
| **Referral intent** | "Would recommend to peer" | ≥50% |

---

## Business Metrics

| Metric | Beta Target | GA Target (Month 6) |
|--------|-------------|---------------------|
| **Beta orgs** | 10 | — |
| **Paid conversions** | 3 | 15 customers |
| **MRR** | $0 (beta) | $25K |
| **ACV (average)** | — | $18K |
| **CAC** | Founder time only | <$5K |
| **Sales cycle (days)** | Track | ≤45 (Primary ICP) |
| **Pipeline coverage** | 3× quota | 3× |

---

## Metrics Dashboard (Implement Beta Week 1)

| Source | Data |
|--------|------|
| `organization_usage` table | AI requests, storage, artifact counts |
| Supabase auth logs | DAU/WAU sign-ins |
| Application logs | Intelligence Center loads, advisor calls |
| Stripe | MRR, churn, plan distribution |
| Typeform/Google Forms | NPS, pulse surveys |

**Weekly CEO review:** WAEx, activation failures, NPS trend, P0 bugs, pipeline.

---

## Metric Ownership

| Metric Category | Owner |
|-----------------|-------|
| Activation + engagement | Product + CEO |
| Retention + NPS | CEO + Customer Success |
| Revenue + expansion | CEO (sales) |
| Feature depth | Product |
| Outcome (time saved) | CEO (customer interviews) |

---

*Related: `BETA_PROGRAM.md`, `CEO_PLAYBOOK.md`, `ROADMAP.md`*
