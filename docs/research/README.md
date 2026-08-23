# Executive Intelligence Research Library (EIRL)

**Version:** 1.0.0  
**Status:** Canonical research foundation (Phase 49)  
**Owner:** Braltiq / ExecutiveOS Research  
**Last updated:** 2026-08-08  
**Nature:** Research — not product documentation, not application code

---

## Mission

Capture **how exceptional executives think** — synthesising recognised management thought, proven executive practice, industry frameworks, and decision science into reusable Executive Intelligence.

This library is the permanent foundation for:

- Every Executive Council member (present and future)
- Every Executive Intelligence Pack
- Every industry capability entered through EIPF

**Behavioural layer (Phase 50):** Research feeds [`../intelligence-models/README.md`](../intelligence-models/README.md) (`src/intelligence-models/`) — how executives *reason*.  
**Judgement layer (Phase 51):** [`../judgement-framework/README.md`](../judgement-framework/README.md) (`src/judgement-framework/`) — whether action is required. Packs then supply industry *context*.

It does **not** describe product features. It does **not** authorise Core changes or pack implementation.

---

## Principles

1. **Thinking over job descriptions** — mental models, trade-offs, and judgement patterns matter more than org-chart bullets.
2. **Version everything** — every document carries `Version`, `Status`, `Last updated`.
3. **Separate sources from synthesis** — cite established references; label ExecutiveOS / Braltiq synthesis clearly.
4. **Evolve continuously** — this is a living intellectual asset, not a one-off dump.
5. **No product leakage** — do not document UI, routes, providers, or pack TypeScript here.

---

## Library map

| Folder | Purpose |
|--------|---------|
| [`executives/`](./executives/) | How each C-suite role thinks and decides |
| [`industries/`](./industries/) | Industry structures, economics, executive priorities |
| [`frameworks/`](./frameworks/) | Recognised management frameworks |
| [`decision-science/`](./decision-science/) | Judgement, bias, systems, risk, learning |
| [`case-studies/`](./case-studies/) | Distilled lessons from practice (anonymised / public) |
| [`references/`](./references/) | Master bibliography and source taxonomy |

---

## Versioning convention

```yaml
Version: MAJOR.MINOR.PATCH
Status: Draft | Canonical | Deprecated
Last updated: YYYY-MM-DD
```

- **MAJOR** — structural rethink of the role/industry/framework  
- **MINOR** — material new sections or synthesis  
- **PATCH** — corrections, citations, clarity  

Superseded versions: note `Supersedes:` / `Superseded by:` in the document header when replaced.

---

## How to use this library

| Consumer | Use |
|----------|-----|
| EIPF pack authors | Ground outcomes, ontology, Council knowledge, KPIs |
| Council designers | Role mental models, disagreements, rhythms |
| Reality Lab designers | Scenarios, anti-patterns, warning indicators |
| Design Partners prep | Industry context and executive language |
| Braltiq leadership | Intellectual asset; continuous research backlog |

**Manufacturing Discovery Blueprint** ([`../intelligence-packs/manufacturing/`](../intelligence-packs/manufacturing/README.md)) should cite this library; it must not replace it.

**Architecture index:** [`../architecture/README.md`](../architecture/README.md)

---

## Research quality bar

A document is ready for `Canonical` when it includes:

- Clear purpose and scope  
- Mental models / frameworks (not only responsibilities)  
- Trade-offs and anti-patterns  
- Signals and indicators  
- Industry or role variation notes  
- References split into **Established** vs **ExecutiveOS synthesis**  

---

## Change process

1. Propose research delta (role, industry, framework, or decision-science topic).  
2. Update the document version.  
3. Update [`references/BIBLIOGRAPHY.md`](./references/BIBLIOGRAPHY.md) if sources change.  
4. Note implications for packs/Council in the document’s “Implications for ExecutiveOS” section (research-facing only).  

---

*Confidence Through Clarity — earned through how executives think, not through features alone.*
