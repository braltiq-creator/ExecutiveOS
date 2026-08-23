# Providers

## Purpose

Production connectors that bring operational systems into ExecutiveOS without
owning Core intelligence.

## Architecture

Per-provider trees under `microsoft365/`, `salesforce/`, `simpro/`, composed with
the connectivity SDK (`src/connectivity`).

## Public APIs

Provider-specific modules and admin routes:

- `/admin/microsoft365`
- `/admin/salesforce`
- `/admin/simpro`

## Extension guidance

Follow connectivity certification guides. New providers must not fork snapshot builders.

## Developer notes

Each provider ships deployment, permissions, and troubleshooting docs.

## Future Intelligence Profiles

Field-services profile pairs with Simpro; commercial profiles with Salesforce/M365.
