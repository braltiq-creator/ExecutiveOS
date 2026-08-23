/**
 * Server-only commercial validation helpers.
 * Fixture / filesystem access must never enter the client bundle.
 */

import "server-only";

import { readFileSync } from "node:fs";
import {
  runCommercialValidationFromTabular,
  type CommercialValidationResult,
} from "../intelligence/run-commercial-validation";

/**
 * Load a server-local tabular fixture and run commercial validation.
 * Paths stay on the server — never returned to the browser.
 */
export function runCommercialValidationFromFile(
  path: string,
  meta: {
    organisationId: string;
    organisationName?: string;
    profileId: string;
    productId?: string;
  },
): CommercialValidationResult {
  const tabularText = readFileSync(path, "utf8");
  return runCommercialValidationFromTabular({
    tabularText,
    filename: path.split("/").pop(),
    ...meta,
  });
}
