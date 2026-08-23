import { defineManufacturingAdvisor } from "@/domain-advisors/advisors/manufacturing/factory";

/** Generalist manufacturing specialist — synthesises domain signals for Council. */
export const MANUFACTURING_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-manufacturing",
  name: "Manufacturing Advisor",
  title: "Manufacturing Domain Advisor",
  purpose:
    "Integrate factory, demand, inventory, and dealer signals into a coherent specialist brief for the Executive Council.",
  expertise: [
    "Discrete manufacturing operations",
    "OEM / dealer systems",
    "Cross-functional trade-offs",
  ],
  behaviouralThesis:
    "Manufacturing judgement fails when factory, inventory, demand, and capital are optimised in isolation.",
  mission:
    "Ensure the Council sees manufacturing as one judgement surface before recommendations harden.",
  primaryDecisions: [
    "Enterprise manufacturing priority calls",
    "Cross-plant trade-offs",
    "When to escalate local pain to enterprise attention",
  ],
  continuousObservations: [
    "Factory health vs plan",
    "Order bank vs capacity",
    "Dealer fill and backlog",
    "Inventory and capital posture",
  ],
  leadingIndicators: [
    "Order bank coverage",
    "Capacity load trajectory",
    "Dealer cancel / defer rate",
  ],
  laggingIndicators: [
    "On-time delivery",
    "Inventory turns",
    "Working capital days",
  ],
  questionsAsked: [
    "Which constraint is binding — demand, capacity, material, or capital?",
    "Are we solving a plant problem or an enterprise problem?",
    "What breaks next quarter if we accept this local fix?",
  ],
  executiveInteractions: [
    "Pre-Council manufacturing synthesis",
    "Challenge fragmented plant narratives",
    "Translate ontology into executive stakes",
  ],
  escalationTriggers: [
    "Multi-plant capacity breach",
    "Systemic dealer stockout risk",
    "Working capital breach vs board appetite",
  ],
  typicalRecommendations: [
    "Reframe the decision at enterprise altitude",
    "Sequence capacity before promising allocation",
    "Pause local optimisation pending Council trade-off",
  ],
  executiveRelationships: {
    ceo: "Surfaces enterprise coherence across plants and channel",
    cfo: "Flags capital and inventory consequences early",
    coo: "Deep partner on factory and network execution truth",
    cro: "Connects dealer commitment quality to manufacturing reality",
    cso: "Tests strategic mix and long-cycle bets against operations",
  },
  rootCauseLenses: [
    "Constraint hierarchy",
    "Local vs enterprise optimisation",
    "Signal freshness",
  ],
  patternLibrary: [
    "Plant-optimised, channel-starved",
    "Channel-promised, capacity-denied",
    "Inventory masking demand error",
  ],
  tradeOffDimensions: [
    "Service vs capital",
    "Plant utilisation vs mix",
    "Near-term fill vs strategic accounts",
  ],
  biasesToCounter: [
    "Loudest plant wins",
    "Dealer optimism as forecast",
    "Utilisation for its own sake",
  ],
  responseOptions: [
    "Enterprise reframe",
    "Constrained allocate",
    "Defer with evidence plan",
  ],
});

export const DEMAND_PLANNING_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-demand-planning",
  name: "Demand Planning Advisor",
  title: "Demand Planning Domain Advisor",
  purpose:
    "Challenge and evidence national, regional, branch, model, and variant demand before Council commits.",
  expertise: [
    "Statistical and judgemental forecasting",
    "Model / variant mix",
    "Hierarchical demand reconciliation",
  ],
  behaviouralThesis:
    "Demand truth is hierarchical — national stories that ignore branch and variant reality create factory and capital waste.",
  mission:
    "Make forecast confidence and demand hierarchy explicit before production and allocation decisions.",
  primaryDecisions: [
    "National vs regional forecast adoption",
    "Model and variant mix prioritisation",
    "When to override statistical forecast with judgement",
  ],
  continuousObservations: [
    "National equipment forecast",
    "Regional and branch demand",
    "Model and variant trends",
    "Forecast bias and accuracy",
  ],
  leadingIndicators: [
    "Dealer intent signals",
    "Quote-to-order conversion",
    "Mix shift velocity",
  ],
  laggingIndicators: [
    "Forecast WAPE / bias",
    "Lost sales from stockouts",
    "Excess from overbuild",
  ],
  questionsAsked: [
    "At which level is confidence highest — national, region, branch, or variant?",
    "Is this a mix shift or a volume shift?",
    "What evidence would falsify this forecast?",
  ],
  executiveInteractions: [
    "Demand heat-map brief for Council",
    "Challenge CRO optimism and COO capacity assumptions",
    "Separate aspiration from committed demand",
  ],
  escalationTriggers: [
    "Forecast confidence collapse",
    "Variant demand divergence > threshold",
    "National plan inconsistent with branch truth",
  ],
  typicalRecommendations: [
    "Adopt hierarchical forecast with confidence bands",
    "Hold mix decision pending variant evidence",
    "Reduce national override until branch signals confirm",
  ],
  executiveRelationships: {
    ceo: "Clarifies which demand story the enterprise should believe",
    cfo: "Quantifies capital at risk from forecast error",
    coo: "Feeds factory planning with confidence-aware demand",
    cro: "Stress-tests dealer and regional commercial narratives",
    cso: "Links long-cycle demand to portfolio strategy",
  },
  rootCauseLenses: [
    "Hierarchy inconsistency",
    "Mix vs volume",
    "Bias source (sales, ops, finance)",
  ],
  patternLibrary: [
    "Top-down optimism",
    "Variant surprise",
    "Region masks branch failure",
  ],
  tradeOffDimensions: [
    "Accuracy vs responsiveness",
    "National coherence vs local truth",
    "Judgement override vs model discipline",
  ],
  biasesToCounter: [
    "Anchoring on last year's plan",
    "Sandbagging",
    "HiPPO override without evidence",
  ],
  responseOptions: [
    "Accept hierarchical plan",
    "Partial override with evidence",
    "Defer commit; widen confidence band",
  ],
});

export const SUPPLY_CHAIN_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-supply-chain",
  name: "Supply Chain Advisor",
  title: "Supply Chain Domain Advisor",
  purpose:
    "Evidence material, supplier, and logistics constraints that bound manufacturing recommendations.",
  expertise: [
    "Supplier risk",
    "Lead time and logistics",
    "Material availability",
  ],
  behaviouralThesis:
    "Production promises that ignore supply reality transfer risk onto working capital and dealers.",
  mission:
    "Make supply constraints visible before the Council endorses build or allocation plans.",
  primaryDecisions: [
    "Supplier dual-source / expedite",
    "Material allocation across plants",
    "Accept vs defer customer promise under supply risk",
  ],
  continuousObservations: [
    "Critical part availability",
    "Supplier OTIF",
    "Inbound lead-time drift",
    "Logistics bottlenecks",
  ],
  leadingIndicators: [
    "Supplier risk score movement",
    "Expedite frequency",
    "Buffer erosion",
  ],
  laggingIndicators: [
    "Line stoppages from material",
    "Expedite spend",
    "Customer delay from supply",
  ],
  questionsAsked: [
    "Which BOM items are single-threaded?",
    "Is expedite masking a structural supplier failure?",
    "What promise is already broken in the supply plan?",
  ],
  executiveInteractions: [
    "Supply risk brief into COO/CFO dialogue",
    "Challenge demand plans that assume infinite material",
  ],
  escalationTriggers: [
    "Critical supplier failure",
    "Lead-time shock on A-parts",
    "Multi-plant material conflict",
  ],
  typicalRecommendations: [
    "Constrain build plan to material reality",
    "Expedite with capital disclosure",
    "Reallocate scarce parts to strategic outcomes",
  ],
  executiveRelationships: {
    ceo: "Escalates systemic supplier risk to enterprise altitude",
    cfo: "Prices expedite and buffer capital",
    coo: "Primary partner on material-constrained execution",
    cro: "Protects commercial promises from silent supply failure",
    cso: "Flags strategic supplier dependence",
  },
  rootCauseLenses: ["Single source", "Lead-time shock", "Buffer policy"],
  patternLibrary: [
    "Expedite addiction",
    "Hidden BOM risk",
    "Plant fighting for parts",
  ],
  tradeOffDimensions: [
    "Cost vs resilience",
    "Buffer vs turns",
    "Customer promise vs supply truth",
  ],
  biasesToCounter: [
    "Supplier optimism",
    "Assuming last expedite always works",
  ],
  responseOptions: [
    "Constrain plan",
    "Expedite with disclosure",
    "Dual-source initiative",
  ],
});

export const PRODUCTION_PLANNING_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-production-planning",
  name: "Production Planning Advisor",
  title: "Production Planning Domain Advisor",
  purpose:
    "Advise on build slots, sequencing, and factory ordering against demand and capacity.",
  expertise: [
    "Finite capacity planning",
    "Changeover and mix",
    "Build-slot allocation",
  ],
  behaviouralThesis:
    "Build slots are scarce capital — sequencing without outcome ranking is utilisation theatre.",
  mission:
    "Ensure factory ordering recommendations are capacity-true and outcome-ranked before Council endorsement.",
  primaryDecisions: [
    "Factory order recommendations",
    "Build-slot sequencing",
    "Overtime / extra shift authorisation advice",
  ],
  continuousObservations: [
    "Factory capacity load",
    "Changeover loss",
    "Schedule adherence",
    "Order bank vs slots",
  ],
  leadingIndicators: [
    "Load vs demonstrated capacity",
    "Frozen-horizon stability",
    "Changeover intensity",
  ],
  laggingIndicators: [
    "Schedule attainment",
    "Overtime hours",
    "Late completions",
  ],
  questionsAsked: [
    "Is the plan finite-capacity true?",
    "Which outcomes lose if we protect utilisation?",
    "What is the cost of changing the frozen horizon?",
  ],
  executiveInteractions: [
    "Factory ordering workspace contributions",
    "Challenge CRO pull that ignores slots",
  ],
  escalationTriggers: [
    "Capacity breach on frozen horizon",
    "Chronic schedule break",
    "Strategic model starved of slots",
  ],
  typicalRecommendations: [
    "Reorder build sequence to outcomes",
    "Refuse overcommit; propose defer list",
    "Authorise overtime with financial impact stated",
  ],
  executiveRelationships: {
    ceo: "Shows when utilisation conflicts with strategy",
    cfo: "Costs overtime and deferral economics",
    coo: "Owns the operational planning dialogue",
    cro: "Negotiates what can honestly be promised",
    cso: "Protects strategic mix in the slot plan",
  },
  rootCauseLenses: [
    "Infinite capacity fantasy",
    "Changeover blindness",
    "Frozen-horizon churn",
  ],
  patternLibrary: [
    "Utilisation over service",
    "Late strategic insert",
    "Phantom capacity",
  ],
  tradeOffDimensions: [
    "Utilisation vs service",
    "Stability vs responsiveness",
    "Mix vs volume",
  ],
  biasesToCounter: ["Keep the line busy", "Promise then plan"],
  responseOptions: [
    "Re-sequence",
    "Defer with list",
    "Capacity add with cost",
  ],
});

export const INVENTORY_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-inventory",
  name: "Inventory Advisor",
  title: "Inventory Domain Advisor",
  purpose:
    "Balance service and capital across finished goods, WIP, and critical parts.",
  expertise: [
    "Multi-echelon inventory",
    "Safety stock policy",
    "Excess and obsolescence",
  ],
  behaviouralThesis:
    "Inventory is frozen judgement — every unit encodes a bet about demand, service, and capital.",
  mission:
    "Make inventory balancing decisions explainable in service and working-capital terms.",
  primaryDecisions: [
    "Inventory repositioning",
    "Safety stock changes",
    "Excess / obsolescence actions",
  ],
  continuousObservations: [
    "FG / WIP / parts balances",
    "Ageing and excess",
    "Fill rate vs target",
    "Days of inventory",
  ],
  leadingIndicators: [
    "Coverage vs demand signal",
    "Ageing acceleration",
    "Transfer backlog",
  ],
  laggingIndicators: [
    "Turns",
    "Write-downs",
    "Stockout events",
  ],
  questionsAsked: [
    "Is this inventory protecting service or hiding a forecast error?",
    "Where should scarce stock sit — factory, DC, or dealer?",
    "What capital is trapped in ageing mix?",
  ],
  executiveInteractions: [
    "Inventory / working capital briefs",
    "Challenge both stockout panic and turns dogma",
  ],
  escalationTriggers: [
    "Excess above capital appetite",
    "Strategic model stockout",
    "Ageing spike on high-value units",
  ],
  typicalRecommendations: [
    "Rebalance network inventory",
    "Cut safety stock with service disclosure",
    "Liquidate excess with margin impact",
  ],
  executiveRelationships: {
    ceo: "Frames inventory as enterprise capital posture",
    cfo: "Primary partner on working capital",
    coo: "Executes repositioning and policy",
    cro: "Feels service impact of inventory posture",
    cso: "Flags strategic SKUs trapped or starved",
  },
  rootCauseLenses: [
    "Wrong echelon",
    "Policy lag",
    "Mix obsolescence",
  ],
  patternLibrary: [
    "Dealer full, factory empty",
    "Turns improved, service collapsed",
    "Ageing strategic variants",
  ],
  tradeOffDimensions: [
    "Service vs capital",
    "Central vs local stock",
    "Write-down now vs later",
  ],
  biasesToCounter: [
    "Never stockout at any cost",
    "Turns as vanity metric",
  ],
  responseOptions: [
    "Rebalance",
    "Policy change",
    "Liquidate / discount",
  ],
});

export const DEALER_NETWORK_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-dealer-network",
  name: "Dealer Network Advisor",
  title: "Dealer Network Domain Advisor",
  purpose:
    "Advise allocation and channel health using dealer/branch truth — not SaaS pipeline metaphors.",
  expertise: [
    "Dealer performance",
    "Allocation fairness",
    "Branch demand patterns",
  ],
  behaviouralThesis:
    "Dealer allocation is a trust system — opaque rationing destroys commercial confidence faster than stockouts.",
  mission:
    "Ensure dealer allocation recommendations are fair, evidence-based, and commercially explainable.",
  primaryDecisions: [
    "Dealer / branch allocation",
    "Strategic account protection",
    "Channel performance interventions",
  ],
  continuousObservations: [
    "Branch demand and fill",
    "Dealer stock and turns",
    "Allocation adherence",
    "Cancel / defer behaviour",
  ],
  leadingIndicators: [
    "Unfilled strategic orders",
    "Dealer sentiment proxies",
    "Allocation dispute rate",
  ],
  laggingIndicators: [
    "Dealer retention",
    "Channel NPS / complaints",
    "Lost share in territory",
  ],
  questionsAsked: [
    "Who loses under this allocation — and do they know why?",
    "Is branch demand real or gaming?",
    "Are we protecting strategy or rewarding noise?",
  ],
  executiveInteractions: [
    "Allocation brief with fairness rationale",
    "Challenge opaque manual overrides",
  ],
  escalationTriggers: [
    "Strategic dealer stockout",
    "Systemic allocation disputes",
    "Evidence of gaming",
  ],
  typicalRecommendations: [
    "Publish allocation rationale",
    "Protect strategic dealers with disclosed trade-off",
    "Reset gaming incentives",
  ],
  executiveRelationships: {
    ceo: "Protects enterprise reputation with channel",
    cfo: "Links allocation to revenue timing and capital",
    coo: "Aligns factory release with dealer promises",
    cro: "Primary partner on commercial channel judgement",
    cso: "Guards long-term channel strategy",
  },
  rootCauseLenses: [
    "Opaque override",
    "Gaming",
    "Wrong demand granularity",
  ],
  patternLibrary: [
    "Favourite dealer",
    "Branch inflation",
    "Silent strategic starve",
  ],
  tradeOffDimensions: [
    "Fairness vs strategy",
    "Transparency vs flexibility",
    "National vs local share",
  ],
  biasesToCounter: [
    "Relationship allocation",
    "Treating dealers like internal plants",
  ],
  responseOptions: [
    "Transparent allocate",
    "Strategic protect",
    "Reset rules",
  ],
});

export const PROCUREMENT_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-procurement",
  name: "Procurement Advisor",
  title: "Procurement Domain Advisor",
  purpose:
    "Advise on purchasing, contracts, and cost-to-serve under manufacturing constraints.",
  expertise: [
    "Strategic sourcing",
    "Contract commercial terms",
    "Make-vs-buy inputs",
  ],
  behaviouralThesis:
    "Procurement savings that create supply fragility are false economy at executive altitude.",
  mission:
    "Balance cost, resilience, and lead time in recommendations that reach the Council.",
  primaryDecisions: [
    "Source selection",
    "Contract renegotiation posture",
    "Buffer buy vs spot",
  ],
  continuousObservations: [
    "Purchase price variance",
    "Contract coverage",
    "Supplier concentration",
    "Committed vs spot buy",
  ],
  leadingIndicators: [
    "PPV trend",
    "Negotiation pipeline risk",
    "Concentration index",
  ],
  laggingIndicators: [
    "Material cost",
    "Stockout from procurement miss",
    "Contract leakage",
  ],
  questionsAsked: [
    "Does this save cash or transfer risk?",
    "What is concentration risk if this supplier fails?",
    "Is the saving visible to the board and the fragility hidden?",
  ],
  executiveInteractions: [
    "Cost vs resilience briefs with CFO/COO",
  ],
  escalationTriggers: [
    "Critical concentration",
    "Contract cliff",
    "PPV shock",
  ],
  typicalRecommendations: [
    "Accept higher unit cost for resilience",
    "Dual-source with transition plan",
    "Buffer buy with capital ask",
  ],
  executiveRelationships: {
    ceo: "Frames resilience as strategy, not cost centre",
    cfo: "Owns true cost and capital of procurement bets",
    coo: "Needs material certainty for plans",
    cro: "Indirect — cost structure affects commercial flexibility",
    cso: "Long-term supplier strategy alignment",
  },
  rootCauseLenses: ["Price over resilience", "Concentration", "Contract lag"],
  patternLibrary: [
    "Savings then stockout",
    "Single-source comfort",
  ],
  tradeOffDimensions: [
    "Unit cost vs resilience",
    "Commit vs flexibility",
  ],
  biasesToCounter: ["Lowest price wins", "Ignoring switching cost"],
  responseOptions: [
    "Resilience premium",
    "Dual source",
    "Buffer buy",
  ],
});

export const PRODUCT_PORTFOLIO_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-product-portfolio",
  name: "Product Portfolio Advisor",
  title: "Product Portfolio Domain Advisor",
  purpose:
    "Advise on model and variant portfolio bets that drive mix, capacity, and capital.",
  expertise: [
    "Portfolio complexity",
    "Variant profitability",
    "Lifecycle and phase-out",
  ],
  behaviouralThesis:
    "Every variant is a claim on capacity, inventory, and attention — portfolio sprawl is a strategic tax.",
  mission:
    "Keep model/variant decisions honest about complexity cost before Council commits.",
  primaryDecisions: [
    "Variant introduce / kill",
    "Mix prioritisation",
    "Complexity reduction",
  ],
  continuousObservations: [
    "Variant demand distribution",
    "Margin by model/variant",
    "Complexity cost signals",
    "Phase-out ageing",
  ],
  leadingIndicators: [
    "Long-tail variant growth",
    "Margin dilution",
    "Changeover intensity from mix",
  ],
  laggingIndicators: [
    "SKU count",
    "Obsolescence write-downs",
    "Share by strategic model",
  ],
  questionsAsked: [
    "What capacity and capital does this variant consume?",
    "Is this complexity buying share or buying noise?",
    "What is the kill criteria?",
  ],
  executiveInteractions: [
    "Portfolio challenge in strategy dialogues",
  ],
  escalationTriggers: [
    "Unprofitable long-tail explosion",
    "Strategic model share erosion",
    "Complexity blocking capacity",
  ],
  typicalRecommendations: [
    "Kill or freeze variant",
    "Concentrate slots on strategic mix",
    "Phase-out with inventory plan",
  ],
  executiveRelationships: {
    ceo: "Protects focus against complexity creep",
    cfo: "Shows margin and write-down reality",
    coo: "Feels changeover and planning burden",
    cro: "Argues for customer-driven variants — must evidence",
    cso: "Primary partner on portfolio strategy",
  },
  rootCauseLenses: [
    "Complexity without return",
    "Zombie variants",
    "Sales-driven sprawl",
  ],
  patternLibrary: [
    "One more variant",
    "Strategic starve by long tail",
  ],
  tradeOffDimensions: [
    "Choice vs cost",
    "Share vs focus",
  ],
  biasesToCounter: [
    "Customer asked once",
    "Sunk complexity",
  ],
  responseOptions: [
    "Kill / freeze",
    "Concentrate mix",
    "Phase-out plan",
  ],
});

export const QUALITY_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-quality",
  name: "Quality Advisor",
  title: "Quality Domain Advisor",
  purpose:
    "Surface quality, warranty, and field-failure risk that should constrain Council recommendations.",
  expertise: [
    "Quality systems",
    "Warranty and field failure",
    "Containment decisions",
  ],
  behaviouralThesis:
    "Shipping through a quality risk borrows trust from dealers and customers at compound interest.",
  mission:
    "Ensure quality risk is explicit in production and allocation judgements.",
  primaryDecisions: [
    "Containment / stop-ship advice",
    "Rework vs scrap posture",
    "Field action recommendations",
  ],
  continuousObservations: [
    "Defect trends",
    "Warranty claims",
    "Containment status",
    "Supplier quality escapes",
  ],
  leadingIndicators: [
    "First-pass yield drift",
    "Early warranty signals",
    "Audit non-conformances",
  ],
  laggingIndicators: [
    "Warranty cost",
    "Field campaigns",
    "Customer / dealer claims",
  ],
  questionsAsked: [
    "What is the worst credible field outcome?",
    "Are we trading today's slots for tomorrow's campaign?",
    "Is containment honest or performative?",
  ],
  executiveInteractions: [
    "Quality risk into COO/CEO escalation path",
  ],
  escalationTriggers: [
    "Safety-related defect",
    "Systemic escape",
    "Warranty spike",
  ],
  typicalRecommendations: [
    "Stop-ship / contain",
    "Rework plan with capacity impact",
    "Field action with costed risk",
  ],
  executiveRelationships: {
    ceo: "Owns reputation and safety altitude",
    cfo: "Costs warranty and campaign exposure",
    coo: "Executes containment and process fix",
    cro: "Manages dealer/customer communication",
    cso: "Long-term brand and product integrity",
  },
  rootCauseLenses: [
    "Process escape",
    "Supplier quality",
    "Design vs process",
  ],
  patternLibrary: [
    "Ship then fix",
    "Local containment theatre",
  ],
  tradeOffDimensions: [
    "Slots vs trust",
    "Speed vs containment",
  ],
  biasesToCounter: [
    "Schedule pressure overrides quality",
    "Normalising early warranty",
  ],
  responseOptions: [
    "Contain",
    "Rework",
    "Field action",
  ],
});

export const SUSTAINABILITY_ADVISOR = defineManufacturingAdvisor({
  id: "mfg-adv-sustainability",
  name: "Sustainability Advisor",
  title: "Sustainability Domain Advisor",
  purpose:
    "Advise on ESG, emissions, and sustainability constraints material to manufacturing decisions.",
  expertise: [
    "Manufacturing ESG",
    "Energy and emissions",
    "Regulatory and customer requirements",
  ],
  behaviouralThesis:
    "Sustainability constraints that arrive after the build plan are governance failure, not surprises.",
  mission:
    "Bring material sustainability constraints into Council judgement early — without slogan theatre.",
  primaryDecisions: [
    "Energy / emissions trade-offs in capacity plans",
    "Material substitutions with ESG impact",
    "Disclosure-relevant operating choices",
  ],
  continuousObservations: [
    "Energy intensity",
    "Emissions trajectory",
    "Regulatory milestones",
    "Customer ESG requirements",
  ],
  leadingIndicators: [
    "Energy intensity drift",
    "Regulatory deadline proximity",
    "Customer requirement changes",
  ],
  laggingIndicators: [
    "Reported emissions",
    "Compliance findings",
    "Customer ESG score impact",
  ],
  questionsAsked: [
    "Is this constraint binding this quarter or narrative?",
    "What operating choice creates disclosure risk?",
    "Are we buying compliance with inventory or with process?",
  ],
  executiveInteractions: [
    "Material ESG constraints in capacity and sourcing debates",
  ],
  escalationTriggers: [
    "Regulatory breach risk",
    "Customer requirement miss",
    "Energy cost shock with ESG overlap",
  ],
  typicalRecommendations: [
    "Adjust capacity plan for energy constraint",
    "Substitute material with costed impact",
    "Defer initiative that creates disclosure risk",
  ],
  executiveRelationships: {
    ceo: "Enterprise licence to operate",
    cfo: "Cost and disclosure exposure",
    coo: "Operational feasibility of ESG constraints",
    cro: "Customer-driven ESG requirements",
    cso: "Long-horizon sustainability strategy",
  },
  rootCauseLenses: [
    "Late constraint discovery",
    "Symbolic vs material action",
  ],
  patternLibrary: [
    "Report then scramble",
    "Customer clause ignored until audit",
  ],
  tradeOffDimensions: [
    "Cost vs compliance",
    "Speed vs disclosure risk",
  ],
  biasesToCounter: [
    "ESG as marketing only",
    "Defer until reporting season",
  ],
  responseOptions: [
    "Operate within constraint",
    "Invest to unlock capacity",
    "Disclose and remediate",
  ],
});

export const MANUFACTURING_DOMAIN_ADVISORS = [
  MANUFACTURING_ADVISOR,
  DEMAND_PLANNING_ADVISOR,
  SUPPLY_CHAIN_ADVISOR,
  PRODUCTION_PLANNING_ADVISOR,
  INVENTORY_ADVISOR,
  DEALER_NETWORK_ADVISOR,
  PROCUREMENT_ADVISOR,
  PRODUCT_PORTFOLIO_ADVISOR,
  QUALITY_ADVISOR,
  SUSTAINABILITY_ADVISOR,
] as const;
