"use client";

import { useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import type { GTMResponse } from "@/lib/agent";

type FormState = {
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

const defaultState: FormState = {
  productName: "",
  productSummary: "",
  audience: "",
  problem: "",
  differentiation: "",
  pricing: "",
  brandVoice: "Confident, strategic",
  primaryGoal: "Generate qualified pipeline",
  successMetric: "50 SQLs in 90 days",
  launchHorizon: "90-day orchestrated launch",
};

const voicePresets = [
  "Confident, strategic",
  "Bold, visionary",
  "Analytical, data-forward",
  "Friendly, community-driven",
];

const horizonPresets = [
  "30-day lightning launch",
  "60-day layered rollout",
  "90-day orchestrated launch",
  "6-month enterprise motion",
];

export function AgentWorkspace() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GTMResponse | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return !form.productName.trim() || !form.productSummary.trim() || loading;
  }, [form.productName, form.productSummary, loading]);

  const handleChange = useCallback(
    (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body?.message ?? "Failed to generate plan.");
        }

        const data = (await response.json()) as GTMResponse;
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <span className="pill" data-tone="success">
            Agentic GTM
          </span>
          Go To Market AI Orchestrator
        </div>
        <p>
          Feed your product context and objectives — the agent synthesizes persona insights,
          narrative pillars, channel motions, and launch experiments so your AI product reaches
          market with precision.
        </p>
        <div className="pill" data-tone="warning">
          Crafted for AI-first products breaking into market
        </div>
      </header>

      <form className="grid" onSubmit={handleSubmit}>
        <section className="panel">
          <h2>Product Signal Intake</h2>
          <div className="input-grid">
            <div className="field">
              <label htmlFor="product-name">Product Name</label>
              <input
                id="product-name"
                placeholder="OrbitOps Agent Studio"
                value={form.productName}
                onChange={handleChange("productName")}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="brand-voice">Brand Voice</label>
              <select
                id="brand-voice"
                value={form.brandVoice}
                onChange={handleChange("brandVoice")}
              >
                {voicePresets.map((voice) => (
                  <option key={voice}>{voice}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="launch-horizon">Launch Horizon</label>
              <select
                id="launch-horizon"
                value={form.launchHorizon}
                onChange={handleChange("launchHorizon")}
              >
                {horizonPresets.map((horizon) => (
                  <option key={horizon}>{horizon}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pricing">Pricing Motion</label>
              <input
                id="pricing"
                placeholder="Usage-based with premium orchestration tier"
                value={form.pricing}
                onChange={handleChange("pricing")}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="product-summary">Product Summary</label>
            <textarea
              id="product-summary"
              placeholder="Summarize the core promise of the agentic workflow..."
              value={form.productSummary}
              onChange={handleChange("productSummary")}
              required
            />
          </div>
        </section>

        <section className="panel">
          <h2>Market Context</h2>
          <div className="input-grid">
            <div className="field">
              <label htmlFor="audience">Target Audience</label>
              <textarea
                id="audience"
                placeholder="AI product leads at Series B+ SaaS companies..."
                value={form.audience}
                onChange={handleChange("audience")}
              />
            </div>
            <div className="field">
              <label htmlFor="problem">Problem You&apos;re Solving</label>
              <textarea
                id="problem"
                placeholder="Fragmented AI experimentation with no GTM alignment..."
                value={form.problem}
                onChange={handleChange("problem")}
              />
            </div>
            <div className="field">
              <label htmlFor="differentiation">Why You Win</label>
              <textarea
                id="differentiation"
                placeholder="Scenario engine fusing product telemetry with CRM + marketing data..."
                value={form.differentiation}
                onChange={handleChange("differentiation")}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Launch Objectives</h2>
          <div className="input-grid">
            <div className="field">
              <label htmlFor="primary-goal">Primary Goal</label>
              <input
                id="primary-goal"
                placeholder="Generate qualified pipeline"
                value={form.primaryGoal}
                onChange={handleChange("primaryGoal")}
              />
            </div>
            <div className="field">
              <label htmlFor="success-metric">North Star Metric</label>
              <input
                id="success-metric"
                placeholder="50 SQLs in 90 days"
                value={form.successMetric}
                onChange={handleChange("successMetric")}
              />
            </div>
          </div>
          <button
            className={clsx("primary-button", loading && "is-loading")}
            type="submit"
            disabled={isSubmitDisabled}
          >
            {loading ? "Synthesizing GTM System..." : "Generate GTM System"}
          </button>
          {error ? <span className="pill" data-tone="warning">{error}</span> : null}
        </section>
      </form>

      {result ? <AgentResults data={result} /> : null}
    </div>
  );
}

function AgentResults({ data }: { data: GTMResponse }) {
  return (
    <section className="panel" style={{ marginTop: "2.5rem" }}>
      <h2>Agent Blueprint</h2>
      <div className="results-grid">
        <div className="insight-block">
          <span className="subheading">Executive summary</span>
          <p>{data.executiveSummary}</p>
        </div>

        <div className="matrix">
          <span className="subheading">Launch phases</span>
          {data.launchPhases.map((phase) => (
            <div className="matrix-row" key={phase.name}>
              <div className="pill">{phase.duration}</div>
              <h3>{phase.name}</h3>
              <p>{phase.focus}</p>
              <div className="tag-cloud">
                {phase.primaryPlays.map((play) => (
                  <span key={play}>{play}</span>
                ))}
              </div>
              <ul className="list">
                {phase.proofPoints.map((proof) => (
                  <li key={proof}>{proof}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="matrix">
          <span className="subheading">Persona intelligence</span>
          {data.personaInsights.map((persona) => (
            <div className="matrix-row" key={persona.persona}>
              <h3>{persona.persona}</h3>
              <div>
                <span className="subheading">Core needs</span>
                <ul className="list">
                  {persona.coreNeeds.map((need) => (
                    <li key={need}>{need}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="subheading">Adoption triggers</span>
                <ul className="list">
                  {persona.adoptionTriggers.map((trigger) => (
                    <li key={trigger}>{trigger}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="subheading">Objection armor</span>
                <ul className="list">
                  {persona.objections.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="matrix">
          <span className="subheading">Messaging pillars</span>
          {data.messagingPillars.map((pillar) => (
            <div className="matrix-row" key={pillar.pillar}>
              <h3>{pillar.pillar}</h3>
              <p>{pillar.narrative}</p>
              <div>
                <span className="subheading">Content angles</span>
                <ul className="list">
                  {pillar.contentAngles.map((angle) => (
                    <li key={angle}>{angle}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="subheading">Proof assets</span>
                <ul className="list">
                  {pillar.proofAssets.map((asset) => (
                    <li key={asset}>{asset}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="matrix">
          <span className="subheading">Channel orchestration</span>
          {data.channelStrategy.map((channel) => (
            <div className="matrix-row" key={channel.channel}>
              <div className="pill">{channel.channel}</div>
              <p>{channel.role}</p>
              <div>
                <span className="subheading">Cadence</span>
                <ul className="list">
                  {channel.cadences.map((cadence) => (
                    <li key={cadence}>{cadence}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="subheading">KPIs</span>
                <ul className="list">
                  {channel.kpis.map((kpi) => (
                    <li key={kpi}>{kpi}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="matrix">
          <span className="subheading">Growth experiments</span>
          {data.growthExperiments.map((experiment) => (
            <div className="matrix-row" key={experiment.title}>
              <div className="pill">{experiment.title}</div>
              <p>{experiment.hypothesis}</p>
              <div>
                <span className="subheading">Playbook</span>
                <ul className="list">
                  {experiment.playbook.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="subheading">Measure</span>
                <p>{experiment.measure}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="matrix">
          <span className="subheading">Measurement architecture</span>
          <div className="metric-grid">
            {data.measurementFramework.map((metric) => (
              <div className="metric-card" key={metric.metric}>
                <span>{metric.metric}</span>
                <strong>{metric.target}</strong>
                <p>{metric.instrumentation}</p>
                <span>Cadence · {metric.cadence}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
