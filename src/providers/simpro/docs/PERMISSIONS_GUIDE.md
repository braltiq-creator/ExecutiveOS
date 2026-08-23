# Permissions Guide

Least-privilege read scopes for operational context:

| Scope | Purpose |
|-------|---------|
| `jobs:read` | Service delivery / capacity |
| `quotes:read` | Revenue pipeline |
| `customers:read` | Customer relationships |
| `sites:read` | Operating locations |
| `assets:read` | Asset availability |
| `staff:read` | Technician availability |
| `projects:read` | Project / margin health |
| `invoices:read` | Cash collection risk |
| `purchase_orders:read` | Supply chain risk |
| `schedules:read` | Scheduling bottlenecks |

Avoid write scopes. Excess scopes fail least-privilege validation.
