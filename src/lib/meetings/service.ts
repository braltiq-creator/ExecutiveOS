import { saveDecision } from "@/lib/decisions/service";
import { requireFeatureEntitlements, assertMeetingIntelligenceAllowed } from "@/lib/features";
import { incrementUsage } from "@/lib/billing/service";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import { fetchMemoryBySource } from "@/lib/memory/queries";
import { saveMemory } from "@/lib/memory/service";
import {
  analyzeMeetingDeterministic,
  mergeMeetingExtraction,
} from "@/lib/meetings/analyzer";
import {
  archiveMeetingRecord,
  insertMeetingRecord,
  markMeetingAnalyzed,
  replaceMeetingActions,
  updateMeetingRecord,
} from "@/lib/meetings/mutations";
import {
  fetchMeetingActions,
  fetchMeetingById,
  fetchMeetingsWithActions,
} from "@/lib/meetings/queries";
import type {
  ExecutiveMeetingRecord,
  MeetingActionInput,
  MeetingAnalyzer,
  MeetingExtraction,
  MeetingInsightsInput,
  MeetingWithActions,
  SaveMeetingInput,
} from "@/lib/meetings/types";
import {
  ExecutiveMeetingError,
  meetingMemorySource,
} from "@/lib/meetings/types";

let meetingAnalyzer: MeetingAnalyzer = {
  analyze: analyzeMeetingDeterministic,
};

export function setMeetingAnalyzer(analyzer: MeetingAnalyzer): void {
  meetingAnalyzer = analyzer;
}

export function getMeetingAnalyzer(): MeetingAnalyzer {
  return meetingAnalyzer;
}

function validateMeetingInput(input: SaveMeetingInput): void {
  if (!input.title.trim()) {
    throw new ExecutiveMeetingError("Title is required.", "VALIDATION_ERROR");
  }
  if (!input.meetingDate) {
    throw new ExecutiveMeetingError(
      "Meeting date is required.",
      "VALIDATION_ERROR",
    );
  }
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new ExecutiveMeetingError(
      "Enter a valid duration in minutes.",
      "VALIDATION_ERROR",
    );
  }
}

function insightsToExtraction(
  insights?: MeetingInsightsInput,
): Partial<MeetingExtraction> {
  if (!insights) {
    return {};
  }

  return {
    decisions: insights.decisions ?? [],
    risks: insights.risks ?? [],
    opportunities: insights.opportunities ?? [],
    commitments: insights.commitments ?? [],
  };
}

function mergeActionItems(
  formActions: MeetingActionInput[],
  extractedActions: MeetingActionInput[],
): MeetingActionInput[] {
  const formTitles = new Set(
    formActions.map((action) => action.title.trim().toLowerCase()),
  );

  const merged = [...formActions];

  for (const action of extractedActions) {
    const key = action.title.trim().toLowerCase();
    if (!formTitles.has(key)) {
      merged.push(action);
    }
  }

  return merged;
}

async function syncMeetingMemories(
  userId: string,
  meeting: ExecutiveMeetingRecord,
  extraction: MeetingExtraction,
): Promise<void> {
  await Promise.all(
    extraction.risks.map(async (item, index) => {
      const source = meetingMemorySource(meeting.id, "risk", index);
      const existing = await fetchMemoryBySource(userId, source);

      await saveMemory(userId, {
        id: existing?.id,
        memoryType: "risk",
        title: item.title,
        content: item.content,
        importance: item.importance ?? "high",
        source,
      });
    }),
  );

  await Promise.all(
    extraction.opportunities.map(async (item, index) => {
      const source = meetingMemorySource(meeting.id, "opportunity", index);
      const existing = await fetchMemoryBySource(userId, source);

      await saveMemory(userId, {
        id: existing?.id,
        memoryType: "opportunity",
        title: item.title,
        content: item.content,
        importance: item.importance ?? "medium",
        source,
      });
    }),
  );

  await Promise.all(
    extraction.commitments.map(async (item, index) => {
      const source = meetingMemorySource(meeting.id, "commitment", index);
      const existing = await fetchMemoryBySource(userId, source);

      await saveMemory(userId, {
        id: existing?.id,
        memoryType: "commitment",
        title: item.title,
        content: item.content,
        importance: item.importance ?? "medium",
        source,
      });
    }),
  );
}

async function syncMeetingDecisions(
  userId: string,
  meeting: ExecutiveMeetingRecord,
  extraction: MeetingExtraction,
): Promise<void> {
  const defaultOwner = meeting.participants[0] ?? "Executive";
  const decisionDate = meeting.meeting_date.slice(0, 10);

  await Promise.all(
    extraction.decisions.map((item) =>
      saveDecision(userId, {
        title: item.title,
        summary: item.summary,
        decisionReason: item.reason,
        expectedOutcome: item.expectedOutcome,
        status: "approved",
        owner: item.owner ?? defaultOwner,
        decisionDate,
        riskLevel: "medium",
      }),
    ),
  );
}

async function syncMeetingIntelligence(
  userId: string,
  meeting: ExecutiveMeetingRecord,
  extraction: MeetingExtraction,
  options: { includeDecisions: boolean },
): Promise<void> {
  if (options.includeDecisions) {
    await syncMeetingDecisions(userId, meeting, extraction);
  }

  await syncMeetingMemories(userId, meeting, extraction);
}

export async function saveMeeting(
  userId: string,
  input: SaveMeetingInput,
): Promise<MeetingWithActions> {
  validateMeetingInput(input);

  const isCreate = !input.id;
  const shouldAnalyze = input.analyze ?? isCreate;
  const existing = input.id
    ? await fetchMeetingById(userId, input.id)
    : null;

  if (input.id && (!existing || existing.archived_at)) {
    throw new ExecutiveMeetingError("Meeting not found.", "NOT_FOUND");
  }

  const isFirstAnalysis = !existing?.analyzed_at;

  let meeting: ExecutiveMeetingRecord;

  if (input.id && existing) {
    meeting = await updateMeetingRecord(userId, input.id, input);
  } else {
    meeting = await insertMeetingRecord(userId, input);
  }

  let extraction: MeetingExtraction | null = null;

  if (shouldAnalyze) {
    const analyzed = await meetingAnalyzer.analyze(meeting);
    extraction = mergeMeetingExtraction(analyzed, {
      ...insightsToExtraction(input.insights),
      summary: input.meetingSummary,
    });

    meeting = await markMeetingAnalyzed(
      userId,
      meeting.id,
      input.meetingSummary?.trim() || extraction.summary,
    );

    await syncMeetingIntelligence(userId, meeting, extraction, {
      includeDecisions: isFirstAnalysis,
    });
  }

  const extractedActions: MeetingActionInput[] =
    extraction?.actionItems.map((item) => ({
      title: item.title,
      description: item.description,
      owner: item.owner,
      dueDate: item.dueDate,
      status: item.status,
    })) ?? [];

  const actions = await replaceMeetingActions(
    userId,
    meeting.id,
    mergeActionItems(input.actionItems, extractedActions),
  );

  return { meeting, actions };
}

export async function archiveMeeting(
  userId: string,
  meetingId: string,
): Promise<ExecutiveMeetingRecord> {
  const existing = await fetchMeetingById(userId, meetingId);

  if (!existing || existing.archived_at) {
    throw new ExecutiveMeetingError("Meeting not found.", "NOT_FOUND");
  }

  return archiveMeetingRecord(userId, meetingId);
}

export async function getMeetings(
  userId: string,
): Promise<MeetingWithActions[]> {
  return fetchMeetingsWithActions(userId);
}

export async function getMeeting(
  userId: string,
  meetingId: string,
): Promise<MeetingWithActions | null> {
  const meeting = await fetchMeetingById(userId, meetingId);

  if (!meeting) {
    return null;
  }

  const actions = await fetchMeetingActions(meetingId);
  return { meeting, actions };
}

export async function analyzeExistingMeeting(
  userId: string,
  meetingId: string,
): Promise<MeetingWithActions> {
  const entitlements = await requireFeatureEntitlements(userId);
  assertMeetingIntelligenceAllowed(entitlements);

  const existing = await fetchMeetingById(userId, meetingId);

  if (!existing || existing.archived_at) {
    throw new ExecutiveMeetingError("Meeting not found.", "NOT_FOUND");
  }

  const analyzed = await meetingAnalyzer.analyze(existing);
  const extraction = mergeMeetingExtraction(analyzed, {
    summary: existing.meeting_summary ?? undefined,
  });

  const meeting = await markMeetingAnalyzed(
    userId,
    meetingId,
    extraction.summary,
  );

  await syncMeetingIntelligence(userId, meeting, extraction, {
    includeDecisions: true,
  });

  const actions = await replaceMeetingActions(
    userId,
    meeting.id,
    mergeActionItems(
      (await fetchMeetingActions(meetingId)).map((action) => ({
        id: action.id,
        title: action.title,
        description: action.description ?? undefined,
        owner: action.owner ?? undefined,
        dueDate: action.due_date ?? undefined,
        status: action.status,
      })),
      extraction.actionItems.map((item) => ({
        title: item.title,
        description: item.description,
        owner: item.owner,
        dueDate: item.dueDate,
        status: item.status,
      })),
    ),
  );

  const membership = await fetchActiveMembership(userId);

  if (membership) {
    await incrementUsage(membership.organization.id, "meetings_count", 1);
  }

  return { meeting, actions };
}
