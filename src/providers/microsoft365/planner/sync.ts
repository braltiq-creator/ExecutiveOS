import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";
import type { InitiativeProgressSignal } from "@/providers/microsoft365/executive-context/types";

type GraphPlannerTask = {
  id: string;
  title?: string;
  percentComplete?: number;
  dueDateTime?: string;
};

export async function syncPlannerContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  initiativeProgress: InitiativeProgressSignal[];
  events: BusinessEvent[];
}> {
  const items = await client.paginate<GraphPlannerTask>(
    { path: "/me/planner/tasks" },
    1,
  );
  const initiativeProgress: InitiativeProgressSignal[] = [];
  const events: BusinessEvent[] = [];

  for (const item of items) {
    const title = item.title ?? "Untitled task";
    const pct = item.percentComplete ?? 0;
    const status =
      pct >= 70 ? "on_track" : pct >= 40 ? "watch" : ("at_risk" as const);

    initiativeProgress.push({
      id: `init-progress-${item.id}`,
      title,
      progressHint: `${pct}% complete` + (item.dueDateTime ? ` · due ${item.dueDateTime}` : ""),
      relatedInitiativeIds: /cash/i.test(title)
        ? ["initiative-improve_cash_flow"]
        : [],
      status,
    });

    events.push({
      id: `evt-m365-planner-${item.id}`,
      timestamp: asOf,
      sourceSystem: "microsoft365",
      entityType: "Action",
      entityId: item.id,
      eventType: "action_created",
      importance: 60,
      confidence: 75,
      relationships: [],
      payload: {
        kind: "strategic_initiative_progress",
        title,
        percentComplete: pct,
        status,
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["executive-context", "planner"],
      },
    });
  }

  return { initiativeProgress, events };
}
