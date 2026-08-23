import type { BusinessEvent } from "@/connectors/types";
import { mapForecastUpdate } from "@/providers/salesforce/api/mapping";

export async function syncForecasts(input: {
  weightedForecast: number;
  wonValue: number;
  openPipelineValue: number;
  asOf: string;
}): Promise<{
  events: BusinessEvent[];
  forecastAccuracyPct: number;
  forecastValue: number;
}> {
  const accuracyPct = Math.min(
    95,
    Math.max(
      45,
      Math.round(
        60 +
          (input.wonValue > 0 ? 15 : 0) -
          (input.openPipelineValue > input.weightedForecast * 2 ? 10 : 0),
      ),
    ),
  );
  return {
    events: [
      mapForecastUpdate(
        { amount: input.weightedForecast, accuracyPct },
        input.asOf,
      ),
    ],
    forecastAccuracyPct: accuracyPct,
    forecastValue: input.weightedForecast,
  };
}
