# Reality Lab — Simulation Architecture

## Organisations

Each `SimulatedOrganisation.createContext()` returns an isolated stack:

- `EnterpriseDataProvider` (portfolio-backed signals)
- `KnowledgeGraph`
- `ExecutiveIntentProfile`
- `ExecutiveMemoryStore`
- `EnterpriseDigitalTwin` + seed `BusinessEvent`s

## Scenarios

`ExecutiveScenario.apply(context)` overlays:

1. Twin business events
2. Signal pressure (health deltas, overnight signals, scenario Decision)
3. Graph entities for new risks/opportunities

## Runner

`runScenario(org, scenario)` executes:

Intelligence → Intent → Memory → Judgement → Evaluation → Benchmarks

and returns a full `LabRunResult` capture.
