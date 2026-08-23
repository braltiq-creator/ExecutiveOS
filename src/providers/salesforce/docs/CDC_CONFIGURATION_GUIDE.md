# CDC Configuration Guide

## Purpose

Change Data Capture drives incremental commercial synchronisation with watermarks and replay recovery.

## Channels

Enable CDC for:

- OpportunityChangeEvent
- AccountChangeEvent
- CaseChangeEvent

## Behaviour

1. Initial full sync establishes baseline BusinessEvents.
2. CDC applies incremental changes against checkpoints.
3. Gaps mark the channel `gap` and require recovery from a known `replayId`.
4. Recovery restores `active` status and continues watermarking.

## Admin

**Administration → Salesforce** shows CDC active/gap counts and last commit time.

## Replay

Use **Replay** to re-emit journaled BusinessEvents for a connection after recovery.
