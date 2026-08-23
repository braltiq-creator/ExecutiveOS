# Future Integration Guide — Simpro

## Today

- `SimproDomainAdapter` consumes mock Simpro domain events/objects
- Emits canonical `BusinessEvent`s only
- Reality Lab + optional `industryPack: "field-services-simpro"` on snapshot builder

## Next

1. **OAuth connector** implementing `EnterpriseConnector` with `fetchRaw` → adapter
2. **Webhooks** for quote/job/invoice/technician events → adapter → Twin incremental `apply`
3. **Scheduled sync** for KPI aggregates (utilisation, FTFR, backlog, AR)
4. **Replace mock benchmarks** with anonymised peer datasets
5. **Multi-company Simpro** tenancy mapped to ExecutiveOS organisation id

## Invariant

If Simpro is replaced with another FSM, only the adapter changes.  
Twin, Graph, Intelligence, Intent, Memory, Judgement, and Reality Lab stay intact.
