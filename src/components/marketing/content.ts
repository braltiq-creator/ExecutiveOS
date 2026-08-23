/**
 * Marketing copy — sourced from docs/commercial/.
 * Do not invent messaging, pricing, or positioning here.
 */

export const SITE = {
  product: "ExecutiveOS",
  company: "Braltiq",
  philosophy: "Confidence Through Clarity",
  category: "Executive Intelligence Platform",
  primaryCta: { label: "Start Free Trial", href: "/start-trial" },
  secondaryCta: { label: "See Pricing", href: "/pricing" },
  enterpriseCta: { label: "Contact Sales", href: "/support#contact" },
} as const;

export const PRICING = {
  individual: {
    name: "Individual Executive",
    price: "AUD $495",
    period: "/ month",
    blurb: "One accountable executive running their operating rhythm.",
  },
  team: {
    name: "Executive Team",
    price: "AUD $1,995",
    period: "/ month",
    blurb: "Leadership team sharing one intelligence environment.",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "Multi-business-unit, residency, security, and expansion needs.",
  },
  trial: "30-day free trial",
  noSetup: "No setup fee",
  noImplementation: "No implementation fee",
  included: "One Executive Intelligence Profile included",
  principle: "Buy Executive Intelligence. Connect systems when you’re ready.",
} as const;

export const TRUST = [
  "30-day free trial",
  "No implementation fee",
  "No setup fee",
  "AI advises. You decide.",
] as const;

export const NAV = [
  { label: "Product", href: "/product" },
  { label: "Profiles", href: "/profiles" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
] as const;

export const HOME = {
  headline: "The operating system for executive decision making",
  subheadline:
    "Know what requires your attention — and why — before your first meeting.",
  categoryTitle: "Executive Intelligence is a new software category",
  categoryBody:
    "Not Business Intelligence with a nicer theme. Not an AI chat window pointed at the enterprise. A proactive intelligence layer — outcome-grounded, explainable, Council-aware — designed exclusively for leadership.",
  promise:
    "You will know what requires your attention — and why — before your first meeting.",
} as const;

export const PRODUCT = {
  headline: "Executive Intelligence, end to end",
  subheadline:
    "From overnight change to prepared judgement — above your systems of record.",
} as const;

export const PROFILES_INDEX = {
  headline: "Choose how you lead",
  subheadline:
    "One Executive Intelligence Profile included. Industry context when you need it.",
} as const;

export const PROFILES = {
  operations: {
    id: "operations" as const,
    name: "Operations Executive",
    href: "/profiles/operations",
    headline: "Clarity for the people who keep the business running",
    subheadline:
      "Capacity, delivery, and operational resilience — ranked for judgement.",
    who: "COO, VP Operations, Head of Delivery, and leaders accountable for keeping the business running.",
    outcomes: [
      "Delivery and capacity ranked against committed outcomes",
      "Operational resilience visible before the first escalation",
      "Shared picture across leadership — without another status meeting",
    ],
    journey:
      "Morning Command Centre → outcomes and delivery tension → decisions with trade-offs → Council with an operational lens → judgement, then you decide.",
    connectorsNote:
      "Systems such as Microsoft 365 or Simpro can enrich context. They are not what you buy.",
  },
  commercial: {
    id: "commercial" as const,
    name: "Commercial Executive",
    href: "/profiles/commercial",
    headline: "Commercial confidence without dashboard fog",
    subheadline:
      "Pipeline truth, commitment quality, and growth judgement.",
    who: "CRO, commercial CFO partners, VP Sales / Revenue, and leaders who own the revenue system.",
    outcomes: [
      "Pipeline integrity and commitment quality for judgement",
      "Forecast confidence that leadership can share",
      "Commercial decisions prepared — not buried in CRM noise",
    ],
    journey:
      "Morning Command Centre → commercial attention → decisions on focus and trade-offs → Council with CRO/CFO tension made explicit → you decide.",
    connectorsNote:
      "Salesforce or Microsoft 365 can deepen evidence. You purchase Commercial Intelligence — not another CRM seat.",
  },
  manufacturing: {
    id: "manufacturing" as const,
    name: "Manufacturing Executive",
    href: "/profiles/manufacturing",
    headline: "Manufacturing judgement — without a custom platform",
    subheadline:
      "Demand, factory planning, inventory, dealers, working capital — via the Manufacturing Intelligence Pack.",
    who: "Industrial / OEM manufacturing leadership — CEO, COO, CFO, plant or business-unit leads with factory, dealer, and capital tension.",
    outcomes: [
      "Factory, inventory, demand, and capital as one judgement surface",
      "Allocation and inventory decisions prepared for leadership",
      "Industry context through a pack — Core platform unchanged",
    ],
    journey:
      "Morning Command Centre → manufacturing attention → allocation and inventory decisions → manufacturing-aware Council → Reality Lab–validated reasoning patterns → you decide.",
    connectorsNote:
      "Dynamics or ERP context can enrich Discovery. ExecutiveOS sits above systems of record — it does not replace them.",
  },
} as const;

export const PRICING_PAGE = {
  headline: "Simple packaging. Serious altitude.",
  subheadline: PRICING.principle,
} as const;

export const SECURITY_PAGE = {
  headline: "Trust is part of the product",
  subheadline:
    "Isolation, explainability, and human authority — designed for executive work.",
} as const;

export const ABOUT_PAGE = {
  headline: "Built for the moment before the decision",
  subheadline:
    "Braltiq builds ExecutiveOS — decision infrastructure for organisations.",
  vision:
    "By the end of the decade, opening ExecutiveOS will feel as essential as opening the calendar — the first ritual of executive leadership: a calm Decision Operating System that recognises strategic intent, ranks what matters against real outcomes, explains stakes before it recommends, and leaves authority where it belongs.",
  mission:
    "Give executives back strategic time by turning organisational complexity into clear, actionable intelligence — so better decisions become more common, not because leaders work harder, but because Confidence Through Clarity becomes the normal condition of leadership work.",
} as const;

export const RESOURCES_PAGE = {
  headline: "Clarity for leaders",
  subheadline: "Essays and guides on Executive Intelligence.",
} as const;

export const SUPPORT_PAGE = {
  headline: "Support",
  subheadline:
    "Knowledge, release notes, and human help when you need it.",
} as const;

export const START_TRIAL_PAGE = {
  headline: "Start your 30-day trial",
  subheadline:
    "Create your account. Choose your Executive Profile. Be in onboarding in minutes.",
} as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Command Centre",
    body: "See what changed overnight and what requires judgement — before the first meeting.",
  },
  {
    step: "02",
    title: "Judgement",
    body: "Outcomes, decisions, and Executive Council perspectives prepare the trade-offs. You decide.",
  },
  {
    step: "03",
    title: "Intelligence Packs",
    body: "Industry context arrives through packs — Manufacturing first — without forking the Core platform.",
  },
] as const;

export const VALUE_PILLARS = [
  {
    title: "Proactive intelligence",
    body: "Command Centre and Executive Brief surface attention — without prompting.",
  },
  {
    title: "Structured judgement",
    body: "Council, Intelligence Models, and the Judgement Framework make stakes explicit.",
  },
  {
    title: "Industry context",
    body: "Intelligence Packs extend the platform. Core stays stable.",
  },
  {
    title: "Executive-grade trust",
    body: "Explainability, isolation, and human authority — by design.",
  },
] as const;

export const ROI_ANCHORS = [
  {
    title: "Hours reclaimed",
    body: "From brief assembly and context switching — measured against Chief of Staff and executive time.",
  },
  {
    title: "Faster decisions",
    body: "Pending decisions resolved with shared context — not re-debated from empty threads.",
  },
  {
    title: "Shared picture",
    body: "Leadership sees the same overnight ranking — not six versions of the truth.",
  },
  {
    title: "Industry-aware Council",
    body: "Role-consistent judgement with pack context — without a custom build.",
  },
] as const;

export const JOURNEY_STEPS = [
  { title: "Understand", body: "Category and promise in one composition." },
  { title: "Choose", body: "An Executive Intelligence Profile that matches how you lead." },
  { title: "Trial", body: "Thirty days. No setup fee. No implementation fee." },
  { title: "Operate", body: "Command Centre becomes the morning ritual." },
] as const;

export const FAQS = [
  {
    q: "What am I buying?",
    a: "Executive Intelligence — one Executive Intelligence Profile included. Integrations are available to connect; they are not the product.",
  },
  {
    q: "Is there a setup or implementation fee?",
    a: "No. No setup fee. No implementation fee.",
  },
  {
    q: "How long is the trial?",
    a: "30 days free. Individual and Executive Team purchase by credit card when you are ready.",
  },
  {
    q: "How is this different from Microsoft Copilot?",
    a: "Copilot assists inside Microsoft 365 documents and mail. ExecutiveOS is the Executive Intelligence Platform above systems of record — proactive priorities, outcomes, and Council judgement for leadership.",
  },
  {
    q: "How is this different from Power BI or dashboards?",
    a: "Measurement is not judgement. Dashboards wait for interpretation. ExecutiveOS ranks what requires attention against outcomes and prepares the decision.",
  },
  {
    q: "Does AI decide for me?",
    a: "No. AI and the Executive Council advise. Authority stays with the human who is accountable.",
  },
  {
    q: "What about Enterprise?",
    a: "Enterprise is custom — multi-business-unit, residency, security, and expansion needs. Contact Sales.",
  },
] as const;

export const BLOG_POSTS = [
  {
    slug: "executive-intelligence-platform",
    title: "What is an Executive Intelligence Platform?",
    excerpt:
      "A category definition: proactive judgement support for leadership — above systems of record.",
    category: "Judgement",
  },
  {
    slug: "morning-before-the-meeting",
    title: "The morning before the meeting",
    excerpt:
      "Why the executive day still begins in fog — and what changes when attention is ranked.",
    category: "Operating rhythm",
  },
  {
    slug: "manufacturing-judgement-without-custom",
    title: "Manufacturing judgement without a custom platform",
    excerpt:
      "How Intelligence Packs bring industry context while the Core stays the Executive Intelligence Platform.",
    category: "Industry",
  },
] as const;
