/**
 * Lineage — every recommendation can answer origin questions.
 */

export type UdgLineagePointer = {
  lineageId: string;
  snapshotId: string;
  recordId: string;
  rowIndex: number;
  sourceKind: string;
  connectorId: string;
  mappingId?: string;
  mappingField?: string;
  sourceColumn?: string;
  timestamp: string;
  organisationId: string;
};

export type UdgLineageQuery = {
  snapshotId?: string;
  recordId?: string;
  rowIndex?: number;
  organisationId?: string;
};
