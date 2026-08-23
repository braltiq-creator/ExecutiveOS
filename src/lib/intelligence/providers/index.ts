import {
  buildCalendarIntelligence,
  buildEmptyCalendarIntelligence,
} from "@/lib/intelligence/providers/calendarContext";
import { buildEmailIntelligence, buildEmptyEmailIntelligence } from "@/lib/intelligence/providers/emailContext";
import { buildMeetingIntelligence } from "@/lib/intelligence/providers/meetingContext";
import type { ExecutiveDayIntelligence } from "@/lib/intelligence/providers/types";
import { buildExecutiveFallbackEvents } from "@/lib/integrations/providers/microsoft365/calendar";
import type { M365CalendarEvent, M365SyncPayload } from "@/lib/integrations/providers/microsoft365/types";
import { fetchOrganizationIntegrationByProvider } from "@/lib/integrations/queries";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import { loadExecutiveDecisionRecords } from "@/lib/intelligence/decisions";
import { loadExecutiveInitiativeRecords } from "@/lib/initiatives/intelligence";
import { loadStrategicObjectiveRecords } from "@/lib/intelligence/objectives";
import { loadExecutiveProfileRecord } from "@/lib/intelligence/profile";
import { enrichCalendarWithKnowledgeGraph } from "@/lib/knowledge/service";
import { fetchMeetingsWithActions } from "@/lib/meetings/queries";
import { fetchActiveMemory } from "@/lib/memory/queries";

function parseM365Payload(
  config: Record<string, unknown>,
): M365SyncPayload | null {
  const payload = config.lastContextPayload;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (record.providerId !== "microsoft_365") {
    return null;
  }

  return record as unknown as M365SyncPayload;
}

function eventsFromIntegration(config: Record<string, unknown>): M365CalendarEvent[] {
  const payload = parseM365Payload(config);
  return payload?.calendar.events ?? [];
}

export async function loadExecutiveDayIntelligence(
  userId: string,
): Promise<ExecutiveDayIntelligence> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return {
      calendar: buildEmptyCalendarIntelligence(),
      meetings: {
        connected: false,
        totalMeetingsToday: 0,
        onlineMeetingsToday: 0,
        highPriorityMeetings: [],
        teamsReady: false,
      },
      email: buildEmptyEmailIntelligence(),
    };
  }

  const integration = await fetchOrganizationIntegrationByProvider(
    membership.organization.id,
    "microsoft_365",
  );

  const connected = integration?.status === "connected";
  const config = integration?.config_json ?? {};

  const [objectives, initiatives, decisions, memories, meetings, profile] = await Promise.all([
    loadStrategicObjectiveRecords(userId),
    loadExecutiveInitiativeRecords(userId),
    loadExecutiveDecisionRecords(userId),
    fetchActiveMemory(userId),
    fetchMeetingsWithActions(userId),
    loadExecutiveProfileRecord(userId),
  ]);

  let events = eventsFromIntegration(config);

  if (events.length === 0 && profile) {
    events = buildExecutiveFallbackEvents({
      company: profile.company ?? membership.organization.name,
      jobTitle: profile.job_title ?? "Executive",
      initiativeTitles: initiatives.map((item) => item.initiative.title),
    });
  }
  const calendarBase = buildCalendarIntelligence({
    events,
    connected: connected || events.length > 0,
    objectiveTitles: objectives.map((objective) => objective.title),
    initiativeTitles: initiatives.map((item) => item.initiative.title),
    decisionTitles: decisions.map((decision) => decision.title),
    memoryEntries: memories.map((entry) => ({
      id: entry.id,
      title: entry.title,
      memoryType: entry.memory_type,
      content: entry.content,
    })),
    previousMeetingTitles: meetings.map((item) => item.meeting.title),
  });

  const calendar = await enrichCalendarWithKnowledgeGraph({
    userId,
    calendar: calendarBase,
  });

  const meetingIntel = buildMeetingIntelligence({
    events,
    connected,
    preparation: calendar.meetingPreparation,
  });

  const payload = parseM365Payload(config);
  const email = buildEmailIntelligence({
    messages: payload?.email.messages ?? [],
    connected,
  });

  return {
    calendar,
    meetings: meetingIntel,
    email,
  };
}

export async function loadExecutiveCalendarIntelligence(userId: string) {
  const day = await loadExecutiveDayIntelligence(userId);
  return day.calendar;
}
