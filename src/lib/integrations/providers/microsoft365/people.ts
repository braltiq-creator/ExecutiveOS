import type { M365Person } from "@/lib/integrations/providers/microsoft365/types";
import { mapGraphPersonToM365 } from "@/lib/integrations/providers/microsoft365/mapper";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function fetchGraphPeople(
  accessToken: string,
  limit = 20,
): Promise<M365Person[]> {
  const params = new URLSearchParams({
    $top: String(limit),
    $select: "id,displayName,mail,jobTitle",
  });

  const response = await fetch(`${GRAPH_BASE}/me/people?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Microsoft Graph people request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    value?: Array<{
      id: string;
      displayName?: string;
      mail?: string;
      jobTitle?: string;
    }>;
  };

  return (payload.value ?? []).map(mapGraphPersonToM365);
}

export function buildPeopleFromAttendees(
  attendees: Array<{ name: string; email: string }>,
): M365Person[] {
  const seen = new Set<string>();

  return attendees
    .filter((attendee) => {
      if (!attendee.email || seen.has(attendee.email)) {
        return false;
      }
      seen.add(attendee.email);
      return true;
    })
    .map((attendee, index) => ({
      id: `attendee-${index}`,
      displayName: attendee.name,
      email: attendee.email,
      jobTitle: null,
    }));
}
