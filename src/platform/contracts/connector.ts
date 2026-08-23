/**
 * Platform Connector contract.
 * Extends Core connector surface with auth + replay.
 * Vendor objects never escape the connector boundary.
 */

import type {
  BusinessEvent,
  ConnectorHealth,
  SyncOptions,
  SyncResult,
  ValidationResult,
} from "@/connectors/types";
import type { ExtensionManifest } from "@/platform/contracts/identity";

export type ConnectorAuthResult = {
  ok: boolean;
  message: string;
  /** Opaque token handle — never a vendor payload */
  sessionId?: string;
};

export type ConnectorReplayOptions = {
  from: string;
  to?: string;
  limit?: number;
};

export type PlatformConnector = {
  readonly manifest: ExtensionManifest & { kind: "connector" };
  readonly system: string;

  /** Authenticate / refresh credentials (mock-safe). */
  authenticate(): ConnectorAuthResult;

  /** Alias used by Core EnterpriseConnector — establish connection. */
  connect(): { ok: boolean; message: string };

  validate(raw: unknown): ValidationResult;
  synchronise(options?: SyncOptions): SyncResult;
  /** Alias for Core naming */
  sync(options?: SyncOptions): SyncResult;
  normalise(raw: unknown): BusinessEvent[];
  health(): ConnectorHealth;

  /**
   * Replay previously emitted BusinessEvents from connector journal.
   * Supports Reality Lab / Twin rebuild without vendor re-fetch.
   */
  replay(options: ConnectorReplayOptions): BusinessEvent[];
};

export type ConnectorFactory = () => PlatformConnector;
