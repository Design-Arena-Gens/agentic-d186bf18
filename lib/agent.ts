/**
 * Lightweight rule-based "agent" that simulates a go-to-market strategist.
 * The goal is to transform structured inputs into a multi-stage launch plan
 * without relying on external LLM APIs so the experience works out of the box.
 */

export type GTMRequest = {
  productName: string;
  productSummary: string;
  audience: string;
  problem: string;
  differentiation: string;
  pricing: string;
  brandVoice: string;
  primaryGoal: string;
  successMetric: string;
  launchHorizon: string;
};

export type GTMResponse = {
  executiveSummary: string;
  launchPhases: Array<{
    name: string;
    focus: string;
    primaryPlays: string[];
    proofPoints: string[];
    duration: string;
  }>;
  personaInsights: Array<{
    persona: string;
    coreNeeds: string[];
    adoptionTriggers: string[];
    objections: string[];
  }>;
  messagingPillars: Array<{
    pillar: string;
    narrative: string;
    contentAngles: string[];
    proofAssets: string[];
  }>;
  channelStrategy: Array<{
    channel: string;
    role: string;
    cadences: string[];
    kpis: string[];
  }>;
  growthExperiments: Array<{
    title: string;
    hypothesis: string;
    playbook: string[];
    measure: string;
  }>;
  measurementFramework: Array<{
    metric: string;
    target: string;
    instrumentation: string;
    cadence: string;
  }>;
};

const personaArchetypes: Record<
  string,
  { persona: string; needs: string[]; triggers: string[]; objections: string[] }
> = {
  builder: {
    persona: "Hands-on Builder",
    needs: [
      "Rapid experimentation sandbox",
      "Composable APIs with excellent docs",
      "Signals that surface product-market fit faster",
    ],
    triggers: [
      "Dev-first onboarding with minimal friction",
      "Proof of velocity — shipping hours, not weeks",
      "Community where peers share playbooks",
    ],
    objections: [
      "Vendor lock-in or forced workflow changes",
      "Unclear pricing scale for high usage",
      "Slow support response for technical blockers",
    ],
  },
  operator: {
    persona: "Growth Operator",
    needs: [
      "Clarity on ROI and payback period",
      "Confidence in data quality and governance",
      "Frictionless collaboration with GTM teams",
    ],
    triggers: [
      "Success stories with hard revenue numbers",
      "Live dashboards with attribution guardrails",
      "Roadmap stability and SOC2/ISO compliance",
    ],
    objections: [
      "Hidden costs in seats or limits",
      "Unproven integrations into current stack",
      "Concern about AI hallucinations in production",
    ],
  },
  executive: {
    persona: "Strategic Executive",
    needs: [
      "Differentiated POV on market category",
      "Risk mitigation and governance controls",
      "Evidence of defensible moats",
    ],
    triggers: [
      "Executive briefings benchmarking competitors",
      "Vision decks articulating future roadmap",
      "References from marquee customers",
    ],
    objections: [
      "Unclear compliance posture",
      "Limited enterprise support coverage",
      "High switching cost from incumbents",
    ],
  },
};

const channelPlays = [
  {
    channel: "Founders' Narrative",
    role: "Earn trust with a strong POV and demonstrate the vision behind the product.",
    cadences: [
      "Bi-weekly build-in-public threads across LinkedIn + X",
      "Monthly founder letter unpacking roadmap signals",
      "Quarterly AMAs with flagship design partners",
    ],
    kpis: ["Followers growth", "Thought leadership mentions", "Inbound demos"],
  },
  {
    channel: "Product-Led Motion",
    role: "Drive trials and activation through immersive product experiences.",
    cadences: [
      "Interactive demo workspace refreshed every sprint",
      "Onboarding drip sequence tailored to role & use case",
      "In-app nudges calibrated to aha moments & milestones",
    ],
    kpis: ["Signup-to-activation rate", "Time-to-first-value", "Feature adoption"],
  },
  {
    channel: "Category Community",
    role: "Mobilize believers and nurture advocacy loops.",
    cadences: [
      "Weekly synthetic benchmarks distilled from anonymized data",
      "Fortnightly roundtables with lighthouse customers",
      "Slack/Discord crew with office hours from product & GTM leaders",
    ],
    kpis: ["Net promoter score", "Community engagement", "Referral sourced pipeline"],
  },
  {
    channel: "Strategic Alliances",
    role: "Leverage partner ecosystems to tap into qualified demand.",
    cadences: [
      "Co-marketing webinars aligned to partner roadmaps",
      "Solution briefings for partner SEs + AEs",
      "Joint ROI calculators highlighting combined value",
    ],
    kpis: ["Partner influenced ARR", "Partner-sourced opportunities", "Attach rate"],
  },
];

const growthBacklog = [
  {
    title: "Persona-Calibrated Onboarding Concierge",
    hypothesis:
      "If we detect the user's core job-to-be-done during onboarding, we can surface relevant templates and increase activation.",
    playbook: [
      "Create role-specific welcome flows with scripted prompts",
      "Instrument micro-surveys tied to first-session actions",
      "Route to nurture tracks featuring proof tied to persona needs",
    ],
    measure: "Activation rate within first 7 days segmented by persona.",
  },
  {
    title: "Narrative Velocity Series",
    hypothesis:
      "Launching a serialized content program that dramatizes customer wins will increase inbound demo requests.",
    playbook: [
      "Produce monthly hero stories with metrics-oriented infographics",
      "Distribute across LinkedIn, newsletter, and industry communities",
      "Add CTA to book a strategy workshop with solution consultants",
    ],
    measure: "Demo volume, win rate, and sourced ARR from the campaign.",
  },
  {
    title: "AI Pilot Sprint Rooms",
    hypothesis:
      "Facilitated sprints with success blueprints will collapse evaluation cycles for mid-market teams.",
    playbook: [
      "Spin up a Miro/FigJam board capturing sprint agenda and KPIs",
      "Bundle onboarding docs, governance checklist, and ROI calculator",
      "Assign a solutions engineer to co-build the first workflow",
    ],
    measure: "Pilot-to-paid conversion and speed-to-contract.",
  },
];

const measurementMatrix = [
  {
    metric: "Activation Velocity",
    target: "≥ 45% of signups reach aha moment within 72 hours",
    instrumentation: "Product analytics funnel with persona & channel tags",
    cadence: "Reviewed twice weekly with product + growth standup",
  },
  {
    metric: "Pipeline Momentum",
    target: "≥ 30% of SQL pipeline sourced from hero channels",
    instrumentation: "CRM multi-touch attribution dashboard",
    cadence: "Reported weekly to revenue leadership",
  },
  {
    metric: "Expansion Signal",
    target: "≥ 20% accounts adopt 2+ advanced workflows in 60 days",
    instrumentation: "Usage cohort reports & health scoring in CS CRM",
    cadence: "Monthly lifecycle business review",
  },
  {
    metric: "Advocacy Flywheel",
    target: "10 new public testimonials or case studies per quarter",
    instrumentation: "Community tracking sheet + marketing automation tags",
    cadence: "Monthly with marketing leadership",
  },
];

function derivePersonas(audience: string, primaryGoal: string) {
  const matches: typeof personaArchetypes[keyof typeof personaArchetypes][] = [];

  const lowerAudience = audience.toLowerCase();
  const lowerGoal = primaryGoal.toLowerCase();

  if (lowerAudience.includes("founder") || lowerAudience.includes("developer")) {
    matches.push(personaArchetypes.builder);
  }

  if (
    lowerAudience.includes("marketing") ||
    lowerAudience.includes("growth") ||
    lowerGoal.includes("pipeline")
  ) {
    matches.push(personaArchetypes.operator);
  }

  if (
    lowerAudience.includes("executive") ||
    lowerAudience.includes("c-suite") ||
    lowerGoal.includes("enterprise")
  ) {
    matches.push(personaArchetypes.executive);
  }

  if (matches.length === 0) {
    matches.push(personaArchetypes.operator);
  }

  return matches;
}

function craftSummary(payload: GTMRequest) {
  const tone = payload.brandVoice || "authoritative";
  const focus = payload.primaryGoal || "drive adoption";

  return [
    `Launch mission: ${payload.productName} will ${payload.primaryGoal.toLowerCase()}.`,
    `We anchor messaging around the core product promise — ${payload.productSummary}.`,
    `Tone must stay ${tone.toLowerCase()} while dramatizing the problem: ${payload.problem}.`,
    `We lead with proof on how we ${payload.differentiation.toLowerCase()} and reinforce the pricing model (${payload.pricing}).`,
    `Initial focus: orchestrate a ${payload.launchHorizon.toLowerCase()} launch train that blends product-led motions with strategic storytelling.`,
  ].join(" ");
}

function shapeLaunchPhases(payload: GTMRequest) {
  const horizon = payload.launchHorizon.toLowerCase();
  const timeline =
    horizon.includes("30") || horizon.includes("month")
      ? ["Week 0-2", "Week 3-4", "Week 5-8"]
      : horizon.includes("quarter")
        ? ["Month 0-1", "Month 2", "Month 3", "Month 4+"]
        : ["Phase 1", "Phase 2", "Phase 3"];

  const phases = [
    {
      name: "Ignition",
      focus:
        "Pressure-test messaging, mobilize advocates, and orchestrate early storytelling assets.",
      primaryPlays: [
        "Calibrate positioning with lighthouse customers",
        "Ship teaser content + founder narrative threads",
        "Enable revenue teams with objection handling scripts",
      ],
      proofPoints: [
        "Vision deck with future-state architecture",
        "Design partner quotes and usage metrics",
      ],
    },
    {
      name: "Amplify",
      focus:
        "Scale demand generation with product-led growth loops and segment-specific campaigns.",
      primaryPlays: [
        "Automate nurture sequences triggered by product signals",
        "Launch category POV report featuring benchmark data",
        "Activate partners, communities, and paid acquisition pilots",
      ],
      proofPoints: [
        "Interactive ROI calculator tied to persona outcomes",
        "Video walkthroughs showing aha moments",
      ],
    },
    {
      name: "Convert",
      focus:
        "Collapse sales cycles, drive multi-threaded expansions, and reinforce social proof flywheel.",
      primaryPlays: [
        "Offer guided pilot sprints with solution engineers",
        "Publish customer spotlight + quantifiable wins",
        "Deploy executive workshops on AI governance and ROI",
      ],
      proofPoints: [
        "Case studies segmented by industry",
        "Stack diagrams with integration depth",
      ],
    },
  ];

  if (timeline.length > phases.length) {
    phases.push({
      name: "Scale",
      focus:
        "Standardize playbooks, automate renewals, and unlock new monetization levers.",
      primaryPlays: [
        "Launch referral program with usage-based incentives",
        "Spin up user conference or digital summit",
        "Roll out roadmap updates with customer advisory boards",
      ],
      proofPoints: [
        "Land & expand dashboard with cohort analysis",
        "Public roadmap + changelog momentum",
      ],
    });
  }

  return phases.map((phase, index) => ({
    ...phase,
    duration: timeline[index] ?? timeline.at(-1)!,
  }));
}

function tailorMessaging(payload: GTMRequest, personas: ReturnType<typeof derivePersonas>) {
  const positioning = payload.differentiation.toLowerCase();
  const problem = payload.problem.toLowerCase();

  const basePillars = [
    {
      pillar: "Operational Precision",
      narrative: `Automate the manual grind behind ${problem} with orchestrated AI workflows.`,
      contentAngles: [
        "Before/after narratives illustrating time saved",
        "Deep dives on automation safeguards and governance",
        "Interactive dashboards revealing hidden bottlenecks",
      ],
      proofAssets: [
        "Workflow teardown webinar",
        "Usage dashboards with leading indicators",
        "Checklist on AI guardrails and controls",
      ],
    },
    {
      pillar: "Revenue Impact",
      narrative: `Translate ${payload.productName}'s intelligence into measurable revenue outcomes.`,
      contentAngles: [
        "ROI case studies segmented by vertical",
        "Benchmarks sourced from aggregated product data",
        "Tools that forecast impact on core KPIs",
      ],
      proofAssets: [
        "Outcome calculator with persona presets",
        "Slide library with quantifiable wins",
        "Customer testimonials with hard metrics",
      ],
    },
    {
      pillar: "Differentiated Advantage",
      narrative: `Show how we ${positioning} so customers stay ahead of rivals.`,
      contentAngles: [
        "Competitive teardown with objection counters",
        "Visionary roadmap articulating defensibility",
        "Partner stories illustrating ecosystem fit",
      ],
      proofAssets: [
        "Comparison matrix with feature depth",
        "Executive briefing on category POV",
        "Joint announcements with strategic partners",
      ],
    },
  ];

  if (personas.some((p) => p.persona === "Hands-on Builder")) {
    basePillars.push({
      pillar: "Builder Velocity",
      narrative: "Empower builders to ship AI workflows safely, fast.",
      contentAngles: [
        "Stack diagrams explaining architecture choices",
        "Build-in-public showcases of rapid iteration",
        "Technical AMAs featuring product engineering",
      ],
      proofAssets: [
        "Starter kits & templates library",
        "Reference implementations in GitHub",
        "Latency and uptime dashboards",
      ],
    });
  }

  return basePillars;
}

function adaptChannelStrategy(primaryGoal: string) {
  const goal = primaryGoal.toLowerCase();

  return channelPlays
    .map((channel) => {
      if (goal.includes("pipeline") || goal.includes("revenue")) {
        if (channel.channel === "Strategic Alliances") {
          return {
            ...channel,
            role: `${channel.role} Prioritize co-selling motions for revenue acceleration.`,
          };
        }
      }
      if (goal.includes("adoption") || goal.includes("activation")) {
        if (channel.channel === "Product-Led Motion") {
          return {
            ...channel,
            role: `${channel.role} Double down on aha moments and guided onboarding.`,
          };
        }
      }
      return channel;
    })
    .slice(0, 4);
}

export function runGoToMarketAgent(payload: GTMRequest): GTMResponse {
  const personas = derivePersonas(payload.audience, payload.primaryGoal);

  return {
    executiveSummary: craftSummary(payload),
    launchPhases: shapeLaunchPhases(payload),
    personaInsights: personas.map((p) => ({
      persona: p.persona,
      coreNeeds: p.needs,
      adoptionTriggers: p.triggers,
      objections: p.objections,
    })),
    messagingPillars: tailorMessaging(payload, personas),
    channelStrategy: adaptChannelStrategy(payload.primaryGoal),
    growthExperiments: growthBacklog,
    measurementFramework: measurementMatrix,
  };
}
