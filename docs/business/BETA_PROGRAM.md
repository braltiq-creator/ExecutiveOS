# ExecutiveOS Beta Program

## Objectives

1. **Validate daily habit** — ≥60% of beta executives open Intelligence Center ≥4 days/week by Week 4
2. **Prove time saved** — ≥3 hrs/week reclaimed per Chief of Staff (self-reported + usage proxy)
3. **Achieve executive NPS ≥40** at beta exit
4. **Convert ≥3 design partners** to paid Professional or Executive at GA
5. **Identify v1.0 blockers** — security, SSO, persistence, performance at scale
6. **Generate 2 publishable case studies** with named logos (or anonymized vertical stories)

---

## 10-Beta-User Plan

**Composition:** 10 organizations (not 10 individual users). Target 40–80 total seats.

| Slot | Profile | Industry | Plan Target | Purpose |
|------|---------|----------|-------------|---------|
| 1–4 | Primary ICP, CoS champion | B2B SaaS | Professional | Core workflow validation |
| 5–6 | CEO-direct (no CoS) | Professional services | Starter → Pro | Solo executive UX |
| 7–8 | Full exec office (CEO+CFO+COO) | Fintech / healthtech | Executive | Multi-seat, health analytics |
| 9–10 | Secondary ICP (division) | Financial services | Enterprise path | Procurement rehearsal |

### Recruitment Channels

1. **Founder network** — warm intros (target 5 slots)
2. **LinkedIn executive outreach** — CoS/Head of Strategy (target 3 slots)
3. **PE/VC portfolio ops** — operating partners refer portcos (target 2 slots)

### Selection Criteria (Must Have)

- [ ] Microsoft 365 deployed
- [ ] CEO or CoS commits to 8-week participation
- [ ] Weekly 30-min feedback call
- [ ] Willing to connect calendar integration
- [ ] ≥3 strategic objectives defined in onboarding
- [ ] English-speaking, US/UK/AU timezone overlap

### Disqualifiers

- No executive sponsor
- IT block on cloud AI without security review call
- Expectation of on-premise deployment

---

## Success Criteria

| Metric | Week 4 Target | Week 8 Target (Exit) |
|--------|---------------|----------------------|
| Weekly Active Executives (WAEx) | ≥70% of enrolled execs | ≥80% |
| Intelligence Center opens/week | ≥4 per active exec | ≥5 |
| Advisor consultations/week | ≥2 per org | ≥3 |
| Knowledge graph rebuild success | 100% orgs | 100% |
| Decisions logged | ≥5 per org | ≥15 |
| Initiatives tracked | ≥3 per org | ≥5 |
| NPS | ≥30 | ≥40 |
| Critical bugs (P0/P1) open | ≤2 | 0 |
| Paid conversion intent | ≥50% say "likely" | ≥3 signed LOI/PO |

---

## Weekly Cadence

| Day | Activity | Owner |
|-----|----------|-------|
| **Monday** | Review usage dashboard (`METRICS.md` KPIs) | CEO + Product |
| **Tuesday** | Beta customer calls (2× 30 min) | CEO |
| **Wednesday** | Bug triage + ship fixes | Engineering |
| **Thursday** | Product demo of week's improvements (optional group) | CEO |
| **Friday** | Beta pulse survey (async) + internal retro | CEO |

### Week-by-Week Program

| Week | Theme | Milestone |
|------|-------|-----------|
| 1 | Onboarding + first brief | Day 0–1 playbook complete |
| 2 | Decisions + initiatives populated | Graph has ≥20 nodes |
| 3 | Advisors + meeting prep | First collaborative advisor query |
| 4 | Health analytics (Executive slots) | Week 4 success checkpoint |
| 5 | Integrations (CRM if Enterprise path) | M365 fully synced |
| 6 | Deep interview + NPS baseline | Mid-beta NPS |
| 7 | ROI documentation | Time-saved worksheet |
| 8 | Exit interview + conversion conversation | Beta exit decision |

---

## Interview Questions

### Week 2 — Activation Interview (30 min)

1. Walk me through your first morning with ExecutiveOS. What did you open first?
2. What insight surprised you on the Intelligence Center?
3. What's missing that you expected to see?
4. How does this compare to how you started your day before?
5. Would you recommend your CEO open this daily? Why/why not?

### Week 4 — Depth Interview (45 min)

1. Which advisor do you use most? Least? Why?
2. Tell me about a decision you logged. Did it change anything?
3. How accurate is meeting preparation vs. reality?
4. What's the Knowledge Graph useful for today? What's confusing?
5. If we removed one feature, what could you live without?
6. If we removed ExecutiveOS entirely, what would you miss most?

### Week 8 — Exit Interview (60 min)

1. Rate 1–10: How likely are you to pay for ExecutiveOS at GA?
2. What ROI have you experienced (hours saved, decisions accelerated)?
3. Who else in your network needs this?
4. What blocked daily usage for any team member?
5. What must ship before you'd sign an annual contract?
6. May we publish a case study? Named or anonymized?

---

## Feedback Forms

### Weekly Pulse (Async — 5 questions, Friday)

1. How many days did you open ExecutiveOS this week? (0–7)
2. Most valuable feature this week? (dropdown)
3. Biggest frustration? (free text, required)
4. One thing we should improve next week? (free text)
5. Confidence ExecutiveOS will be part of your daily workflow? (1–5)

### Bug Report Template

```
Organization:
Reporter name + role:
Severity: P0 (blocked) / P1 (major) / P2 (minor) / P3 (cosmetic)
Page/feature:
Steps to reproduce:
Expected vs. actual:
Screenshot/recording:
Workaround (if any):
```

**Process:** Email `support@executiveos.com` or shared Slack channel (Enterprise beta). P0 response ≤4 hours. P1 ≤24 hours.

### Feature Request Template

```
Problem statement (1 sentence):
Who experiences this (role):
Current workaround:
Proposed solution:
Priority: Must-have for GA / Nice-to-have / Future
Willing to co-design: Y/N
```

**Process:** Log in product backlog. CEO reviews weekly. Commit only if ≥2 beta orgs request OR aligns with roadmap outcomes.

---

## NPS Survey (Week 4 + Week 8)

**Question:** *How likely are you to recommend ExecutiveOS to another executive or Chief of Staff?* (0–10)

**Follow-ups:**
- Primary reason for score?
- What would increase your score by 2 points?

**Segments:** CEO, CoS, CFO/other exec. Analyze separately.

| Score | Segment |
|-------|---------|
| 9–10 | Promoter — ask for referral + case study |
| 7–8 | Passive — diagnose friction, assign fix |
| 0–6 | Detractor — CEO call within 48 hours |

---

## Exit Criteria (Beta → GA)

### Go

- [ ] NPS ≥40 across promoters
- [ ] ≥3 paid conversion commitments (LOI or verbal + contract sent)
- [ ] P0/P1 bug backlog zero
- [ ] Migration 010 applied in production
- [ ] Security one-pager published
- [ ] ≥2 case studies drafted

### No-Go (Extend Beta 4 Weeks)

- WAEx <60% at Week 8
- NPS <25
- Unresolved P0 security finding
- Zero conversion intent

---

*Related: `ONBOARDING_PLAYBOOK.md`, `METRICS.md`, `CEO_PLAYBOOK.md`*
