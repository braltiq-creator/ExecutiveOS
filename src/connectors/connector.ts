import type {
  BusinessEvent,
  ConnectorHealth,
  SyncOptions,
  SyncResult,
  ValidationResult,
} from "@/connectors/types";

/**
 * Enterprise Connector contract.
 * Vendor-specific models must not escape the connector boundary.
 */
export type EnterpriseConnector = {
  readonly id: string;
  readonly system: string;
  readonly label: string;

  /** Establish / refresh connection (mock = mark connected). */
  connect(): { ok: boolean; message: string };

  /** Validate raw vendor payload before normalisation. */
  validate(raw: unknown): ValidationResult;

  /**
   * Pull vendor data, validate, normalise into BusinessEvents.
   * Deterministic for mock connectors.
   */
  sync(options?: SyncOptions): SyncResult;

  /** Map a vendor record into zero or more BusinessEvents. */
  normalise(raw: unknown): BusinessEvent[];

  /** Current connector health for observability. */
  health(): ConnectorHealth;
};
