/**
 * Ingestion confidence — visible inside ExecutiveOS.
 */

export type UdgConfidenceDimensions = {
  completeness: number;
  consistency: number;
  freshness: number;
  coverage: number;
  quality: number;
};

export type UdgConfidenceScore = UdgConfidenceDimensions & {
  /** Weighted overall 0–100. */
  overall: number;
  scoredAt: string;
};
