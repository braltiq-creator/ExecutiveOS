/**
 * Server-only manufacturing validation helpers.
 * Fixture / filesystem access must never enter the client bundle.
 */

import "server-only";

import { readFileSync } from "node:fs";
import {
  runManufacturingValidationFromTabular,
  type ManufacturingValidationResult,
} from "../intelligence/run-manufacturing-validation";

/**
 * Load a server-local tabular fixture and run manufacturing forecasting validation.
 */
export function runManufacturingValidationFromFile(
  path: string,
  meta: {
    organisationId: string;
    organisationName?: string;
    profileId?: string;
    productId?: string;
  },
): ManufacturingValidationResult {
  const tabularText = readFileSync(path, "utf8");
  return runManufacturingValidationFromTabular({
    tabularText,
    filename: path.split("/").pop(),
    forceManufacturingProfile: true,
    ...meta,
  });
}
