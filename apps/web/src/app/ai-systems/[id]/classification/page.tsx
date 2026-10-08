"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type AISystem = {
  id: string;
  name: string;
  purpose: string;
  owner: string;
  provider?: string | null;
  model?: string | null;
  lifecycle_status: string;
  governance_context?: string | null;
};

export default function ClassificationPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicableDomains, setApplicableDomains] = useState("");
  const [requirements, setRequirements] = useState("");
  const [riskConsiderations, setRiskConsiderations] = useState("");
  const [evaluationScope, setEvaluationScope] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assessmentOutcome, setAssessmentOutcome] = useState("NOT_ASSESSED");
  const [assessmentSummary, setAssessmentSummary] = useState("");
  const [assessmentRationale, setAssessmentRationale] = useState("");

  useEffect(() => {
    async function loadSystem() {
      try {
        const response = await fetch("/api/ai-systems");

        if (!response.ok) {
          throw new Error("Unable to load AI systems.");
        }

        const systems: AISystem[] = await response.json();
        const match = systems.find((item) => item.id === id);

        if (!match) {
          throw new Error("AI system not found.");
        }

        setSystem(match);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load AI system.");
      } finally {
        setLoading(false);
      }
    }

    async function loadClassification() {
      try {
        const response = await fetch(`/api/ai-systems/${id}/classification`);

        if (!response.ok) {
          throw new Error("Unable to load classification.");
        }

        const classification = await response.json();
        setApplicableDomains(classification.applicable_domains.join(", "));
        setRequirements(classification.requirements.join(", "));
        setRiskConsiderations(classification.risk_considerations || "");
        setEvaluationScope(classification.evaluation_scope || "");
        setAssessmentOutcome(classification.assessmentResult?.outcome || "NOT_ASSESSED");
        setAssessmentSummary(classification.assessmentResult?.summary || "");
        setAssessmentRationale(classification.assessmentResult?.rationale || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load classification.");
      }
    }

    loadSystem();
    loadClassification();
  }, [id]);

  async function saveClassification() {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(`/api/ai-systems/${id}/classification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DRAFT",
          assessmentType: "CLASSIFICATION",
          objectVersion: "0.1",
          schemaVersion: "0.1",
          subject: {
            aiSystemId: id,
            objectType: "AI_SYSTEM",
            objectId: id,
          },
          scope: {
            description:
              evaluationScope ||
              "Classification assessment for the registered AI system.",
            jurisdictions: [],
            lifecycleStages: [],
          },
          criteria: [
            ...applicableDomains
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item, index) => ({
                criterionId: `domain-${index + 1}`,
                source: "AIGO Framework",
                description: item,
                mandatory: false,
              })),
            ...requirements
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item, index) => ({
                criterionId: `requirement-${index + 1}`,
                source: "AIGO Framework",
                description: item,
                mandatory: true,
              })),
            ...(riskConsiderations
              ? [
                  {
                    criterionId: "risk-considerations",
                    source: "AIGO Framework",
                    description: riskConsiderations,
                    mandatory: false,
                  },
                ]
              : []),
          ],
          assessmentResult: {
            outcome: "NOT_ASSESSED",
            summary: null,
            rationale: null,
          },
          applicable_domains: applicableDomains
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          requirements: requirements
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          risk_considerations: riskConsiderations || null,
          evaluation_scope: evaluationScope || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save classification.");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save classification.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm text-[#737b87]">Loading classification workspace...</p>
        </div>
      </main>
    );
  }

  if (error || !system) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link
            href="/ai-systems"
            className="text-sm text-[#626b77] hover:text-[#18202b]"
          >
            ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Back to AI Systems
          </Link>

          <div className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-8">
            <h1 className="text-xl font-semibold text-[#18202b]">
              AI system not found
            </h1>
            <p className="mt-2 text-sm text-[#737b87]">
              {error || "The requested AI system could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href={`/ai-systems/${system.id}`}
          className="text-sm text-[#626b77] hover:text-[#18202b]"
        >
          ← Back to Governance Workspace
        </Link>

        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9299a3]">
            Classification
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#18202b]">
            Classify {system.name}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#737b87]">
            Establish the governance scope for this AI system by identifying
            applicable domains, requirements, risk considerations, and the
            evaluation scope that should apply.
          </p>
        </div>

        <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#edf0f2] pb-5">
            <div>
              <h2 className="text-base font-semibold text-[#18202b]">
                System context
              </h2>
              <p className="mt-1 text-sm text-[#737b87]">
                Information currently available from registration.
              </p>
            </div>

            <span className="rounded-full bg-[#f1f3f5] px-3 py-1 text-xs font-medium capitalize text-[#626b77]">
              {system.lifecycle_status}
            </span>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Purpose
              </div>
              <p className="mt-2 text-sm leading-6 text-[#3f4752]">
                {system.purpose}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Owner
              </div>
              <p className="mt-2 text-sm text-[#3f4752]">{system.owner}</p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Provider
              </div>
              <p className="mt-2 text-sm text-[#3f4752]">
                {system.provider || "Not specified"}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Model
              </div>
              <p className="mt-2 text-sm text-[#3f4752]">
                {system.model || "Not specified"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-base font-semibold text-[#18202b]">
            Governance scope
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#737b87]">
            These classification areas will define what governance applies to
            the system. The underlying schema and persistence model will be
            added after the classification model is established.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-[#e5e8eb] bg-[#fafbfc] p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">
                Applicable domains
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                Identify the AIGO governance domains relevant to this system.
              </p>
              <input
                value={applicableDomains}
                onChange={(event) => setApplicableDomains(event.target.value)}
                placeholder="e.g. AI Governance, Data Protection"
                className="mt-4 w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
              <p className="mt-2 text-xs text-[#9299a3]">
                Separate multiple domains with commas.
              </p>
            </div>

            <div className="rounded-md border border-[#e5e8eb] bg-[#fafbfc] p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">
                Requirements
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                Identify requirements that apply based on the system context.
              </p>
              <input
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
                placeholder="e.g. Human Oversight, Documentation"
                className="mt-4 w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
              <p className="mt-2 text-xs text-[#9299a3]">
                Separate multiple requirements with commas.
              </p>
            </div>

            <div className="rounded-md border border-[#e5e8eb] bg-[#fafbfc] p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">
                Risk considerations
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                Identify factors that may affect the governance and evaluation scope.
              </p>
              <textarea
                value={riskConsiderations}
                onChange={(event) => setRiskConsiderations(event.target.value)}
                rows={5}
                placeholder="Describe relevant risk considerations."
                className="mt-4 w-full resize-y rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
            </div>

            <div className="rounded-md border border-[#e5e8eb] bg-[#fafbfc] p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">
                Evaluation scope
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                Define what should be evaluated and under which governance rules.
              </p>
              <textarea
                value={evaluationScope}
                onChange={(event) => setEvaluationScope(event.target.value)}
                rows={5}
                placeholder="Describe the evaluation scope."
                className="mt-4 w-full resize-y rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-base font-semibold text-[#18202b]">
            Assessment result
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#737b87]">
            Current outcome recorded for this classification assessment.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Outcome
              </div>
              <p className="mt-2 text-sm font-medium text-[#3f4752]">
                {assessmentOutcome.replaceAll("_", " ")}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Summary
              </div>
              <p className="mt-2 text-sm leading-6 text-[#3f4752]">
                {assessmentSummary || "Not yet assessed."}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                Rationale
              </div>
              <p className="mt-2 text-sm leading-6 text-[#3f4752]">
                {assessmentRationale || "Not yet assessed."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/ai-systems/${system.id}`}
            className="text-sm font-medium text-[#626b77] hover:text-[#18202b]"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-[#3e6b4d]">
                Classification saved.
              </span>
            )}

            <button
              type="button"
              onClick={saveClassification}
              disabled={saving}
              className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Classification"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
