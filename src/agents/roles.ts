import type { AgentContext } from "@/agents/context";
import {
  openDecisions,
  topBrief,
  evidenceFromSnapshot,
  boardPreparationRisk,
  commercialForecastSoft,
  commercialGrowthPressure,
  operationalDeliveryPressure,
  operationalCashPressure,
  operationalSafetyPressure,
} from "@/agents/context";
import {
  challenge,
  createAgent,
  opportunity,
  rec,
  risk,
  type ExecutiveAgent,
} from "@/agents/base-agent";

function primaryDecision(ctx: AgentContext) {
  return openDecisions(ctx)[0];
}

function decliningOutcomes(ctx: AgentContext) {
  return ctx.snapshot.outcomes.filter(
    (outcome) =>
      outcome.momentum === "drifting" ||
      outcome.status === "at_risk" ||
      outcome.status === "off_track",
  );
}

function capacityTight(ctx: AgentContext) {
  return (
    ctx.snapshot.capacity.capacity !== "available" ||
    ctx.snapshot.capacity.attentionBudget === "contested"
  );
}

/** CEO — enterprise judgement, attention, sequencing (permanent Council seat) */
export const ceoAgent: ExecutiveAgent = createAgent({
  id: "ceo",
  title: "Chief Executive Officer",
  shortTitle: "CEO",
  focusAreas: [
    "Enterprise judgement",
    "Priority ordering",
    "Attention budget",
    "Decision sequencing",
    "Council synthesis",
  ],
  summarise(ctx) {
    const decision = primaryDecision(ctx);
    const budget = ctx.snapshot.capacity.attentionBudget;
    const boardRisk = boardPreparationRisk(ctx);
    const growth = ctx.commercialContext?.commercialHealth;
    return [
      `Enterprise attention budget is ${budget} with ${ctx.snapshot.reviewMinutes} minutes of review load.`,
      boardRisk
        ? "Board preparation risk is elevated — protect pack quality before the session."
        : "Board preparation is inside tolerance.",
      growth
        ? `Growth trajectory: ${growth.label} — ${growth.detail}`
        : null,
      ctx.operationalContext
        ? `Overall operational health: ${ctx.operationalContext.operationalHealth.label} — ${ctx.operationalContext.operationalHealth.detail}`
        : null,
      decision
        ? `Sequence starts with: ${decision.question}`
        : "Decision queue is clear of immediate binds.",
    ]
      .filter(Boolean)
      .join(" ");
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const items = [];
    if (boardPreparationRisk(ctx)) {
      items.push(
        rec(
          "ceo-board-1",
          "escalate",
          "Close board preparation gaps before 08:00",
          "Governance commitment is on the calendar with high preparation risk.",
          [
            ctx.executiveContext?.boardReadiness.detail ??
              "Board readiness not ready",
            ...evidenceFromSnapshot(ctx).slice(0, 2),
          ],
        ),
      );
    }
    if (decision) {
      items.push(
        rec(
          "ceo-seq-1",
          capacityTight(ctx) ? "escalate" : "investigate",
          "Protect judgement time for the top Decision",
          `Sequence the bind on "${decision.question}" before secondary operating noise.`,
          [
            `Attention budget: ${ctx.snapshot.capacity.attentionBudget}`,
            `Review load: ${ctx.snapshot.reviewMinutes} min`,
            decision.businessNarrative,
          ],
          [decision.id],
          decision.outcomeIds,
        ),
      );
    }
    if (capacityTight(ctx)) {
      items.push(
        rec(
          "ceo-attn-1",
          "delegate",
          "Collapse non-critical meetings from the morning block",
          "Contested attention will degrade Decision quality — reclaim Focus time.",
          [ctx.snapshot.capacity.reasoning],
        ),
      );
    }
    return items;
  },
  challenge(ctx) {
    const recs = ctx.snapshot.recommendations.slice(0, 2);
    return recs
      .filter((item) => item.act === "approve" && capacityTight(ctx))
      .map((item, index) =>
        challenge(
          `ceo-chal-${index}`,
          item.title,
          "Approving under contested attention risks an under-briefed bind.",
          [ctx.snapshot.capacity.reasoning, item.reason],
        ),
      );
  },
  identifyRisks(ctx) {
    const risks = [];
    if (capacityTight(ctx)) {
      risks.push(
        risk(
          "ceo-risk-attn",
          "Attention overdraw",
          "high",
          [ctx.snapshot.capacity.reasoning],
          [],
        ),
      );
    }
    if (boardPreparationRisk(ctx)) {
      risks.push(
        risk(
          "ceo-risk-board",
          "Board pack risk",
          "high",
          [
            ctx.executiveContext?.boardReadiness.detail ??
              "Board readiness not ready",
          ],
          [],
        ),
      );
    }
    return risks;
  },
  identifyOpportunities(ctx) {
    const open = openDecisions(ctx);
    if (open.length === 0) return [];
    return [
      opportunity(
        "ceo-opp-seq",
        "Clear Decision sequence",
        open.slice(0, 2).map((d) => d.question),
        open.slice(0, 2).map((d) => d.id),
      ),
    ];
  },
  reasoning(ctx) {
    return [
      `Pulse: ${ctx.snapshot.pulse.label}`,
      `Capacity: ${ctx.snapshot.capacity.capacity}`,
      ...openDecisions(ctx)
        .slice(0, 3)
        .map((d) => d.question),
    ];
  },
});

/**
 * Chief of Staff — specialty lens only (not a Council seat).
 * Issues route to CEO or the appropriate permanent executive.
 */
export const chiefOfStaffAgent: ExecutiveAgent = createAgent({
  id: "chief_of_staff",
  title: "Chief of Staff",
  shortTitle: "CoS",
  focusAreas: [
    "Executive briefing",
    "Priority ordering",
    "Attention budget",
    "Meeting preparation",
    "Decision sequencing",
  ],
  summarise(ctx) {
    const decision = primaryDecision(ctx);
    const budget = ctx.snapshot.capacity.attentionBudget;
    const boardRisk = boardPreparationRisk(ctx);
    const growth = ctx.commercialContext?.commercialHealth;
    return [
      `Attention budget is ${budget} with ${ctx.snapshot.reviewMinutes} minutes of review load.`,
      boardRisk
        ? "Board preparation risk is elevated — protect pack quality before the session."
        : "Board preparation is inside tolerance.",
      growth
        ? `Growth trajectory: ${growth.label} — ${growth.detail}`
        : null,
      ctx.operationalContext
        ? `Overall operational health: ${ctx.operationalContext.operationalHealth.label} — ${ctx.operationalContext.operationalHealth.detail}`
        : null,
      decision
        ? `Sequence starts with: ${decision.question}`
        : "Decision queue is clear of immediate binds.",
    ]
      .filter(Boolean)
      .join(" ");
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const items = [];
    if (boardPreparationRisk(ctx)) {
      items.push(
        rec(
          "cos-board-1",
          "escalate",
          "Close board preparation gaps before 08:00",
          "Governance commitment is on the calendar with high preparation risk.",
          [
            ctx.executiveContext?.boardReadiness.detail ??
              "Board readiness not ready",
            ...evidenceFromSnapshot(ctx).slice(0, 2),
          ],
        ),
      );
    }
    if (decision) {
      items.push(
        rec(
          "cos-seq-1",
          capacityTight(ctx) ? "escalate" : "investigate",
          "Protect judgement time for the top Decision",
          `Sequence the bind on "${decision.question}" before secondary operating noise.`,
          [
            `Attention budget: ${ctx.snapshot.capacity.attentionBudget}`,
            `Review load: ${ctx.snapshot.reviewMinutes} min`,
            decision.businessNarrative,
          ],
          [decision.id],
          decision.outcomeIds,
        ),
      );
    }
    if (capacityTight(ctx)) {
      items.push(
        rec(
          "cos-attn-1",
          "delegate",
          "Collapse non-critical meetings from the morning block",
          "Contested attention will degrade Decision quality — reclaim Focus time.",
          [ctx.snapshot.capacity.reasoning],
        ),
      );
    }
    return items;
  },
  challenge(ctx) {
    const recs = ctx.snapshot.recommendations.slice(0, 2);
    return recs
      .filter((item) => item.act === "approve" && capacityTight(ctx))
      .map((item, index) =>
        challenge(
          `cos-chal-${index}`,
          item.title,
          "Approving under contested attention risks an under-briefed bind.",
          [ctx.snapshot.capacity.reasoning, item.reason],
        ),
      );
  },
  identifyRisks(ctx) {
    const risks = [];
    if (ctx.snapshot.capacity.attentionBudget === "contested") {
      risks.push(
        risk(
          "cos-risk-attention",
          "Attention budget contested",
          "high",
          [ctx.snapshot.capacity.reasoning],
        ),
      );
    }
    if (boardPreparationRisk(ctx)) {
      risks.push(
        risk(
          "cos-risk-board",
          "Board preparation risk",
          "high",
          [
            ctx.executiveContext?.boardReadiness.detail ??
              "Board pack / governance prep incomplete",
          ],
        ),
      );
    }
    if (openDecisions(ctx).length >= 3) {
      risks.push(
        risk(
          "cos-risk-queue",
          "Decision queue crowding judgement",
          "moderate",
          [`${openDecisions(ctx).length} open Decisions`],
        ),
      );
    }
    return risks;
  },
  identifyOpportunities(ctx) {
    if (ctx.snapshot.capacity.capacity === "available") {
      return [
        opportunity(
          "cos-opp-focus",
          "Available capacity to clear a Focus Decision today",
          [ctx.snapshot.capacity.reasoning],
        ),
      ];
    }
    return [];
  },
  reasoning(ctx) {
    return [
      "Chief of Staff lenses: briefing quality, attention budget, decision sequence.",
      ...evidenceFromSnapshot(ctx).slice(0, 4),
    ];
  },
});

/** CFO — revenue, margin, cash, capital */
export const cfoAgent: ExecutiveAgent = createAgent({
  id: "cfo",
  title: "Chief Financial Officer",
  shortTitle: "CFO",
  focusAreas: [
    "Revenue",
    "Margin",
    "Cash",
    "Forecast",
    "Capital allocation",
    "Commercial risk",
  ],
  summarise(ctx) {
    const stressed = decliningOutcomes(ctx).filter((o) =>
      /arr|revenue|retention|cash|margin/i.test(o.name + o.shortName),
    );
    const financeReviewMissing = !(
      ctx.executiveContext?.commitments.some((c) =>
        /finance|cash|budget/i.test(c.title),
      ) ?? false
    );
    const forecast = ctx.commercialContext?.revenueForecast;
    const cash = ctx.operationalContext?.cashCollection;
    return [
      stressed[0]
        ? `Commercial exposure centres on ${stressed[0].shortName} (health ${stressed[0].healthScore}). Prefer capital discipline until evidence improves.`
        : "No acute revenue/margin Outcome stress in the current snapshot.",
      financeReviewMissing
        ? "No finance review scheduled in the executive context window."
        : "Finance review is present on the executive calendar.",
      forecast
        ? `Forecast confidence is ${forecast.accuracyPct}% — ${forecast.detail}.`
        : null,
      cash && cash.overdueInvoices > 0
        ? `Cash collection risk: ${cash.detail}.`
        : null,
    ]
      .filter(Boolean)
      .join(" ");
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const marginPressure =
      decliningOutcomes(ctx).some(
        (o) => o.healthScore < 60 || /arr|revenue/i.test(o.shortName),
      ) ||
      commercialForecastSoft(ctx) ||
      operationalCashPressure(ctx);
    if (!decision) return [];
    return [
      rec(
        "cfo-delay-1",
        marginPressure ? "delay" : "investigate",
        marginPressure
          ? "Delay capital-heavy commitment until commercial evidence firms"
          : "Price and recover value before expanding commitment",
        marginPressure
          ? "Revenue/margin Outcomes, forecast confidence, or cash collection are under pressure — binding spend now raises commercial risk."
          : "Protect contribution margin on the live commercial path.",
        [
          ...decliningOutcomes(ctx)
            .slice(0, 2)
            .map((o) => `${o.shortName}: health ${o.healthScore}`),
          ctx.operationalContext?.cashCollection.detail ??
            ctx.commercialContext?.revenueForecast.detail ??
            decision.businessNarrative,
        ],
        [decision.id],
        decision.outcomeIds,
      ),
    ];
  },
  challenge(ctx) {
    const approve = ctx.snapshot.recommendations.filter((r) => r.act === "approve");
    return approve.slice(0, 1).map((item, index) =>
      challenge(
        `cfo-chal-${index}`,
        item.title,
        "Challenge: has cash, margin, and downside been quantified before approval?",
        [item.expectedDownside, item.reason],
      ),
    );
  },
  identifyRisks(ctx) {
    return decliningOutcomes(ctx)
      .filter((o) => o.healthScore < 65)
      .slice(0, 3)
      .map((o) =>
        risk(
          `cfo-risk-${o.id}`,
          `Commercial risk on ${o.shortName}`,
          o.healthScore < 50 ? "critical" : "high",
          [o.lastSignificantChange, `Health ${o.healthScore}`],
          [o.id],
        ),
      );
  },
  identifyOpportunities(ctx) {
    const building = ctx.snapshot.outcomes.filter((o) => o.momentum === "building");
    return building.slice(0, 2).map((o) =>
      opportunity(
        `cfo-opp-${o.id}`,
        `Protect upside on ${o.shortName}`,
        [o.predictedNarrative || o.lastSignificantChange],
        [o.id],
      ),
    );
  },
  reasoning(ctx) {
    return [
      "CFO lenses: revenue, margin, cash, forecast, capital allocation.",
      ...decliningOutcomes(ctx).map(
        (o) => `${o.shortName} health ${o.healthScore} (${o.status})`,
      ),
      ...(ctx.commercialContext
        ? [
            `Forecast confidence ${ctx.commercialContext.revenueForecast.accuracyPct}%`,
            ctx.commercialContext.revenueForecast.detail,
          ]
        : []),
      ...(ctx.operationalContext
        ? [ctx.operationalContext.cashCollection.detail]
        : []),
    ];
  },
});

/** COO — capacity, delivery, execution */
export const cooAgent: ExecutiveAgent = createAgent({
  id: "coo",
  title: "Chief Operating Officer",
  shortTitle: "COO",
  focusAreas: [
    "Capacity",
    "Operations",
    "Delivery",
    "Assets",
    "Execution",
    "Projects",
  ],
  summarise(ctx) {
    const delivery = decliningOutcomes(ctx);
    const ops = ctx.operationalContext;
    const opsSlipping = ctx.executiveContext?.commitments.some(
      (c) =>
        c.kind === "operational_review" &&
        (c.preparationRisk === "high" || c.preparationRisk === "moderate"),
    );
    if (ops) {
      return [
        `Operational health: ${ops.operationalHealth.label}.`,
        ops.capacity.detail,
        ops.jobsAtRisk[0]
          ? `Job at risk: ${ops.jobsAtRisk[0].title} (${ops.jobsAtRisk[0].customerName}).`
          : ops.servicePerformance.detail,
      ].join(" ");
    }
    return [
      delivery[0]
        ? `Delivery pressure on ${delivery[0].shortName} — proceed on the critical path or backlog will compound.`
        : `Operations posture: capacity ${ctx.snapshot.capacity.capacity}.`,
      opsSlipping
        ? "Operational reviews are slipping or under-prepared in executive context."
        : "Operating review cadence looks intact.",
    ].join(" ");
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    if (!decision) return [];
    const deliveryRisk =
      decliningOutcomes(ctx).length > 0 || operationalDeliveryPressure(ctx);
    return [
      rec(
        "coo-proceed-1",
        deliveryRisk ? "proceed" : "investigate",
        deliveryRisk
          ? "Proceed immediately on the delivery-critical Decision"
          : "Stabilise execution cadence before adding work",
        deliveryRisk
          ? "Operating Outcomes or live delivery pressure require action — delay increases delivery risk more than it buys clarity."
          : "Execution load is manageable; close unknowns, then move.",
        [
          ctx.snapshot.capacity.reasoning,
          ctx.operationalContext?.serviceDelivery.detail ??
            decliningOutcomes(ctx)[0]?.lastSignificantChange ??
            decision.businessNarrative,
          ...(ctx.operationalContext?.jobsAtRisk
            .slice(0, 1)
            .map((j) => `${j.title}: ${j.reason}`) ?? []),
        ],
        [decision.id],
        decision.outcomeIds,
      ),
    ];
  },
  challenge(ctx) {
    const waits = ctx.snapshot.recommendations.filter(
      (r) => r.act === "wait" || r.act === "defer",
    );
    return waits.slice(0, 1).map((item, index) =>
      challenge(
        `coo-chal-${index}`,
        item.title,
        "Challenge: waiting may widen the operational gap already visible in Outcome drift.",
        [item.reason, ...decliningOutcomes(ctx).map((o) => o.shortName)],
      ),
    );
  },
  identifyRisks(ctx) {
    const risks = decliningOutcomes(ctx)
      .slice(0, 2)
      .map((o) =>
        risk(
          `coo-risk-${o.id}`,
          `Delivery risk — ${o.shortName}`,
          "high",
          [o.lastSignificantChange],
          [o.id],
        ),
      );
    if (capacityTight(ctx) || (ctx.operationalContext?.capacity.level === "strained")) {
      risks.push(
        risk(
          "coo-risk-capacity",
          "Operating capacity constrained",
          "high",
          [
            ctx.operationalContext?.capacity.detail ??
              ctx.snapshot.capacity.reasoning,
          ],
        ),
      );
    }
    for (const job of ctx.operationalContext?.jobsAtRisk.slice(0, 2) ?? []) {
      risks.push(
        risk(`coo-risk-job-${job.id}`, `Job at risk — ${job.title}`, "high", [
          job.reason,
          job.customerName,
        ]),
      );
    }
    return risks;
  },
  identifyOpportunities(ctx) {
    const fromOps =
      ctx.operationalContext?.operationalOpportunities.slice(0, 2).map((o) =>
        opportunity(`coo-opp-ops-${o.id}`, o.title, [o.detail], o.relatedEntityIds),
      ) ?? [];
    if (fromOps.length > 0) return fromOps;
    return ctx.snapshot.recommendations
      .filter((r) => r.act === "schedule" || r.act === "delegate")
      .slice(0, 2)
      .map((r) =>
        opportunity(`coo-opp-${r.id}`, r.title, [r.expectedBenefit], r.relatedOutcomeIds),
      );
  },
  reasoning(ctx) {
    return [
      "COO lenses: capacity, delivery, execution, projects.",
      ctx.snapshot.capacity.reasoning,
      ...decliningOutcomes(ctx).map((o) => o.lastSignificantChange),
      ...(ctx.operationalContext
        ? [
            ctx.operationalContext.framing,
            ctx.operationalContext.capacity.detail,
            ctx.operationalContext.servicePerformance.detail,
          ]
        : []),
    ];
  },
});

/** CRO — pipeline, customers, growth */
export const croAgent: ExecutiveAgent = createAgent({
  id: "cro",
  title: "Chief Revenue Officer",
  shortTitle: "CRO",
  focusAreas: [
    "Pipeline",
    "Customers",
    "Growth",
    "Forecast",
    "Market expansion",
  ],
  summarise(ctx) {
    const growth = ctx.snapshot.outcomes.find((o) =>
      /arr|revenue|retention|growth/i.test(o.shortName + o.name),
    );
    const commercial = ctx.commercialContext;
    if (commercial) {
      const deliveryHit = ctx.operationalContext?.jobsAtRisk[0];
      return [
        `Growth trajectory: ${commercial.commercialHealth.label}.`,
        commercial.pipelineHealth.detail,
        deliveryHit
          ? `Delivery risk may impact revenue on ${deliveryHit.title}.`
          : commercial.largeDealsAtRisk[0]
            ? `Large deal pressure on ${commercial.largeDealsAtRisk[0].title}.`
            : commercial.salesMomentum.detail,
      ].join(" ");
    }
    return growth
      ? `Growth lens: ${growth.shortName} is ${growth.status} (health ${growth.healthScore}). Protect the commercial path.`
      : "No named growth Outcome in the current Focus set.";
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const growth = ctx.snapshot.outcomes.find((o) =>
      /arr|revenue|retention/i.test(o.shortName),
    );
    if (!decision) return [];
    const blocked =
      (growth &&
        (growth.status === "at_risk" || growth.status === "off_track")) ||
      commercialGrowthPressure(ctx) ||
      operationalDeliveryPressure(ctx);
    return [
      rec(
        "cro-growth-1",
        blocked ? "proceed" : "investigate",
        blocked
          ? "Unblock the commercial Decision to protect growth"
          : "Validate pipeline assumptions before expansion commits",
        blocked
          ? "Customer/revenue Outcomes or live commercial pressure require action — delay cedes the window."
          : "Growth is intact; investigate before adding commitment.",
        [
          growth
            ? `${growth.shortName}: ${growth.status}, ${growth.lastSignificantChange}`
            : "No growth Outcome linked",
          ctx.commercialContext?.pipelineHealth.detail ?? decision.question,
          ...(ctx.commercialContext?.largeDealsAtRisk
            .slice(0, 1)
            .map((d) => `${d.title}: ${d.reason}`) ?? []),
          ...(ctx.operationalContext?.jobsAtRisk
            .slice(0, 1)
            .map((j) => `Delivery impact: ${j.title}`) ?? []),
        ],
        [decision.id],
        decision.outcomeIds,
      ),
    ];
  },
  challenge(ctx) {
    return decliningOutcomes(ctx)
      .filter((o) => /retention|arr|customer/i.test(o.shortName))
      .slice(0, 1)
      .map((o, index) =>
        challenge(
          `cro-chal-${index}`,
          o.shortName,
          "Challenge: is the growth plan honest about customer health and conversion risk?",
          [o.lastSignificantChange, `Health ${o.healthScore}`],
        ),
      );
  },
  identifyRisks(ctx) {
    return decliningOutcomes(ctx)
      .filter((o) => /arr|retention|customer|revenue/i.test(o.shortName))
      .map((o) =>
        risk(
          `cro-risk-${o.id}`,
          `Growth/customer risk — ${o.shortName}`,
          o.healthScore < 50 ? "critical" : "high",
          [o.lastSignificantChange],
          [o.id],
        ),
      );
  },
  identifyOpportunities(ctx) {
    return ctx.snapshot.outcomes
      .filter((o) => o.momentum === "building")
      .slice(0, 2)
      .map((o) =>
        opportunity(
          `cro-opp-${o.id}`,
          `Expand from momentum on ${o.shortName}`,
          [o.predictedNarrative || o.momentumLabel],
          [o.id],
        ),
      );
  },
  reasoning(ctx) {
    return [
      "CRO lenses: pipeline, customers, growth, forecast.",
      ...ctx.snapshot.outcomes
        .filter((o) => /arr|retention|revenue/i.test(o.shortName))
        .map((o) => `${o.shortName}: ${o.status}`),
      ...(ctx.commercialContext
        ? [
            ctx.commercialContext.framing,
            ctx.commercialContext.pipelineHealth.detail,
            ...ctx.commercialContext.recommendations
              .slice(0, 2)
              .map((r) => r.title),
          ]
        : []),
      ...(ctx.operationalContext?.jobsAtRisk
        .slice(0, 1)
        .map((j) => `Delivery→revenue: ${j.title}`) ?? []),
    ];
  },
});

/** Chief Risk Officer */
export const chiefRiskOfficerAgent: ExecutiveAgent = createAgent({
  id: "chief_risk_officer",
  title: "Chief Risk Officer",
  shortTitle: "CRisk",
  focusAreas: [
    "Enterprise risk",
    "Cyber",
    "Compliance",
    "Operational",
    "Strategic",
    "Financial",
  ],
  summarise(ctx) {
    const brief = topBrief(ctx);
    const unknowns = brief?.unknowns.length ?? 0;
    const ops = ctx.operationalContext;
    if (ops && (ops.safetySignals.length > 0 || ops.jobsAtRisk.length > 0)) {
      return [
        ops.safetySignals[0]
          ? `Safety/operational risk: ${ops.safetySignals[0]}.`
          : "Operational risk watch active.",
        ops.jobsAtRisk[0]
          ? `Delivery risk on ${ops.jobsAtRisk[0].title}.`
          : ops.operationalHealth.detail,
      ].join(" ");
    }
    return unknowns > 0
      ? `${unknowns} material unknown(s) remain on the lead Decision — do not hide uncertainty.`
      : `Risk posture follows pulse ${ctx.snapshot.pulse.label}.`;
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const brief = topBrief(ctx);
    if (!decision) return [];
    const materialUnknowns = (brief?.unknowns ?? []).filter(
      (u) => u.severity === "material",
    );
    const opsRisk =
      operationalSafetyPressure(ctx) || operationalDeliveryPressure(ctx);
    return [
      rec(
        "crisk-1",
        materialUnknowns.length > 0 || opsRisk ? "investigate" : "watch",
        materialUnknowns.length > 0
          ? "Close material unknowns before bind"
          : opsRisk
            ? "Treat operational and safety exposure as Decision constraints"
            : "Maintain risk watch on residual exposure",
        materialUnknowns[0]?.whyItMatters ??
          (opsRisk
            ? "Live operational or safety signals must stay visible through the Decision."
            : "Residual risk must stay visible through the Decision."),
        [
          ...(brief?.unknowns.slice(0, 2).map((u) => u.question) ?? []),
          ctx.operationalContext?.safetySignals[0] ??
            ctx.operationalContext?.jobsAtRisk[0]?.reason ??
            decision.businessNarrative,
        ],
        [decision.id],
        decision.outcomeIds,
      ),
    ];
  },
  challenge(ctx) {
    const brief = topBrief(ctx);
    return (brief?.unknowns ?? []).slice(0, 2).map((unknown, index) =>
      challenge(
        `crisk-chal-${index}`,
        brief!.question,
        `Challenge: ${unknown.question}`,
        [unknown.whyItMatters, unknown.howToResolve],
      ),
    );
  },
  identifyRisks(ctx) {
    const fromOutcomes = decliningOutcomes(ctx).map((o) =>
      risk(
        `crisk-out-${o.id}`,
        `Strategic/operational risk — ${o.shortName}`,
        o.status === "off_track" ? "critical" : "high",
        [o.lastSignificantChange],
        [o.id],
      ),
    );
    const fromBrief = (topBrief(ctx)?.unknowns ?? [])
      .filter((u) => u.severity === "material")
      .map((u) =>
        risk(`crisk-unk-${u.id}`, u.question, "high", [u.whyItMatters], u.relatedEntityIds),
      );
    return [...fromOutcomes, ...fromBrief].slice(0, 5);
  },
  identifyOpportunities() {
    return [];
  },
  reasoning(ctx) {
    return [
      "CRO lenses: enterprise, cyber, compliance, operational, strategic, financial risk.",
      ...(topBrief(ctx)?.unknowns.map((u) => u.question) ?? []),
      ...(ctx.operationalContext
        ? [
            ...ctx.operationalContext.safetySignals.slice(0, 2),
            ...ctx.operationalContext.jobsAtRisk
              .slice(0, 1)
              .map((j) => j.reason),
          ]
        : []),
    ];
  },
});

/** Chief People Officer */
export const chiefPeopleOfficerAgent: ExecutiveAgent = createAgent({
  id: "chief_people_officer",
  title: "Chief People Officer",
  shortTitle: "CPO",
  focusAreas: [
    "Leadership",
    "Capacity",
    "Culture",
    "Retention",
    "Capability",
    "Succession",
  ],
  summarise(ctx) {
    const engagementDown =
      ctx.executiveContext?.signals.some(
        (s) =>
          s.id === "executive_availability" &&
          (s.severity === "moderate" || s.severity === "high"),
      ) ?? false;
    return [
      capacityTight(ctx)
        ? "Leadership and team capacity are strained — retention and judgement quality are at risk if overload continues."
        : "People capacity is adequate to support the current Decision load.",
      engagementDown
        ? "Leadership engagement appears reduced — presence and meeting load suggest limited Focus."
        : "Leadership engagement signals are stable.",
    ].join(" ");
  },
  recommend(ctx) {
    if (!capacityTight(ctx)) {
      return [
        rec(
          "cpo-watch-1",
          "watch",
          "Monitor leadership load through the week",
          "No acute people-capacity breach in the snapshot.",
          [ctx.snapshot.capacity.reasoning],
        ),
      ];
    }
    return [
      rec(
        "cpo-delegate-1",
        "delegate",
        "Delegate preparation work; protect executive and team load",
        "Contested attention and constrained capacity are people risks, not only schedule issues.",
        [ctx.snapshot.capacity.reasoning],
      ),
    ];
  },
  challenge(ctx) {
    if (!capacityTight(ctx)) return [];
    return [
      challenge(
        "cpo-chal-1",
        "Executive workload",
        "Challenge: does this path increase overtime/context-switching without a recovery plan?",
        [ctx.snapshot.capacity.reasoning],
      ),
    ];
  },
  identifyRisks(ctx) {
    if (!capacityTight(ctx)) return [];
    return [
      risk(
        "cpo-risk-retention",
        "Future retention risk from sustained overload",
        "high",
        [ctx.snapshot.capacity.reasoning],
      ),
    ];
  },
  identifyOpportunities(ctx) {
    return ctx.snapshot.recommendations
      .filter((r) => r.act === "delegate")
      .slice(0, 1)
      .map((r) =>
        opportunity(`cpo-opp-${r.id}`, "Delegation creates capability stretch", [r.reason]),
      );
  },
  reasoning(ctx) {
    return [
      "CPO lenses: leadership capacity, retention, capability, succession.",
      ctx.snapshot.capacity.reasoning,
    ];
  },
});

/** Chief Customer Officer */
export const chiefCustomerOfficerAgent: ExecutiveAgent = createAgent({
  id: "chief_customer_officer",
  title: "Chief Customer Officer",
  shortTitle: "CCO",
  focusAreas: ["Customer health", "Experience", "Retention", "Trust"],
  summarise(ctx) {
    const customer = ctx.snapshot.outcomes.find((o) =>
      /retention|customer|board|arr/i.test(o.shortName),
    );
    const opsCustomer = ctx.operationalContext?.criticalCustomers[0];
    if (opsCustomer) {
      return `Customer experience pressure on ${opsCustomer.customerName} — ${opsCustomer.risk}.`;
    }
    const health = ctx.commercialContext?.customerHealth;
    if (health) {
      return `Customer health: ${health.label} — ${health.detail}${
        ctx.commercialContext?.renewalRisks[0]
          ? ` Renewal pressure on ${ctx.commercialContext.renewalRisks[0].title}.`
          : ""
      }`;
    }
    return customer
      ? `Customer lens: ${customer.shortName} is ${customer.status} — ${customer.lastSignificantChange}`
      : "No explicit customer Outcome in the Focus set.";
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const customer = decliningOutcomes(ctx).find((o) =>
      /retention|customer|arr/i.test(o.shortName),
    );
    const commercialCustomerRisk =
      ctx.commercialContext != null &&
      (ctx.commercialContext.customerHealth.level === "watch" ||
        ctx.commercialContext.customerHealth.level === "strained" ||
        ctx.commercialContext.customerHealth.level === "critical" ||
        ctx.commercialContext.renewalRisks.length > 0);
    const opsCustomerRisk =
      (ctx.operationalContext?.criticalCustomers.length ?? 0) > 0 ||
      (ctx.operationalContext?.jobsAtRisk.length ?? 0) > 0;
    if (!decision) return [];
    const pressured = Boolean(
      customer || commercialCustomerRisk || opsCustomerRisk,
    );
    return [
      rec(
        "cco-1",
        pressured ? "proceed" : "watch",
        pressured
          ? "Prioritise the Decision that restores customer trust"
          : "Keep customer commitments visible through the bind",
        pressured
          ? "Customer health or delivery experience is slipping — indecision compounds trust damage."
          : "Customer posture is stable; do not trade trust for speed.",
        [
          customer?.lastSignificantChange ??
            ctx.operationalContext?.criticalCustomers[0]?.risk ??
            ctx.commercialContext?.customerHealth.detail ??
            "No declining customer Outcome",
          decision.question,
        ],
        [decision.id],
        decision.outcomeIds,
      ),
    ];
  },
  challenge(ctx) {
    return ctx.snapshot.recommendations
      .filter((r) => r.act === "wait")
      .slice(0, 1)
      .map((r, index) =>
        challenge(
          `cco-chal-${index}`,
          r.title,
          "Challenge: waiting may be read by the customer as avoidance.",
          [r.reason],
        ),
      );
  },
  identifyRisks(ctx) {
    return decliningOutcomes(ctx)
      .filter((o) => /retention|customer|arr|board/i.test(o.shortName))
      .map((o) =>
        risk(
          `cco-risk-${o.id}`,
          `Customer trust risk — ${o.shortName}`,
          "high",
          [o.lastSignificantChange],
          [o.id],
        ),
      );
  },
  identifyOpportunities(ctx) {
    return ctx.briefs
      .flatMap((b) => b.optionsInPlay)
      .filter((o) => /customer|trust|sla|service/i.test(o.label))
      .slice(0, 1)
      .map((o) =>
        opportunity(`cco-opp-${o.id}`, o.label, [o.oneLiner]),
      );
  },
  reasoning(ctx) {
    return [
      "CCO lenses: customer health, retention, trust.",
      ...ctx.snapshot.outcomes
        .filter((o) => /retention|arr|board/i.test(o.shortName))
        .map((o) => `${o.shortName}: ${o.status}`),
      ...(ctx.commercialContext
        ? [
            ctx.commercialContext.customerHealth.detail,
            ...ctx.commercialContext.renewalRisks
              .slice(0, 2)
              .map((r) => r.title),
          ]
        : []),
      ...(ctx.operationalContext?.criticalCustomers
        .slice(0, 2)
        .map((c) => `${c.customerName}: ${c.risk}`) ?? []),
    ];
  },
});

/** CSO — permanent Council seat (formerly chief_strategy_officer id) */
export const chiefStrategyOfficerAgent: ExecutiveAgent = createAgent({
  id: "cso",
  title: "Chief Strategy Officer",
  shortTitle: "CSO",
  focusAreas: [
    "Strategic initiatives",
    "Competitive landscape",
    "Portfolio",
    "Transformation",
    "Long-term outcomes",
  ],
  summarise(ctx) {
    const brief = topBrief(ctx);
    const alignment = brief?.intentAlignment ?? "Unknown";
    const expansion = ctx.commercialContext?.signals.find(
      (s) => s.id === "market_expansion",
    );
    return [
      `Strategy lens: lead Decision alignment is ${alignment}. Prefer paths that compound long-term Outcomes.`,
      expansion
        ? `Market expansion: ${expansion.summary}`
        : null,
    ]
      .filter(Boolean)
      .join(" ");
  },
  recommend(ctx) {
    const decision = primaryDecision(ctx);
    const brief = topBrief(ctx);
    if (!decision) return [];
    const highAlign =
      decision.strategicAlignment.level === "high" ||
      /high/i.test(brief?.intentAlignment ?? "");
    const expansionPressure =
      ctx.commercialContext?.signals.find((s) => s.id === "market_expansion")
        ?.severity === "high" ||
      ctx.commercialContext?.signals.find((s) => s.id === "market_expansion")
        ?.severity === "critical";
    return [
      rec(
        "cso-1",
        highAlign || expansionPressure ? "proceed" : "investigate",
        highAlign
          ? "Advance the strategically aligned option"
          : expansionPressure
            ? "Protect market expansion momentum in the portfolio"
            : "Test strategic fit before committing the portfolio",
        highAlign
          ? "Intent alignment is high — hesitation is the larger strategic cost."
          : expansionPressure
            ? "Market expansion signals require portfolio attention before the window closes."
            : "Strategic fit is unclear — investigate before reallocating the portfolio.",
        [
          decision.strategicAlignment.reasoning,
          brief?.closingNote ?? decision.businessNarrative,
          ctx.commercialContext?.signals.find((s) => s.id === "market_expansion")
            ?.summary ?? "No market expansion signal",
        ],
        [decision.id],
        decision.outcomeIds,
      ),
    ];
  },
  challenge(ctx) {
    const low = openDecisions(ctx).filter(
      (d) =>
        d.strategicAlignment.level === "low" ||
        d.strategicAlignment.level === "conflicts",
    );
    return low.slice(0, 1).map((d, index) =>
      challenge(
        `cso-chal-${index}`,
        d.question,
        "Challenge: this Decision conflicts with or weakly maps to executive intent.",
        [d.strategicAlignment.reasoning],
      ),
    );
  },
  identifyRisks(ctx) {
    return openDecisions(ctx)
      .filter((d) => d.strategicAlignment.level === "conflicts")
      .map((d) =>
        risk(
          `cso-risk-${d.id}`,
          `Strategic conflict — ${d.question}`,
          "critical",
          [d.strategicAlignment.reasoning],
          [d.id],
        ),
      );
  },
  identifyOpportunities(ctx) {
    return openDecisions(ctx)
      .filter((d) => d.strategicAlignment.level === "high")
      .slice(0, 2)
      .map((d) =>
        opportunity(
          `cso-opp-${d.id}`,
          `Compound advantage via ${d.question}`,
          [d.strategicAlignment.reasoning],
          [d.id, ...d.outcomeIds],
        ),
      );
  },
  reasoning(ctx) {
    return [
      "CSO lenses: initiatives, portfolio, transformation, long-term Outcomes.",
      ...openDecisions(ctx).map(
        (d) => `${d.question} — ${d.strategicAlignment.label}`,
      ),
      ...(ctx.commercialContext
        ? [
            ctx.commercialContext.signals.find((s) => s.id === "market_expansion")
              ?.summary ?? "Market expansion calm",
            ...ctx.commercialContext.strategicAccounts
              .slice(0, 2)
              .map((a) => a.name),
          ]
        : []),
    ];
  },
});

/** Permanent Executive Council — CEO · CFO · COO · CRO · CSO */
export const COUNCIL_AGENTS: ExecutiveAgent[] = [
  ceoAgent,
  cfoAgent,
  cooAgent,
  croAgent,
  chiefStrategyOfficerAgent,
];

/** Specialty lenses — not Council seats */
export const SPECIALTY_AGENTS: ExecutiveAgent[] = [
  chiefOfStaffAgent,
  chiefRiskOfficerAgent,
  chiefPeopleOfficerAgent,
  chiefCustomerOfficerAgent,
];

/** @deprecated Alias for permanent CSO seat */
export const csoAgent = chiefStrategyOfficerAgent;
