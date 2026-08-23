import type { M365MailMessage } from "@/lib/integrations/providers/microsoft365/types";
import type { ExecutiveEmailIntelligence } from "@/lib/intelligence/providers/types";

export function buildEmailIntelligence(input: {
  messages: M365MailMessage[];
  connected: boolean;
}): ExecutiveEmailIntelligence {
  const unreadCount = input.messages.filter((message) => !message.isRead).length;

  return {
    connected: input.connected,
    unreadCount,
    recentThreads: input.messages.slice(0, 5).map((message) => ({
      id: message.id,
      subject: message.subject,
      from: message.from,
      receivedAt: message.receivedAt,
      preview: message.preview,
    })),
  };
}

export function buildEmptyEmailIntelligence(): ExecutiveEmailIntelligence {
  return {
    connected: false,
    unreadCount: 0,
    recentThreads: [],
  };
}
