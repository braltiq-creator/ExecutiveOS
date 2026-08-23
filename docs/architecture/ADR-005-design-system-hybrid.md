# ADR-005: Design System Hybrid (Tokens, Type, Theme)

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 3.5 Platform Foundation  

## Context

Design Workshops define visual/experiential direction; the Design Bible retains scalable engineering patterns. Typography and theme defaults conflicted across sources. A hybrid with explicit founder overrides is required.

## Decision

1. **Hybrid Option C:** Workshops / Creative Studio = visual & experiential SoT; Design Bible = engineering patterns retained where scalable.  
2. **Typography (canonical):**  
   - UI: **Inter**  
   - Display / marketing: **Geist**  
   - Scores / IDs / timestamps: **Geist Mono**  
3. **Theme:** Dark-first product shell (Phase 1A); Briefing may use circadian/morning canvas language from workshops without abandoning institutional dark chrome.  
4. **Tokens:** CSS variables in `src/app/globals.css` are the runtime design-token surface for product UI.  
5. **Anti-patterns:** No sparkles, no chat-first product home, no anthropomorphized AI chrome, no purple mesh gradients as brand default.  
6. FDR and Constitution supersede Design Bible / VISUAL_IDENTITY where they conflict; Bible rewrite is deferred (not Sprint 3.5).

## Consequences

### Positive

- Clear type stack for engineering  
- Tokens centralised for Storybook and app  
- Aligns Phase 1A implementation with governance  

### Negative / trade-offs

- Design Bible and VISUAL_IDENTITY docs may still describe IBM Plex / other defaults until rewritten  
- Storybook must import the same token CSS as the app  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| IBM Plex Sans (workshop default) | Founder override: Inter |
| Light-first product shell | Founder / Phase 1A: dark-first |
| Pure Bible visual system | Conflicts with workshop Briefing OS direction |

## References

- `docs/design/FRONTEND_DECISION_RECORD.md` §4  
- `src/app/globals.css`  
- `src/app/layout.tsx`  
- Constitution § Design Principles  
