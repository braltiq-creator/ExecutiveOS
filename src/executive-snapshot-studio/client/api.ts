/**
 * Browser-safe Snapshot Studio API.
 * Calls Server Actions — never imports Node filesystem APIs or fixture paths.
 */

import {
  createExecutiveSnapshotAction,
  parseUploadedWorkbookAction,
  runStudioIntelligenceAction,
} from "../server/actions";
import type {
  CreateStudioSnapshotInput,
  ParseWorkbookInput,
  ParseWorkbookResultDto,
  RunStudioIntelligenceInput,
  StudioIntelligenceActionResult,
  StudioSnapshotActionResult,
} from "../server/dto";

export type {
  CreateStudioSnapshotInput,
  ParseWorkbookInput,
  ParseWorkbookResultDto,
  RunStudioIntelligenceInput,
  StudioIntelligenceActionResult,
  StudioSnapshotActionResult,
} from "../server/dto";

/** Structural Excel parse (.xls / .xlsx) on the server. */
export async function parseWorkbookOnServer(
  input: ParseWorkbookInput,
): Promise<ParseWorkbookResultDto> {
  return parseUploadedWorkbookAction(input);
}

/** Create + validate an Executive Snapshot on the server. */
export async function createSnapshotOnServer(
  input: CreateStudioSnapshotInput,
): Promise<StudioSnapshotActionResult> {
  return createExecutiveSnapshotAction(input);
}

/** Run intelligence / commercial interpretation on the server. */
export async function runIntelligenceOnServer(
  input: RunStudioIntelligenceInput,
): Promise<StudioIntelligenceActionResult> {
  return runStudioIntelligenceAction(input);
}
