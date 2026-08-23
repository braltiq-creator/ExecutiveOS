/**
 * Remaining Platform SDK provider contracts.
 * Extensions implement these — Core never imports vendor code.
 */

import type { ExtensionManifest } from "@/platform/contracts/identity";
import type { PlatformBusinessEvent } from "@/platform/contracts/business-event";
import type { ExecutiveScenario } from "@/simulation/types";
import type { BenchmarkProfile } from "@/industry/field-services/simpro/benchmarks";
import type { PackJudgementRule } from "@/platform/contracts/knowledge-pack";
import type { IndustryVocabularyEntry } from "@/platform/contracts/knowledge-pack";
import type { NarrativeTemplate } from "@/platform/contracts/knowledge-pack";
import type { AgentReview } from "@/agents/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";

export type BenchmarkProvider = {
  readonly manifest: ExtensionManifest & { kind: "benchmark_provider" };
  list(): BenchmarkProfile[];
  get(id: string): BenchmarkProfile | undefined;
};

export type ScenarioProvider = {
  readonly manifest: ExtensionManifest & { kind: "scenario_provider" };
  list(): ExecutiveScenario[];
  get(id: string): ExecutiveScenario | undefined;
};

export type JudgementRuleProvider = {
  readonly manifest: ExtensionManifest & { kind: "judgement_rule_provider" };
  list(): PackJudgementRule[];
};

export type AgentExtension = {
  readonly manifest: ExtensionManifest & { kind: "agent_extension" };
  /** Optional additional council agent id */
  agentId: string;
  title: string;
  /**
   * Future AI routing hooks in here — contract stays stable.
   * Deterministic review today.
   */
  review(snapshot: IntelligentExecutiveSnapshot): AgentReview;
};

export type NarrativeProvider = {
  readonly manifest: ExtensionManifest & { kind: "narrative_provider" };
  templates(): NarrativeTemplate[];
  render(templateId: string, vars: Record<string, string>): string | null;
};

export type IndustryVocabularyProvider = {
  readonly manifest: ExtensionManifest & { kind: "industry_vocabulary" };
  entries(): IndustryVocabularyEntry[];
  resolve(term: string): IndustryVocabularyEntry | undefined;
};

export type NotificationChannel = "email" | "slack" | "teams" | "webhook" | "in_app";

export type NotificationPayload = {
  id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  relatedEntityIds?: string[];
  /** May reference BusinessEvent ids — never vendor payloads */
  evidenceEventIds?: string[];
};

export type NotificationProvider = {
  readonly manifest: ExtensionManifest & { kind: "notification_provider" };
  channels(): NotificationChannel[];
  /**
   * Deliver a notification. Mock implementations record only.
   * Future providers route to real channels without Core changes.
   */
  notify(payload: NotificationPayload): { ok: boolean; message: string };
};

export type AnyExtension =
  | import("@/platform/contracts/knowledge-pack").ExecutiveKnowledgePack
  | import("@/platform/contracts/connector").PlatformConnector
  | import("@/platform/contracts/business-event").BusinessEventMapper
  | BenchmarkProvider
  | ScenarioProvider
  | JudgementRuleProvider
  | AgentExtension
  | NarrativeProvider
  | IndustryVocabularyProvider
  | NotificationProvider;

export type { PlatformBusinessEvent };
