# Platform Governance

## Extension lifecycle

1. Design against contracts
2. Implement + unit test
3. Compatibility validate
4. Security review (vendor boundary)
5. Register in Plugin Registry
6. Release (semver)
7. Deprecate / replace as needed

## Compatibility rules

- Platform major must satisfy extension `minPlatform`
- SDK range optional but recommended
- Same-major convention preferred; cross-major emits warning

## Security boundaries

- Vendor credentials and payloads stay inside connectors
- Only BusinessEvents cross the boundary
- Notification providers receive executive-safe payloads only

## Performance expectations

- Connector sync should be incremental-friendly (`since`)
- Replay must be bounded (`limit`)
- Registry operations are in-memory and O(n) over registered extensions

## Testing requirements

See Extension Developer Guide.

## Release process

1. Semver bump
2. Changelog entry
3. Compatibility matrix update
4. Registry smoke test (`bootPlatform`)
5. Tag release
