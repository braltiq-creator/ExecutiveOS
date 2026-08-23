# Trust & Explainability

## Purpose

Make every recommendation explainable: evidence, confidence, reasoning path,
provenance, and executive review — without changing Core scores.

## Architecture

Explanation records attach to Today actions via `attachTrustExplanationsToTodayActions`.
Admin dashboard aggregates trust health at `/admin/trust`.

## Public APIs

`@/trust` — attach, explanations, evidence, confidence, audit, reviews, dashboard, reset.

## Extension guidance

- Add evidence kinds; keep explanations human-readable.
- Never overwrite Core confidence with opaque model scores.

## Developer notes

Today cards expose Trust panel + review controls when `explanationId` is present.

## Future Intelligence Profiles

Explanation templates may vary by profile; the attachment contract stays stable.
