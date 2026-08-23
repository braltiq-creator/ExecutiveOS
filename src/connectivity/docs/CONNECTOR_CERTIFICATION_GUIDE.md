# Connector Certification Guide

A connector is certified when it:

1. Implements the shared lifecycle (connect → disconnect)
2. Uses a platform authentication strategy (no bespoke secret handling)
3. Emits **only** BusinessEvents (no vendor leakage)
4. Reports platform health (connection, auth, sync, errors, retries, events, latency, data quality)
5. Supports at least one sync mode (incremental recommended)
6. Isolates failures (retry / DLQ without affecting other connectors)
7. Passes simulation tests (auth expiry, rate limit, network, permanent, partial)
8. Documents mapping definitions and execution ownership boundaries

Certification does **not** require production credentials — mock + simulation is sufficient for platform compliance.
