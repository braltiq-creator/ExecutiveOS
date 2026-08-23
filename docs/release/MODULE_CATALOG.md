# Module Catalog — Version 1

Every platform module: purpose, architecture, public APIs, extension, developer notes, future Intelligence Profiles.

## Ownership map

```
App (src/app) → Runtime (src/runtime) → Platform engines → Core intelligence
                              ↓
                     Experience presentation
```

Core engines must not be modified by Adaptive, Growth, Commercial, or Experience packaging.

---

## Core / Intelligence — `src/intelligence/`

| | |
|--|--|
| **Purpose** | Deterministic executive reasoning: snapshot, intent, judgement, executive memory |
| **Architecture** | Engines compose into `buildExecutiveSnapshotForUi` / runtime Today pipeline |
| **Public APIs** | `@/intelligence/executive-intelligence`, `executive-intent`, `executive-judgement`, `executive-memory` |
| **Extension** | Add engines behind existing builders; never fork snapshot types lightly |
| **Profiles** | Profile projection packages Core output; Core stays profile-agnostic |
| **Notes** | See per-engine README + `docs/ARCHITECTURE.md` |

## Experience — `src/experience/`

| | |
|--|--|
| **Purpose** | Experience 2.0 presentation: Brief, tokens, motion, a11y |
| **Architecture** | Design-system primitives + layouts + `executive-brief` client view over runtime experience |
| **Public APIs** | `@/experience`, design-system, cards, layouts, motion, `actionToExperienceCard` |
| **Extension** | New surfaces use Experience primitives; do not invent a fourth UI kit |
| **Profiles** | Presentation only; profile copy comes from projection |
| **Notes** | Calm warm light; scanning hierarchy fixed on Brief |

## Strategy — `src/strategy/`

| | |
|--|--|
| **Purpose** | Trace recommendations to strategic outcomes |
| **Architecture** | Outcomes, initiatives, metrics, alignment, health, attach-today |
| **Public APIs** | `@/strategy` (`attachStrategicOutcomesToTodayActions`, dashboard, reset) |
| **Extension** | New outcome types via strategy stores; keep distinct from `lib/outcomes` portfolio |
| **Profiles** | Operations vs commercial emphasis via profileId |
| **Notes** | Admin `/admin/strategy` |

## Outcomes engine — `src/outcomes/`

| | |
|--|--|
| **Purpose** | Recommendation → business outcome → ROI learning (value engine) |
| **Architecture** | Tracks, actions, impact, ROI, analytics |
| **Public APIs** | `@/outcomes` |
| **Extension** | Feed confirmed ROI into Adaptive value learning |
| **Profiles** | Outcome taxonomies may vary by profile later |
| **Notes** | Not the `/outcomes` portfolio SoT (`lib/outcomes`) |

## Trust — `src/trust/`

| | |
|--|--|
| **Purpose** | Explainability, evidence, confidence bands, provenance, review |
| **Architecture** | Attach explanations to Today actions; admin dashboard |
| **Public APIs** | `@/trust` |
| **Extension** | New evidence kinds without changing Core scores |
| **Profiles** | Explanation depth personalised by Adaptive |
| **Notes** | `/admin/trust` |

## Adaptive — `src/adaptive/`

| | |
|--|--|
| **Purpose** | Explainable personalisation of presentation/ranking only |
| **Architecture** | Preferences → behaviour → recommendation-learning → ranking → governance |
| **Public APIs** | `@/adaptive` |
| **Extension** | New disposition types must stay explainable + resettable |
| **Profiles** | Framework keyed by `IntelligenceProfileId` — reusable |
| **Notes** | Never mutate Core recommendation generation |

## Growth — `src/growth/`

| | |
|--|--|
| **Purpose** | PLG: trial, activation, Executive Value Score |
| **Architecture** | Checkout, subscriptions, activation path, value engine UI strip |
| **Public APIs** | `@/growth` |
| **Extension** | New activation steps stay under 5-minute path |
| **Profiles** | Value narratives may vary by edition |
| **Notes** | Customer-facing; Commercial is internal packaging |

## Commercial — `src/commercial/`

| | |
|--|--|
| **Purpose** | Braltiq-internal editions, licensing, CS, ROI packs |
| **Architecture** | Editions → licenses → implementation → renewals |
| **Public APIs** | `@/commercial` |
| **Extension** | New editions without changing Core |
| **Profiles** | Edition ↔ profile packaging matrix |
| **Notes** | `/admin/commercial` only |

## Experiments — `src/experiments/`

| | |
|--|--|
| **Purpose** | Pilot hypotheses, cohorts, product intelligence feed |
| **Architecture** | Hypotheses → experiments → insights; anonymised telemetry |
| **Public APIs** | `@/experiments` |
| **Extension** | Adaptive improvements feed via `feedImprovementsToProductIntelligence` |
| **Profiles** | Cohort by profile |
| **Notes** | Internal only |

## Memory — `src/memory/`

| | |
|--|--|
| **Purpose** | Organisational memory: episodes, lessons, recall |
| **Architecture** | Episodes → patterns → lessons → attach-today |
| **Public APIs** | `@/memory` |
| **Extension** | New episode kinds with recall explanations |
| **Profiles** | Recall ranking may use Adaptive later |
| **Notes** | Distinct from `intelligence/executive-memory` (session) and `lib/memory` |

## Scenarios — `src/scenarios/`

| | |
|--|--|
| **Purpose** | Design-partner scenario packs and scorecards |
| **Architecture** | Packs, questions, validation, attach-today |
| **Public APIs** | `@/scenarios` |
| **Extension** | New packs per industry/profile |
| **Profiles** | Pack selection by Intelligence Profile |
| **Notes** | See README |

## Council — `src/agents/`

| | |
|--|--|
| **Purpose** | Deterministic Executive Council multi-agent reasoning |
| **Architecture** | Agent definitions → convene → council view |
| **Public APIs** | `@/agents` (`conveneExecutiveCouncil`, `toCouncilView`) |
| **Extension** | Add agents with deterministic rules; no LLM-required path |
| **Profiles** | Council composition may vary by profile |
| **Notes** | UI Advisors still on `@/lib/agents` (KI-005) |

## Knowledge — `src/knowledge-graph/` (+ `lib/knowledge`)

| | |
|--|--|
| **Purpose** | Executive Knowledge Graph for traversal and explainability |
| **Architecture** | Graph provider → queries → intelligence consumers |
| **Public APIs** | `@/knowledge-graph`, `@/lib/knowledge` |
| **Extension** | New node/edge types via provider contract |
| **Profiles** | Industry graphs (e.g. Northline mock) |
| **Notes** | Primary `/knowledge` is foundation in V1 (KI-001) |

## Administration — `src/app/administration` + `/admin/*`

| | |
|--|--|
| **Purpose** | Executive settings hub + Braltiq system admin |
| **Architecture** | Link hub for customers; deep dashboards for operators |
| **Public APIs** | Pages only |
| **Extension** | New admin modules get UTILITY_NAV entry + dashboard |
| **Profiles** | N/A |
| **Notes** | Keep utility out of morning brief |

## Providers — `src/providers/`

| | |
|--|--|
| **Purpose** | Production connectors (M365, Salesforce, Simpro) |
| **Architecture** | Per-provider auth, sync, webhooks, admin UI |
| **Public APIs** | Per-provider trees; connectivity SDK |
| **Extension** | Follow connectivity certification guides |
| **Profiles** | Field-services profile ↔ Simpro |
| **Notes** | Extensive provider docs already |

## Design system

| Layer | Path | Use for |
|-------|------|---------|
| Tokens | `src/design-system/tokens.*` + `globals.css` | Colour, type, space |
| Experience | `src/experience/design-system` | Executive product UI |
| UI kit | `src/components/ui` | Forms, admin chrome, Storybook |
| Legacy Executive* | `src/design-system/components` | Snapshot/decision remnants — do not expand |
