# Platform Constitution

## Purpose

ExecutiveOS Core is architecturally complete.  
Future innovation happens **around** the Core, not inside it.

## Protected Core

The Core Platform owns:

- Business Events
- Enterprise Digital Twin
- Knowledge Graph
- Executive Memory
- Executive Intent
- Executive Intelligence
- Executive Judgement
- Executive Council
- Reality Lab
- Executive Experience

These components are protected. Extensions must not modify them directly.

## Extension surface

Everything else is an extension:

- Executive Knowledge Packs
- Connectors
- Benchmark / Scenario / Judgement Rule providers
- Agent Extensions
- Narrative / Vocabulary / Notification providers

## Universal language

**Business Events** are the only enterprise language above the connector boundary.  
Vendor objects (SAP, Maximo, Simpro, …) never enter Intelligence, Twin consumers, or the UI.

## Non-negotiables

1. No Knowledge Pack may modify Core logic
2. Multiple connectors may run simultaneously
3. A pack must work with any BusinessEvent-producing connector
4. Extension contracts remain stable when AI model routing changes
5. Semantic versioning + compatibility validation on every registration
