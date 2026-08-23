# ExecutiveOS Pricing Strategy

## Pricing Philosophy

ExecutiveOS prices on **executive team value**, not per-document AI usage.

- **Value metric:** Leadership seats (executives + Chiefs of Staff)
- **Usage guardrails:** AI requests and storage prevent abuse, not drive revenue
- **Land:** Professional plan with CoS champion
- **Expand:** Seat adds + Executive upgrade when CFO/CRO adopt advisors
- **Enterprise:** Custom ACV for SSO, integrations, SLA, and Agentforce/ERP connectors

Benchmarks: Notion Business (~$20/user), ChatGPT Enterprise (~$60/user), Copilot (~$30/user). ExecutiveOS commands premium at Executive tier because of **proactive intelligence + graph + advisors** — closer to vertical SaaS than horizontal AI.

---

## Plan Overview (Implemented in Product)

| Plan | Monthly | Annual (prepaid) | Effective Monthly | Seats | Target Buyer |
|------|---------|------------------|-------------------|-------|--------------|
| **Starter** | $49 | $470 | ~$39 | 3 | Individual executive |
| **Professional** | $149 | $1,430 | ~$119 | 10 | Leadership team / CoS |
| **Executive** | $349 | $3,350 | ~$279 | 25 | Executive office |
| **Enterprise** | $999 | $9,590 | ~$799 | 999 | Division / global |

*Prices from `007_billing.sql` — stored in cents. Annual discount ≈ 20%.*

---

## Feature Matrix

| Capability | Starter | Professional | Executive | Enterprise |
|------------|:-------:|:------------:|:---------:|:----------:|
| Executive Intelligence Center | ✅ | ✅ | ✅ | ✅ |
| AI Chief of Staff | ✅ | ✅ | ✅ | ✅ |
| Executive Memory | ✅ | ✅ | ✅ | ✅ |
| Decisions Register | ✅ | ✅ | ✅ | ✅ |
| Initiatives + Health | ✅ | ✅ | ✅ | ✅ |
| Meetings Register | ✅ | ✅ | ✅ | ✅ |
| Knowledge Graph | ✅ | ✅ | ✅ | ✅ |
| Multi-Agent Advisors | ✅ | ✅ | ✅ | ✅ |
| Organization + Team | ✅ | ✅ | ✅ | ✅ |
| **Meeting Intelligence** | ❌ | ✅ | ✅ | ✅ |
| **Enterprise Health Analytics** | ❌ | ❌ | ✅ | ✅ |
| **Unlimited Memory (storage tier)** | ❌ | ❌ | ✅ | ✅ |
| **Future Integrations (CRM, etc.)** | ❌ | ❌ | ❌ | ✅ |
| Microsoft 365 Calendar | ✅ | ✅ | ✅ | ✅ |
| Billing self-serve (Stripe) | ✅ | ✅ | ✅ | Custom |

*Feature flags: `ai_chief_of_staff`, `meeting_intelligence`, `enterprise_health_analytics`, `unlimited_memory`, `future_integrations`*

---

## Usage Limits

| Limit | Starter | Professional | Executive | Enterprise |
|-------|---------|--------------|-----------|------------|
| **AI requests / month** | 100 | 1,000 | 5,000 | 100,000 |
| **Storage** | 5 GB | 50 GB | 200 GB | 1 TB |
| **Seats included** | 3 | 10 | 25 | 999 |
| **Rate limit (CoS)** | 30/min | 30/min | 30/min | Configurable |
| **Rate limit (Advisors)** | 20/min | 20/min | 20/min | Configurable |

### Usage Overage Policy (Beta → v1.0)

| Scenario | Beta Policy | GA Policy (recommended) |
|----------|-------------|-------------------------|
| AI limit reached | Soft block + upgrade prompt | 10% grace buffer, then upgrade or pack |
| Storage limit | Soft block | $50/50GB add-on |
| Seat overage | Block invites | Auto-seat true-up on Enterprise |

---

## Support Tiers

| Plan | Support | SLA |
|------|---------|-----|
| Starter | Email, docs, community | Best effort (48h) |
| Professional | Email + onboarding call | 24h business |
| Executive | Priority email + quarterly review | 8h business |
| Enterprise | Dedicated CSM + Slack channel | 4h + 99.9% uptime SLA |

---

## Recommended Beta Pricing

**Do not charge beta design partners full price.**

| Offer | Terms |
|-------|-------|
| **Beta Partner** | Free for 8 weeks |
| **Beta → GA conversion** | 50% off Year 1 on Professional or Executive |
| **Beta testimonial/case study** | Additional 10% off (max 60% total) |
| **Founding Executive logo** | Executive plan locked at $249/mo for 24 months |

Rationale: Beta validates outcomes (time saved, NPS), not willingness-to-pay curves. WTP testing begins at beta exit with 3 paid conversions at ≥50% discount.

---

## Annual Pricing Strategy

- **Default sales motion:** Quote annual (20% discount already in product)
- **Cash flow:** Offer 2-year prepay at 25% discount for Enterprise only
- **Renewal:** Auto-renew with 60-day price lock notice (Stripe portal)

---

## Enterprise Licensing

| Component | Model |
|-----------|-------|
| **Base platform** | $999/mo minimum or $80K ACV floor |
| **Seats beyond 25** | $25–40/seat/month (role-dependent) |
| **AI volume** | Pooled requests; $500 per 10K incremental |
| **SSO (SAML)** | Included at Enterprise (build in v1.0) |
| **Custom integrations** | Professional services $200/hr or SOW |
| **Data residency** | EU/AU region premium 15% (v2.0) |
| **Pilot → rollout** | 90-day pilot at 50% ACV; convert to MSA |

---

## Packaging Decisions (Beta Learnings to Validate)

| Hypothesis | Test in Beta |
|------------|--------------|
| CoS buys Professional, CEO triggers Executive upgrade | Track upgrade path by role |
| Meeting Intelligence is key Professional differentiator | Feature usage correlation with retention |
| Health Analytics drives Executive upgrade | Gate demo behind Executive in sales |
| Starter is PLG top-of-funnel, not revenue driver | Conversion Starter → Pro within 60 days |

---

## Competitive Price Positioning

| Alternative | Cost | ExecutiveOS Equivalent |
|-------------|------|------------------------|
| Copilot × 10 execs | $300/mo | Professional $149 (half price, 10× depth) |
| ChatGPT Enterprise × 10 | $600/mo | Professional $149 |
| CoS assembly time (10 hr/wk) | ~$3,000/mo loaded | Professional $149 — **20× ROI** |
| Human EA/CoS (partial) | $8K/mo | Executive $349 — augmentation narrative |

**ROI anchor for sales:** *"If ExecutiveOS saves your Chief of Staff 5 hours per week, it pays for itself 15× over."*

---

*Related: `SALES_PLAYBOOK.md`, `IDEAL_CUSTOMER_PROFILE.md`, `BETA_PROGRAM.md`*
