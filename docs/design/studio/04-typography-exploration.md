# Part 4 — Typography Exploration

*Eight typefaces evaluated for ExecutiveOS. Design Bible chose Geist. Studio challenges whether Geist carries sufficient institutional weight.*

---

## Evaluation Criteria

| Criterion | Question |
|-----------|----------|
| **Authority** | Would this appear in a board pack beside Goldman Sachs? |
| **Modernity** | Does it feel 2026, not 2016 or 1996? |
| **Readability** | 15px body, 8+ hour daily use, aging eyes |
| **Enterprise perception** | CIO approval + CEO aspiration |
| **Differentiation** | Distinct from Linear (Inter), Notion (custom), Bloomberg (custom) |

---

## Typeface Profiles

### Inter
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●○○○ | Optimized for screens, not for gravitas. Default startup font 2019–2026. |
| Modernity | ●●●●○ | Contemporary but ubiquitous |
| Readability | ●●●●● | Excellent at small sizes |
| Enterprise | ●●●○○ | Developer tool, not executive instrument |
| Differentiation | ●○○○○ | Linear, GitHub, Figma settings — invisible |

**Verdict:** Reject as primary. Acceptable as fallback only.

---

### Geist *(Design Bible choice)*
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●●○○ | Clean Vercel lineage — tech-forward, not board-forward |
| Modernity | ●●●●● | Peak contemporary |
| Readability | ●●●●○ | Strong; slightly tight at 15px |
| Enterprise | ●●●○○ | Reads "well-funded startup" not "institution" |
| Differentiation | ●●●○○ | Better than Inter; still crypto-adjacent via Vercel association |

**Verdict:** Retain for **UI components and data tables** during transition. Not final wordmark or marketing typeface.

---

### SF Pro
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●●●○ | Apple authority by association — licensed restriction on web |
| Modernity | ●●●●● | iOS-native executives expect it on mobile |
| Readability | ●●●●● | Best-in-class optical sizing |
| Enterprise | ●●●●○ | Premium consumer, not enterprise-native |
| Differentiation | ●●●○○ | Apple ecosystem only; licensing blocks web marketing |

**Verdict:** Use on **native iOS app only** (future). Not web primary.

---

### IBM Plex Sans
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●●●● | Designed for enterprise permanence. IBM Research pedigree. |
| Modernity | ●●●●○ | Slightly industrial — intentional |
| Readability | ●●●●● | Excellent x-height, generous counters |
| Enterprise | ●●●●● | Maximum enterprise signal. CIO-safe. |
| Differentiation | ●●●●○ | Distinct from Inter/Geist crowd. IBM association is feature for enterprise buyers. |

**Verdict:** **★ Strong contender for product UI.** Pairs with institutional colour system (#07).

---

### Söhne (Klim)
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●●●● | Neue Haas digitization. Swiss precision. Stripe uses it. |
| Modernity | ●●●●● | Contemporary classic |
| Readability | ●●●●● | Superb |
| Enterprise | ●●●●● | Stripe proved Söhne at enterprise scale |
| Differentiation | ●●●●○ | Expensive. Stripe-adjacent but not identical if paired with different colour |

**Verdict:** **★ Top recommendation for wordmark and marketing.** License cost justified at GA.

---

### Neue Haas Grotesk
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●●●● | The original Helvetica. Vignelli. NASA. |
| Modernity | ●●●○○ | Timeless but reads "1960" in headlines without careful weight selection |
| Readability | ●●●●○ | Narrower than Inter |
| Enterprise | ●●●●● | Institutional maximum |
| Differentiation | ●●●●● | Only if executed with editorial restraint |

**Verdict:** **Marketing and print only.** Product UI too cold at 15px body.

---

### General Sans
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●○○○ | Geometric sans — friendly, not authoritative |
| Modernity | ●●●●○ | Trend-forward |
| Readability | ●●●●○ | Good |
| Enterprise | ●●○○○ | Consumer SaaS |
| Differentiation | ●●●○○ | Crowded geometric space |

**Verdict:** Reject.

---

### Manrope
| Dimension | Score | Notes |
|-----------|-------|-------|
| Authority | ●●●○○ | Semi-geometric, slightly warmer than Inter |
| Modernity | ●●●●○ | Contemporary |
| Readability | ●●●●● | Excellent |
| Enterprise | ●●●○○ | Neutral |
| Differentiation | ●●●○○ | Better than Inter, not distinctive enough |

**Verdict:** Acceptable fallback. Not recommended.

---

## Recommended Pairings

### Pairing A — ★ STUDIO PRIMARY: "The Institution"

| Role | Typeface | Weight | Size |
|------|----------|--------|------|
| Wordmark | **Söhne Buch** | 500 | — |
| Display / h1 | **Söhne Halbfett** | 600 | 28–40px |
| Body | **IBM Plex Sans** | 400 | 15px |
| Body emphasis | **IBM Plex Sans** | 500 | 15px |
| Overline | **IBM Plex Sans** | 500, uppercase, 0.08em tracking | 11px |
| Data / scores | **IBM Plex Mono** | 500 | 13–32px |
| Marketing hero | **Söhne Buch** | 500 | 48–64px |

**Why:** Söhne carries Stripe-proven enterprise premium for brand moments. IBM Plex carries IBM-proven institutional trust for daily 8-hour reading. The pairing says: *premium on first impression, trustworthy on the thousandth.*

---

### Pairing B — "The Editorial"

| Role | Typeface | Weight |
|------|----------|--------|
| Wordmark | **Novela Display** or **Tiempos Headline** | — |
| Body | **IBM Plex Sans** | 400 |
| Data | **IBM Plex Mono** | 500 |

**Why:** FT Pink palette (#04) demands editorial serif headlines. Best for marketing site and board PDF exports. Too formal for daily product UI.

---

### Pairing C — "The Operating System" (Budget-conscious)

| Role | Typeface | Weight |
|------|----------|--------|
| All UI | **IBM Plex Sans + Mono** | — |
| Wordmark | Custom logotype from Plex | — |

**Why:** Single family, zero licensing cost, maximum enterprise signal. Ship now; upgrade wordmark to Söhne at Series A.

---

### Pairing D — "Transition" (Current codebase)

| Role | Typeface | Weight |
|------|----------|--------|
| All UI | **Geist Sans + Mono** | — |

**Why:** Already deployed. Valid for beta. Plan migration to Pairing A or C at v1.0.

---

## Typography Scale (Studio Recommended)

| Token | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| display-xl | 48px | 1.1 | -0.02em |
| display | 40px | 1.15 | -0.02em |
| h1 | 28px | 1.25 | -0.01em |
| h2 | 22px | 1.3 | -0.01em |
| h3 | 18px | 1.35 | 0 |
| body | 15px | 1.6 | 0 |
| body-sm | 13px | 1.5 | 0 |
| caption | 12px | 1.4 | 0.01em |
| overline | 11px | 1.3 | 0.08em |
| mono-lg | 32px | 1.2 | -0.02em |
| mono | 13px | 1.4 | 0 |

**Challenge to Design Bible:** 15px body on Geist is correct size, wrong face. IBM Plex at 15px/1.6 is measurably more readable in 8-hour sessions (open counters, taller x-height).

---

## Authority Ranking (Overall)

| Rank | Typeface | Best Use |
|------|----------|----------|
| 1 | Söhne | Wordmark, marketing, hero |
| 2 | IBM Plex Sans | Product UI, body, navigation |
| 3 | Neue Haas Grotesk | Print, board exports |
| 4 | IBM Plex Mono | Scores, data, timestamps |
| 5 | Geist | Beta transition only |
| 6 | SF Pro | iOS native (future) |
| 7 | Manrope | Fallback |
| 8 | Inter | Do not use |
