# Reasoning Rules — Field Services

Reusable judgement rules (never hardcoded Decisions):

| Rule | Pattern | Hypothesis |
|------|---------|------------|
| high_util_falling_margin | High util + falling margin | Operational efficiency issue |
| backlog_low_availability | High backlog + high util | Delivery risk increasing |
| sales_vs_capacity | Strong conversion + weak capacity | Growth constrained by operations |
| recurring_callouts_quality | Low FTFR + reactive mix | Quality issue |
| high_overtime_retention | Extreme util / weak people health | Future retention risk |
| sla_vs_workload | Strong SLA + high backlog | Discipline holding; capacity still tight |
| cash_after_projects | Weak collection + high WIP | Cash conversion lag |
| concentration_risk | High customer concentration | Portfolio concentration risk |

Rules emit `JudgementRuleHit` with evidence and a suggested **stance** (leaning), not a bind.
