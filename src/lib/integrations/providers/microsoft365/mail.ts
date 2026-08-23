import type { M365MailMessage } from "@/lib/integrations/providers/microsoft365/types";
import { mapGraphMailToM365 } from "@/lib/integrations/providers/microsoft365/mapper";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function fetchGraphMailMessages(
  accessToken: string,
  limit = 10,
): Promise<M365MailMessage[]> {
  const params = new URLSearchParams({
    $top: String(limit),
    $orderby: "receivedDateTime desc",
    $select: "id,subject,from,receivedDateTime,bodyPreview,isRead",
  });

  const response = await fetch(`${GRAPH_BASE}/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Microsoft Graph mail request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    value?: Array<{
      id: string;
      subject?: string;
      from?: { emailAddress?: { name?: string } };
      receivedDateTime?: string;
      bodyPreview?: string;
      isRead?: boolean;
    }>;
  };

  return (payload.value ?? []).map(mapGraphMailToM365);
}

export function buildFallbackMailMessages(): M365MailMessage[] {
  return [];
}
