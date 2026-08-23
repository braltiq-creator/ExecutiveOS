# 2. Navigation Architecture

**Phase 36 · Experience Alignment**  

---

## 2.1 Mental model

```
┌────────────────────────────────────────────────────────────┐
│  ExecutiveOS · Confidence Through Clarity                  │
│  [Search] [Profile]                                        │
├──────────┬─────────────────────────────────────────────────┤
│ Today    │  L1 Command Centre                              │
│ Strategy │  L2 Workspace                                   │
│ Decisions│  L2 Workspace                                   │
│ Knowledge│  L2 Workspace                                   │
│ Reports  │  L2 Workspace                                   │
│ Admin.   │  L2 Workspace (+ L3 utility)                    │
└──────────┴─────────────────────────────────────────────────┘
```

**Logo / BrandMark → always `/today`.**

---

## 2.2 Primary navigation (canonical)

Exactly **six** items. Labels are product UI language.

| ID | Label | Route | Icon | Role |
|----|-------|-------|------|------|
| `today` | Today | `/today` | Calendar | Command Centre |
| `strategy` | Strategy | `/strategy` | Target | Outcomes & direction |
| `decisions` | Decisions | `/decisions` | Brain | Judgment register |
| `knowledge` | Knowledge | `/knowledge` | Book Open | Memory & context |
| `reports` | Reports | `/reports` | File Text | Narrative & value |
| `administration` | Administration | `/administration` | Settings | System & access |

### Rules

1. No seventh primary item.  
2. Active state: one primary selected; nested routes inherit parent highlight.  
3. Mobile: same six in bottom bar.  
4. Utility destinations (billing, integrations, adaptive, admin ops) live under Administration or Account — never primary.  
5. Aliases: `/dashboard` → Today family; `/graph` → Knowledge family; `/intent` → Strategy family; `/team`, `/settings/*`, `/organization` → Administration family.

---

## 2.3 Shell chrome

Persistent across authenticated product routes:

| Zone | Contents |
|------|----------|
| Sidebar brand | Ledger mark + **ExecutiveOS** + *Confidence Through Clarity* |
| Sidebar nav | Primary six |
| Sidebar footer | Organisation name · Executive title |
| Top bar | Module icon + page title (or “Command Centre” on Today) · Search · Profile |
| Top bar (non-Today) | Outcome Health ribbon may remain as secondary signal |
| Breadcrumb | Optional L2→L3 trail; never on Today |

---

## 2.4 Utility / account navigation

Available via Account menu and command palette — not primary nav.

Examples: Executive Value (`/value`), Subscribe, Activate, Insights, Actions, Settings, Billing, Integrations, Adaptive, Operations admin, Pilots, Trust admin.

**Experience rule:** Utility pages still inherit EXS (icons, cards, headers, motion). They are not a second design language.

---

## 2.5 Command palette

Search is a **navigation accelerator**, not a fourth IA axis.

- Opens from shell Search / ⌘K  
- Returns destinations from primary + utility registries  
- Selecting a result is a standard drill (page dive transition)  
- Does not invent new destinations outside the registries  

---

## 2.6 Navigation anti-patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| “Dashboard” as primary label | Today is Command Centre |
| Duplicate Strategy links in utility without Admin grouping | Dilutes primary map |
| Opening L3 evidence inside Today | Breaks 30-second rule |
| Different icons for same concept across pages | Breaks recognition |
| Hard page cuts without EXS transition | Breaks “dive deeper” feeling |

---

**Next:** [Information Architecture](./03_INFORMATION_ARCHITECTURE.md)
