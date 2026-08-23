/**
 * Meeting / CS notes (operational metadata only).
 */

import type { OpsNote } from "@/operations/types";

const notes = new Map<string, OpsNote>();

export function resetOpsNotes(): void {
  notes.clear();
}

export function listNotesForTenant(tenantId: string): OpsNote[] {
  return [...notes.values()]
    .filter((n) => n.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addOpsNote(input: {
  tenantId: string;
  author: string;
  body: string;
  kind?: OpsNote["kind"];
  asOf?: string;
}): OpsNote {
  const note: OpsNote = {
    id: `note-${input.tenantId}-${notes.size + 1}`,
    tenantId: input.tenantId,
    author: input.author,
    body: input.body,
    createdAt: input.asOf ?? new Date().toISOString(),
    kind: input.kind ?? "general",
  };
  notes.set(note.id, note);
  return note;
}
