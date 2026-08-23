# Constitution vs Implementation — Inconsistencies Summary

**Date:** 2026-07-20  
**Sprint:** 3.5 Platform Foundation  
**Scope:** Gaps between `EXECUTIVEOS_CONSTITUTION_v1.md` and the current codebase  
**Rule:** Document only — no behaviour changes in this sprint  

---

## Summary

Phase 1A–3 engines and shell largely match Articles I–IV for Outcome/Decision/Briefing. Gaps concentrate in: incomplete primary surfaces, dual legacy domains, design-token migration debt in UI primitives, missing Attention Budget chrome, and design docs that still describe superseded defaults.

---

## A. Aligned (no action required for Constitution compliance)

| Area | Evidence |
|------|----------|
| Positioning metadata | Root layout title/description match OS framing |
| Six-item primary nav | `PRIMARY_NAV` + AppShell |
| Default landing `/today` | Executive Briefing implemented; `/dashboard` redirects |
| Aliases | `/advisors`→`/insights`, `/graph`→`/knowledge` |
| Outcome Health chrome | `OutcomeHealthRibbon` |
| Typography stack | Inter + Geist + Geist Mono in layout |
| Dark-first theme | `data-theme="dark"` default + tokens in `globals.css` |
| Outcome SoT + Decision coupling | OutcomeProvider / DecisionProvider / portfolio model |
| Provider order | Outcome → Decision → Intelligence → ExecutiveBriefing |
| Explain-before-recommend on briefing signals | What/Why/Next + recommendation fields |

---

## B. Product / IA gaps

| ID | Constitution expectation | Current state | Severity |
|----|--------------------------|---------------|----------|
| B1 | Insights, Actions, Knowledge, Reports are primary product destinations | Knowledge/Reports are Experience foundations (KI-001); Intent is utility; Actions may still be thin | Expected (Article VII); deepen in V1.1 |
| B2 | Attention Budget visible in shell chrome (IA) | Not implemented beside Outcome Health | Medium |
| B3 | Confidence Exit / circadian Briefing↔Operating modes | Board Mode exists; Confidence Exit and circadian mode switching not productised | Medium / roadmap |
| B4 | Outcome Engine as first-class product concept | `/outcomes` exists but is listed under **utility** nav (`UTILITY_NAV`), not IA primary — acceptable as deep link, but Outcomes are not discoverable in primary nav by design | Low (by design) — document intentional |
| B5 | Assistant / Advisors subordinate to OS | `/assistant` still exists; Insights nav treats `/assistant` as active Insights child | Low — migration residue |
| B6 | Calendar, meetings, initiatives as operational feeds | Separate routes (`/calendar`, `/meetings`, `/initiatives`) remain outside six-item IA | Medium — consolidate or demote to utility |

---

## C. Domain / engineering dual systems

| ID | Issue | Severity |
|----|-------|----------|
| C1 | **Dual decision models:** Engine `Decision` vs legacy `ExecutiveDecisionRecord` (Supabase register) | High until unification ADR |
| C2 | **Dual briefing models:** `ExecutiveBriefingData` vs legacy `MorningBrief` | Medium |
| C3 | **Intelligence Center** types/services coexist with Briefing OS without Constitution retirement plan | Medium |
| C4 | Outcome Insight/Action refs are embedded projections, not first-class Action/Insight engines yet | Expected until later phases |
| C5 | Real AI / agents / OpenAI packages present in repo while engines are mock-first — risk of chat-first or AI-lead surfaces conflicting with Articles I–II | Medium (governance) |

---

## D. Design system debt

| ID | Constitution expectation | Current state | Severity |
|----|--------------------------|---------------|----------|
| D1 | Tokens from `globals.css` for product UI | Many `src/components/ui/*` primitives still use **zinc / emerald / amber / sky** Tailwind palettes (e.g. `badge.tsx`) instead of EOS semantic tokens | High for design consistency |
| D2 | Design Bible / VISUAL_IDENTITY rewritten to FDR | Docs still describe superseded typefaces/IA in places | Medium (docs debt) |
| D3 | Morning Briefing canvas (FT Pink) as Briefing mode language | Token `--eos-briefing` exists; not consistently applied as a distinct Briefing mode surface | Low–Medium |
| D4 | Rounded-full pills discouraged as brand default (workshop anti-patterns / restraint) | `Badge` uses `rounded-full` | Low |
| D5 | Storybook as documentation surface | Added in Sprint 3.5; coverage starts at UI primitives (see STORYBOOK.md) | Resolved for foundation |

---

## E. Accessibility & polish

| ID | Issue | Severity |
|----|-------|----------|
| E1 | WCAG AA claimed as minimum — no automated a11y gate in CI for Storybook/app yet | Medium |
| E2 | Outcome Health unavailable state when provider absent — correct for optional hook, but some shell contexts may show “—” more often than Constitution’s “persistent signal” implies | Low |

---

## F. Recommended resolution order (future sprints — not Sprint 3.5)

1. Tokenise remaining UI primitives (D1) — no product feature work.  
2. Attention Budget chrome (B2) with IA.  
3. Unification ADR for Decision register vs Decision Engine (C1).  
4. Retire or quarantine Intelligence Center / MorningBrief vs Briefing OS (C2–C3).  
5. Build Insights → Actions → Knowledge → Reports per phase plan (B1).  
6. Rewrite Design Bible / VISUAL_IDENTITY to match FDR (D2).  

---

## G. Explicit non-issues for this sprint

- Mock portfolio data (Constitution allows mock-first engines).  
- Placeholder Insights/Actions/Knowledge/Reports (Article VII).  
- Outcomes reachable via ribbon and utility nav rather than primary nav (IA intentional).  
- No Phase 4 work begun.
