# Design Partner Data Onboarding

## Journey

| Step | Executive question |
|------|-------------------|
| Welcome | Let's establish your Executive Forecasting Environment. |
| Data | Upload your forecasting dataset. |
| Profile | Confirm Manufacturing · Forecasting. |
| Mapping | Confirm source fields. |
| Validation | What is ready — and what is missing? |
| Snapshot | Create an immutable Executive Snapshot. |
| Intelligence | Generate Manufacturing Forecast Intelligence. |
| Command Centre | What requires executive judgement today? |

**IMPLEMENTED:** Snapshot Studio wizard step copy (`STUDIO_STEP_META`), route `/onboarding/snapshot`.

## Honesty surfaces

The validation experience must communicate:

| Surface | Meaning |
|---------|---------|
| What we received | Source + record count via UDG |
| What we understood | Quality / coverage / freshness / relationships |
| What is missing | Material gaps |
| What we can confidently interpret | Supported insights |
| What we cannot yet interpret | Unsupported conclusions |

**IMPLEMENTED:** `buildDesignPartnerReadinessSummary`, Readiness Dashboard split (Dataset % vs Judgement %).

## Dataset readiness vs judgement readiness

These are **never collapsed**.

Example:

- Dataset readiness 94%
- Executive judgement readiness 78%

**IMPLEMENTED:** Studio `StudioReadiness` fields + Design Partner summary helper.

## Data quality issues

Material problems are **flagged**, not silently repaired.

Examples: missing forecast periods, incomplete actual demand, missing capacity / inventory days, inconsistent model identifiers.

Safe automatic normalisation must be documented when it occurs.

**SUPPORTED BY CURRENT ARCHITECTURE:** Analysis `missingInformation` + readiness recommendations.  
**NOT YET IMPLEMENTED:** Exhaustive per-field auto-normalisation catalogue UI.

## Snapshot library

Repeated uploads create immutable historical snapshots.

Comparison (when both sides support the metric):

- Demand movement
- Actual vs forecast
- Confidence movement
- Capacity movement
- Inventory movement

**IMPLEMENTED:** `compareManufacturingSnapshots`, Snapshot Library comparison panel.  
Historical snapshots are never mutated.
