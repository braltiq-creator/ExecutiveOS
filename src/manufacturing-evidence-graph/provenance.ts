import { MANUFACTURING_GRAPH_PROVENANCE } from "./types";

export class ManufacturingProvenanceError extends Error {
  constructor(message = "Manufacturing evidence graph only accepts USER_PROVIDED provenance.") {
    super(message);
    this.name = "ManufacturingProvenanceError";
  }
}

/** Reject every provenance other than USER_PROVIDED, including SYNTHETIC. */
export function assertUserProvidedProvenance(
  provenance: string,
): asserts provenance is typeof MANUFACTURING_GRAPH_PROVENANCE {
  if (provenance !== MANUFACTURING_GRAPH_PROVENANCE) {
    throw new ManufacturingProvenanceError();
  }
}
