import { EnterpriseDigitalTwin } from "@/digital-twin/twin";
import { bootstrapNorthlineDigitalTwin } from "@/digital-twin/bootstrap";

export type DigitalTwinProvider = {
  readonly id: string;
  readonly label: string;
  getTwin(): EnterpriseDigitalTwin;
};

export function createMockDigitalTwinProvider(
  twin?: EnterpriseDigitalTwin,
): DigitalTwinProvider {
  const resolved =
    twin ??
    bootstrapNorthlineDigitalTwin({ runIntelligence: false }).twin;
  return {
    id: "twin-mock-northline",
    label: "Northline Enterprise Digital Twin",
    getTwin: () => resolved,
  };
}

let defaultProvider: DigitalTwinProvider | null = null;

export function setDigitalTwinProvider(provider: DigitalTwinProvider): void {
  defaultProvider = provider;
}

export function getDigitalTwinProvider(): DigitalTwinProvider {
  if (!defaultProvider) {
    defaultProvider = createMockDigitalTwinProvider();
  }
  return defaultProvider;
}

export function getEnterpriseDigitalTwin(): EnterpriseDigitalTwin {
  return getDigitalTwinProvider().getTwin();
}
