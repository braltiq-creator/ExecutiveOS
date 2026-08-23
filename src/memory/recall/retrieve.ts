/**
 * Memory recall — retrieve relevant historical experience for a new situation.
 */

import { listEpisodes } from "@/memory/episodes";
import { listMemoryDecisions } from "@/memory/decision-history";
import { listLessons, searchLessons } from "@/memory/lessons";
import { textSimilarity } from "@/memory/similarity";
import type { MemoryRecallResult } from "@/memory/framework/types";

const recallLog = new Map<string, MemoryRecallResult[]>();

export function resetMemoryRecallLog(): void {
  recallLog.clear();
}

export function listRecentRecalls(tenantId: string): MemoryRecallResult[] {
  return recallLog.get(tenantId) ?? [];
}

export function recallOrganisationalMemory(input: {
  tenantId: string;
  query: string;
  asOf?: string;
  limit?: number;
}): MemoryRecallResult {
  const asOf = input.asOf ?? new Date().toISOString();
  const limit = input.limit ?? 5;
  const query = input.query.trim();

  const similarEpisodes = listEpisodes(input.tenantId)
    .map((ep) => {
      const similarity = Math.max(
        textSimilarity(query, ep.businessQuestion),
        textSimilarity(query, `${ep.name} ${ep.context}`),
        ep.scenarioId && query.toLowerCase().includes(ep.scenarioId)
          ? 80
          : 0,
      );
      return {
        episodeId: ep.id,
        name: ep.name,
        businessQuestion: ep.businessQuestion,
        similarity,
        lessons: ep.lessonsLearned.slice(0, 3),
        participants: ep.participants,
        outcome: ep.observedOutcome,
      };
    })
    .filter((e) => e.similarity >= 15)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  const previousDecisions = listMemoryDecisions(input.tenantId)
    .map((d) => ({
      decisionId: d.id,
      title: d.title,
      kind: d.kind,
      similarity: Math.max(
        textSimilarity(query, d.title),
        textSimilarity(query, d.summary),
      ),
    }))
    .filter((d) => d.similarity >= 15)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  const lessons = [
    ...similarEpisodes.flatMap((e) => e.lessons),
    ...searchLessons({ tenantId: input.tenantId, query })
      .flatMap((l) => [
        ...l.whatWorked.map((w) => `Worked: ${w}`),
        ...l.futureRecommendations.map((r) => `Recommend: ${r}`),
      ])
      .slice(0, 6),
  ].slice(0, 8);

  const relatedStakeholders = [
    ...new Set(
      listEpisodes(input.tenantId)
        .filter((ep) =>
          similarEpisodes.some((s) => s.episodeId === ep.id),
        )
        .flatMap((ep) => ep.participants),
    ),
  ].slice(0, 8);

  const comparableOutcomes = similarEpisodes
    .map((e) => e.outcome)
    .filter((o): o is string => Boolean(o))
    .slice(0, 5);

  const relevantInitiatives = listEpisodes(input.tenantId)
    .filter((ep) => /initiative|strategic|program/i.test(ep.context + ep.name))
    .map((ep) => ep.name)
    .slice(0, 5);

  const supportingEvidence = [
    ...similarEpisodes.flatMap((e) => [
      `Similar: ${e.name} (${e.similarity}% match)`,
    ]),
    ...previousDecisions.map(
      (d) => `Prior decision: ${d.title} (${d.similarity}% match)`,
    ),
    ...lessons.slice(0, 3),
  ].slice(0, 10);

  const overallSimilarityConfidence =
    similarEpisodes.length === 0 && previousDecisions.length === 0
      ? 0
      : Math.round(
          ([
            ...similarEpisodes.map((e) => e.similarity),
            ...previousDecisions.map((d) => d.similarity),
          ].reduce((a, b) => a + b, 0) || 0) /
            Math.max(
              1,
              similarEpisodes.length + previousDecisions.length,
            ),
        );

  const result: MemoryRecallResult = {
    tenantId: input.tenantId,
    query,
    asOf,
    similarEpisodes: similarEpisodes.map(
      ({ participants: _p, outcome: _o, ...rest }) => rest,
    ),
    previousDecisions,
    comparableOutcomes,
    lessons,
    relatedStakeholders,
    relevantInitiatives,
    supportingEvidence,
    overallSimilarityConfidence,
    explanation:
      overallSimilarityConfidence > 0
        ? `Recalled ${similarEpisodes.length} similar episode(s) and ${previousDecisions.length} prior decision(s) with ${overallSimilarityConfidence}% similarity confidence.`
        : "No sufficiently similar organisational memory found yet.",
  };

  const log = recallLog.get(input.tenantId) ?? [];
  log.unshift(result);
  recallLog.set(input.tenantId, log.slice(0, 20));
  return result;
}
