/**
 * Bootstrap default executive resources for a new tenant.
 * Records provisioned artefacts — does not modify Core engines.
 */

export type BootstrapArtefact = {
  id: string;
  kind:
    | "executive_council"
    | "knowledge_graph"
    | "organisational_memory"
    | "strategy"
    | "dashboard"
    | "api_key";
  tenantId: string;
  label: string;
  createdAt: string;
};

const artefacts = new Map<string, BootstrapArtefact[]>();

export function resetBootstrapArtefacts(): void {
  artefacts.clear();
}

function add(
  tenantId: string,
  kind: BootstrapArtefact["kind"],
  label: string,
  asOf: string,
): BootstrapArtefact {
  const item: BootstrapArtefact = {
    id: `${tenantId}-${kind}`,
    kind,
    tenantId,
    label,
    createdAt: asOf,
  };
  const list = artefacts.get(tenantId) ?? [];
  if (!list.some((a) => a.kind === kind)) {
    list.push(item);
    artefacts.set(tenantId, list);
  }
  return item;
}

export function enableExecutiveCouncil(tenantId: string, asOf: string): BootstrapArtefact {
  return add(
    tenantId,
    "executive_council",
    "Executive Council enabled (permanent roles — industry knowledge via packs)",
    asOf,
  );
}

export function provisionKnowledgeGraph(tenantId: string, asOf: string): BootstrapArtefact {
  return add(
    tenantId,
    "knowledge_graph",
    "Knowledge Graph provisioned (empty — Discovery will populate)",
    asOf,
  );
}

export function provisionOrganisationalMemory(
  tenantId: string,
  asOf: string,
): BootstrapArtefact {
  return add(
    tenantId,
    "organisational_memory",
    "Organisational Memory store ready",
    asOf,
  );
}

export function provisionStrategy(tenantId: string, asOf: string): BootstrapArtefact {
  return add(
    tenantId,
    "strategy",
    "Strategy workspace ready for Discovery outcomes",
    asOf,
  );
}

export function provisionDefaultDashboard(
  tenantId: string,
  asOf: string,
): BootstrapArtefact {
  return add(
    tenantId,
    "dashboard",
    "Default executive dashboard provisioned",
    asOf,
  );
}

export function listBootstrapArtefacts(tenantId: string): BootstrapArtefact[] {
  return artefacts.get(tenantId) ?? [];
}

export function generateTenantApiKeys(input: {
  tenantId: string;
  asOf: string;
}): {
  artefact: BootstrapArtefact;
  keyId: string;
  secret: string;
  secretPreview: string;
} {
  const keyId = `eos_${input.tenantId.replace("tenant-", "")}_live`;
  const secret = `sk_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  const secretPreview = `${secret.slice(0, 10)}…${secret.slice(-4)}`;
  const artefact = add(
    input.tenantId,
    "api_key",
    `API key ${keyId}`,
    input.asOf,
  );
  return { artefact, keyId, secret, secretPreview };
}
