# ExecutiveOS Platform

Stable extension architecture. Core remains protected.

## Layout

```
src/platform/
  contracts/     Extension contracts
  sdk/           Manifest + helpers
  framework/     Plugin registry + boot
  extensions/    Built-in packs & connectors
  versioning/    Semver + compatibility
  governance/    Constitution, guides, ADR
```

## Boot

```ts
import { bootPlatform } from "@/platform";

const registry = bootPlatform();
```

## Docs

- [Platform Constitution](./governance/PLATFORM_CONSTITUTION.md)
- [Extension Developer Guide](./governance/EXTENSION_DEVELOPER_GUIDE.md)
- [SDK Reference](./governance/SDK_REFERENCE.md)
- [ADR-010](./governance/ADR-010-PLATFORM_EXTENSION_ARCHITECTURE.md)
- [Extension Examples](./governance/EXTENSION_EXAMPLES.md)
- [Migration Guide](./governance/MIGRATION_GUIDE.md)
- [Governance](./governance/GOVERNANCE.md)
