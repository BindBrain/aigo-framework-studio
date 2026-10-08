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
};

export default function EvaluationPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evaluationPurpose, setEvaluationPurpose] = useState("");
  const [governanceContext, setGovernanceContext] = useState("");
  const [evaluationScope, setEvaluationScope] = useState("");
  const [evaluationTrigger, setEvaluationTrigger] = useState("initial_assessment");
  const [reassessmentRequired, setReassessmentRequired] = useState(false);
  const [reassessmentTrigger, setReassessmentTrigger] = useState("");
  const [nextAssessmentDate, setNextAssessmentDate] = useState("");
  const [reassessmentFrequency, setReassessmentFrequency] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");
  const [reviewOwner, setReviewOwner] = useState("");
  const [triggeredReviewCriteria, setTriggeredReviewCriteria] = useState("");
  const [saved, setSaved] = useState(false);
  const [evaluationExists, setEvaluationExists] = useState(false);
  const [reassessmentSaved, setReassessmentSaved] = useState(false);
  const [reassessmentExists, setReassessmentExists] = useState(false);
  const [rules, setRules] = useState<
    {
      id: string;
      name: string;
      description?: string | null;
      source?: string | null;
      applicability?: string | null;
    }[]
  >([]);
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleSource, setRuleSource] = useState("");
  const [ruleApplicability, setRuleApplicability] = useState("");
  const [rulesSaved, setRulesSaved] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [ruleResults, setRuleResults] = useState<
    {
      rule_id: string;
      status: "PASS" | "FAIL" | "NOT_APPLICABLE";
      notes?: string | null;
    }[]
  >([]);
  const [resultRuleId, setResultRuleId] = useState("");
  const [resultStatus, setResultStatus] = useState<
    "PASS" | "FAIL" | "NOT_APPLICABLE"
  >("PASS");
  const [resultNotes, setResultNotes] = useState("");
  const [resultsSaved, setResultsSaved] = useState(false);
  const [historyRuleId, setHistoryRuleId] = useState<string | null>(null);
  const [ruleHistory, setRuleHistory] = useState<
    {
      id: string;
      rule_id: string;
      status: "PASS" | "FAIL" | "NOT_APPLICABLE";
      notes?: string | null;
      created_at: string;
    }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function openRuleHistory(ruleId: string) {
    setHistoryRuleId(ruleId);
    setHistoryLoading(true);
    try {
      const response = await fetch(
        `/api/ai-systems/${id}/rule-results/${ruleId}/history`,
      );
      if (!response.ok) {
        throw new Error("Failed to load rule result history.");
      }
      const data = await response.json();
      setRuleHistory(data.history ?? []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load rule result history.");
      setRuleHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function saveEvaluationRequest() {
    setError("");

    try {
      const response = await fetch(
        `/api/ai-systems/${id}/evaluation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "evaluation_request",
            evaluation_purpose: evaluationPurpose || null,
            governance_context: governanceContext || null,
            evaluation_scope: evaluationScope || null,
            evaluation_trigger: evaluationTrigger,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save evaluation request.");
      }

      setSaved(true);
      setEvaluationExists(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save evaluation request."
      );
    }
  }
  async function saveGovernanceRule() {
    setError("");
    setRulesSaved(false);

    if (!ruleName.trim()) {
      setError("Rule name is required.");
      return;
    }

    const rule = {
      id: editingRuleId || crypto.randomUUID(),
      name: ruleName.trim(),
      description: ruleDescription.trim() || null,
      source: ruleSource.trim() || null,
      applicability: ruleApplicability.trim() || null,
    };

    const updatedRules = editingRuleId
      ? rules.map((item) => (item.id === editingRuleId ? rule : item))
      : [...rules, rule];

    try {
      const response = await fetch(
        `/api/ai-systems/${id}/rules`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rules: updatedRules,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save governance rule.");
      }

      const data = await response.json();
setRules(data.rules || data.value || []);
      setRuleName("");
      setRuleDescription("");
      setRuleSource("");
      setRuleApplicability("");
      setEditingRuleId(null);
      setRulesSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save governance rule."
      );
    }
  }

  async function deleteGovernanceRule(ruleId: string) {
    setError("");

    const updatedRules = rules.filter((rule) => rule.id !== ruleId);

    try {
      const response = await fetch(
        `/api/ai-systems/${id}/rules`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rules: updatedRules,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete governance rule.");
      }

      const data = await response.json();
setRules(data.rules || data.value || []);

      if (editingRuleId === ruleId) {
        setEditingRuleId(null);
        setRuleName("");
        setRuleDescription("");
        setRuleSource("");
        setRuleApplicability("");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete governance rule."
      );
    }
  }
  async function loadGovernanceRules() {
    try {
      const response = await fetch(
        `/api/ai-systems/${id}/rules`
      );

      if (!response.ok) {
        throw new Error("Unable to load governance rules.");
      }

      const data = await response.json();
setRules(Array.isArray(data) ? data : data.rules || data.value || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load governance rules."
      );
    }
  }
  async function loadEvaluationRequest() {
    try {
      const response = await fetch(
        `/api/ai-systems/${id}/evaluation`
      );

      if (!response.ok) {
        throw new Error("Unable to load evaluation request.");
      }

      const evaluation = await response.json();

      setEvaluationPurpose(evaluation.evaluation_purpose || "");
      setGovernanceContext(evaluation.governance_context || "");
      setEvaluationScope(evaluation.evaluation_scope || "");
      setEvaluationTrigger(
        evaluation.evaluation_trigger || "initial_assessment"
      );

      setEvaluationExists(Boolean(
        evaluation.evaluation_purpose ||
        evaluation.governance_context ||
        evaluation.evaluation_scope
      ));

      const reassessment = evaluation.reassessment;
      setReassessmentExists(Boolean(reassessment));
      setReassessmentSaved(Boolean(reassessment));
      if (reassessment) {
        setReassessmentRequired(Boolean(reassessment.required));
        setReassessmentTrigger(reassessment.trigger || "");
        setNextAssessmentDate(reassessment.nextAssessmentDate || "");
        setReassessmentFrequency(reassessment.frequency || "");
        setNextReviewDate(reassessment.nextReviewDate || "");
        setReviewOwner(reassessment.reviewOwner?.role || "");
        setTriggeredReviewCriteria(
          Array.isArray(reassessment.triggeredReviewCriteria)
            ? reassessment.triggeredReviewCriteria.join("\n")
            : ""
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load evaluation request."
      );
    }
  }
  const saveReassessment = async () => {
    setError("");
    try {
      const response = await fetch(`/api/ai-systems/${id}/evaluation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "reassessment",
          reassessment: {
            required: reassessmentRequired,
            trigger: reassessmentTrigger || null,
            assessmentId: null,
            nextAssessmentDate: nextAssessmentDate || null,
            frequency: reassessmentFrequency || null,
            nextReviewDate: nextReviewDate || null,
            reviewOwner: reviewOwner.trim() ? { role: reviewOwner.trim() } : null,
            triggeredReviewCriteria: triggeredReviewCriteria.split("\n").map((item) => item.trim()).filter(Boolean),
          },
        }),
      });
      if (!response.ok) throw new Error("Unable to save reassessment.");
      setReassessmentSaved(true);
      setReassessmentExists(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save reassessment.");
    }
  };
  const saveRuleResult = async () => {
    if (!resultRuleId) {
      return;
    }

    const existing = ruleResults.filter(
      (result) => result.rule_id !== resultRuleId,
    );

    const updated = [
      ...existing,
      {
        rule_id: resultRuleId,
        status: resultStatus,
        notes: resultNotes || null,
      },
    ];

    const response = await fetch(
      `/api/ai-systems/${id}/rule-results`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          results: updated,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save rule result.");
    }

    const data = await response.json();
    setRuleResults(data.results ?? []);
    setResultsSaved(true);
  };
  const deleteRuleResult = async (ruleId: string) => {
    setError("");
    try {
      const response = await fetch(
        `/api/ai-systems/${id}/rule-results/${ruleId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error("Unable to delete rule result.");
      }
      const data = await response.json();
      setRuleResults(data.results ?? []);
      if (resultRuleId === ruleId) {
        setResultRuleId("");
        setResultStatus("PASS");
        setResultNotes("");
      }
      setResultsSaved(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete rule result.",
      );
    }
  };

  const loadRuleResults = async () => {
    const response = await fetch(
      `/api/ai-systems/${id}/rule-results`,
    );

    if (!response.ok) {
      throw new Error("Failed to load rule results.");
    }

    const data = await response.json();
    setRuleResults(data.results ?? []);
  };
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
        setError(
          err instanceof Error ? err.message : "Unable to load AI system."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSystem();
    loadRuleResults();
    loadEvaluationRequest();
    loadGovernanceRules();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-[#737b87]">
            Loading evaluation workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!system) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link
            href={`/ai-systems/${id}`}
            className="text-sm text-[#626b77] hover:text-[#18202b]"
          >
            &#8592; Back to Governance Workspace
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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href={`/ai-systems/${system.id}`}
          className="text-sm text-[#626b77] hover:text-[#18202b]"
        >
          &#8592; Back to Governance Workspace
        </Link>

        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9299a3]">
            AI System Evaluation
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#18202b]">
                Evaluate {system.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#737b87]">
                Evaluate this AI system against the applicable governance rules,
                controls, requirements, and evidence defined for its governance
                scope.
              </p>
            </div>

            <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-medium capitalize text-[#3e6b4d]">
              {system.lifecycle_status}
            </span>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-base font-semibold text-[#18202b]">
            Evaluation request
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#737b87]">
            Define why the evaluation is being run, what governance context
            applies, and what the evaluation is intended to cover.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[#18202b]">
                Evaluation purpose
              </label>

              <p className="mt-1 text-xs leading-5 text-[#9299a3]">
                Explain the purpose of this evaluation.
              </p>

              <textarea
                value={evaluationPurpose}
                onChange={(event) => setEvaluationPurpose(event.target.value)}
                rows={4}
                disabled={evaluationExists && saved}
                placeholder="e.g. Assess governance readiness before production use."
                className="mt-3 w-full resize-y rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#18202b]">
                Governance context
              </label>

              <p className="mt-1 text-xs leading-5 text-[#9299a3]">
                Describe the classification and governance context for this evaluation.
              </p>

              <textarea
                value={governanceContext}
                onChange={(event) => setGovernanceContext(event.target.value)}
                rows={4}
                disabled={evaluationExists && saved}
                placeholder="e.g. Classified for AI governance and data protection requirements."
                className="mt-3 w-full resize-y rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#18202b]">
                Evaluation scope
              </label>

              <p className="mt-1 text-xs leading-5 text-[#9299a3]">
                Define what aspects of the AI system should be evaluated.
              </p>

              <textarea
                value={evaluationScope}
                onChange={(event) => setEvaluationScope(event.target.value)}
                rows={4}
                disabled={evaluationExists && saved}
                placeholder="e.g. Governance, risk, controls, documentation, and operational use."
                className="mt-3 w-full resize-y rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#18202b]">
                Evaluation trigger
              </label>

              <p className="mt-1 text-xs leading-5 text-[#9299a3]">
                Identify why this evaluation is being initiated.
              </p>
        <select
                value={evaluationTrigger}
                onChange={(event) => setEvaluationTrigger(event.target.value)}
                disabled={evaluationExists && saved}
                className="mt-3 w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#9da5af]"
              >
                <option value="initial_assessment">Initial assessment</option>
                <option value="material_change">Material change</option>
                <option value="periodic_review">Periodic review</option>
                <option value="incident">Governance incident</option>
                <option value="reassessment">Reassessment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#e5e8eb] pt-5">
            {saved ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#3e6b4d]">Evaluation request saved.</span>
                <button type="button" onClick={() => setSaved(false)} className="text-sm font-medium text-[#59636f] hover:text-[#18202b]">Edit</button>
                <button type="button" onClick={async () => { await fetch(`/api/ai-systems/${id}/evaluation`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "evaluation_request", evaluation_purpose: null, governance_context: null, evaluation_scope: null, evaluation_trigger: "initial_assessment" }) }); setEvaluationPurpose(""); setGovernanceContext(""); setEvaluationScope(""); setEvaluationTrigger("initial_assessment"); setSaved(false); setEvaluationExists(false); }} className="text-sm font-medium text-[#a33b3b] hover:text-[#7f2d2d]">Delete</button>
              </div>
            ) : (
              <button type="button" onClick={saveEvaluationRequest} className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#252e3a]">Save Evaluation Request</button>
            )}
          </div>
        </section>
        <section className="mt-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#18202b]">
              Evaluation workspace
            </h2>
            <p className="mt-1 text-sm text-[#737b87]">
              Record the governance conditions, applicable rules, rule results,
              and follow-up required for this evaluation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#e1e5e9] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">Reassessment</h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                Define when this assessment must be revisited because of time,
                change, incidents, or other governance triggers.
              </p>

              <label className="mt-4 flex items-center gap-2 text-sm text-[#59636f]">
                <input
                  type="checkbox"
                  checked={reassessmentRequired}
                  disabled={reassessmentExists && reassessmentSaved}
                  onChange={(event) => setReassessmentRequired(event.target.checked)}
                />
                Reassessment required
              </label>

              {reassessmentRequired && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium text-[#59636f]">
                    Trigger
                    <input
                      value={reassessmentTrigger}
                      disabled={reassessmentExists && reassessmentSaved}
                      onChange={(event) => setReassessmentTrigger(event.target.value)}
                      placeholder="Periodic governance review"
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#59636f]">
                    Frequency
                    <input
                      value={reassessmentFrequency}
                      disabled={reassessmentExists && reassessmentSaved}
                      onChange={(event) => setReassessmentFrequency(event.target.value)}
                      placeholder="ANNUAL"
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#59636f]">
                    Next assessment date
                    <input
                      type="date"
                      value={nextAssessmentDate}
                      disabled={reassessmentExists && reassessmentSaved}
                      onChange={(event) => setNextAssessmentDate(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#59636f]">
                    Review owner
                    <input
                      value={reviewOwner}
                      disabled={reassessmentExists && reassessmentSaved}
                      onChange={(event) => setReviewOwner(event.target.value)}
                      placeholder="Governance Owner"
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#59636f]">
                    Next review date
                    <input
                      type="date"
                      value={nextReviewDate}
                      disabled={reassessmentExists && reassessmentSaved}
                      onChange={(event) => setNextReviewDate(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#59636f] sm:col-span-2">
                    Triggered review criteria
                    <textarea
                      value={triggeredReviewCriteria}
                      disabled={reassessmentExists && reassessmentSaved}
                      onChange={(event) => setTriggeredReviewCriteria(event.target.value)}
                      placeholder={"Material system change\nSignificant incident\nChange in applicable requirements"}
                      rows={4}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                    <span className="mt-1 block text-[11px] font-normal text-[#9299a3]">
                      Enter one trigger per line.
                    </span>
                  </label>
                <div className="mt-5 flex items-center justify-between border-t border-[#e5e8eb] pt-4">
                  {reassessmentSaved ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#3e6b4d]">Reassessment saved.</span>
                      <button type="button" onClick={() => setReassessmentSaved(false)} className="text-sm font-medium text-[#59636f] hover:text-[#18202b]">Edit</button>
                      <button
                        type="button"
                        onClick={async () => {
                          const response = await fetch(`/api/ai-systems/${id}/evaluation`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "reassessment", reassessment: null }) });
                          if (!response.ok) { setError("Unable to delete reassessment."); return; }
                          setReassessmentRequired(false);
                          setReassessmentTrigger("");
                          setNextAssessmentDate("");
                          setReassessmentFrequency("");
                          setNextReviewDate("");
                          setReviewOwner("");
                          setTriggeredReviewCriteria("");
                          setReassessmentSaved(false);
                          setReassessmentExists(false);
                        }}
                        className="text-sm font-medium text-[#a33b3b] hover:text-[#7f2d2d]"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={saveReassessment} className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#252e3a]">Save Reassessment</button>
                  )}
                </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#e1e5e9] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#18202b]">Governance Rules</h3>
                  <p className="mt-2 text-sm leading-6 text-[#737b87]">
                    Define the rules and requirements that apply to this evaluation.
                  </p>
                </div>
                <span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-xs font-medium text-[#626b77]">
                  {rules.length} rule{rules.length === 1 ? "" : "s"}
                </span>
              </div>

              {rules.length === 0 ? (
                <div className="mt-4 rounded-md border border-dashed border-[#d7dce1] bg-[#fafbfc] p-4 text-sm text-[#9299a3]">
                  No governance rules recorded yet.
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {rules.map((rule) => {
                    const expanded = expandedRuleId === rule.id;
                    return (
                      <div key={rule.id} className="rounded-md border border-[#e1e5e9] bg-white">
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedRuleId(expanded ? null : rule.id)}
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <span className="text-xs text-[#737b87]">{expanded ? "▼" : "▶"}</span>
                            <span className="truncate text-sm font-medium text-[#18202b]">{rule.name}</span>
                          </button>
                          <span className="shrink-0 rounded bg-[#f1f3f5] px-2 py-1 font-mono text-[10px] text-[#626b77]">
                            {rule.id}
                          </span>
                        </div>

                        {expanded && (
                          <div className="border-t border-[#e1e5e9] px-4 py-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9299a3]">Description</div>
                                <div className="mt-1 text-sm leading-6 text-[#737b87]">{rule.description || "—"}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9299a3]">Source</div>
                                <div className="mt-1 text-sm leading-6 text-[#737b87]">{rule.source || "—"}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9299a3]">Applicability</div>
                                <div className="mt-1 text-sm leading-6 text-[#737b87]">{rule.applicability || "—"}</div>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2 border-t border-[#e5e8eb] pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRuleId(rule.id);
                                  setRuleName(rule.name);
                                  setRuleDescription(rule.description || "");
                                  setRuleSource(rule.source || "");
                                  setRuleApplicability(rule.applicability || "");
                                  setRulesSaved(false);
                                }}
                                className="rounded border border-[#d7dce1] px-2.5 py-1.5 text-xs font-medium text-[#626b77] hover:bg-[#f7f8fa]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteGovernanceRule(rule.id)}
                                className="rounded border border-[#e1caca] px-2.5 py-1.5 text-xs font-medium text-[#9a4b4b] hover:bg-[#fff7f7]"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 rounded-md border border-[#e1e5e9] bg-[#fafbfc] p-4">
                <h4 className="text-sm font-semibold text-[#18202b]">
                  {editingRuleId ? "Edit governance rule" : "Add governance rule"}
                </h4>

                <div className="mt-3 space-y-3">
                  <input
                    value={ruleName}
                    onChange={(event) => setRuleName(event.target.value)}
                    placeholder="Rule name"
                    className="w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm outline-none focus:border-[#9aa3ae]"
                  />

                  <textarea
                    value={ruleDescription}
                    onChange={(event) => setRuleDescription(event.target.value)}
                    placeholder="Rule description"
                    rows={2}
                    className="w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm outline-none focus:border-[#9aa3ae]"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={ruleSource}
                      onChange={(event) => setRuleSource(event.target.value)}
                      placeholder="Source or framework"
                      className="rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm outline-none focus:border-[#9aa3ae]"
                    />
                    <select
                      value={ruleApplicability}
                      onChange={(event) => setRuleApplicability(event.target.value)}
                      className="rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm outline-none focus:border-[#9aa3ae]"
                    >
                      <option value="">Select applicability</option>
                      <option value="Applicable">Applicable</option>
                      <option value="Not applicable">Not applicable</option>
                      <option value="Partially applicable">Partially applicable</option>
                      <option value="To be determined">To be determined</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {rulesSaved ? (
                      <span className="text-sm text-[#3e6b4d]">
                        Governance rule saved.
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex gap-2">
                      {editingRuleId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRuleId(null);
                            setRuleName("");
                            setRuleDescription("");
                            setRuleSource("");
                            setRuleApplicability("");
                            setRulesSaved(false);
                          }}
                          className="rounded-md border border-[#d7dce1] px-4 py-2 text-sm font-medium text-[#626b77] hover:bg-white"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={saveGovernanceRule}
                        className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#252e3a]"
                      >
                        {editingRuleId ? "Save Changes" : "Add Rule"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#e1e5e9] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">Rule Results</h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                Record the result for each applicable governance rule.
              </p>

              <div className="mt-4 rounded-md border border-[#e1e5e9] bg-[#fafbfc] p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                  <div>
                    <label className="text-xs font-medium text-[#626b77]">
                      Governance rule
                    </label>
                    <select
                      value={resultRuleId}
                      onChange={(event) => {
                        setResultRuleId(event.target.value);
                        setResultsSaved(false);
                        const existing = ruleResults.find(
                          (result) => result.rule_id === event.target.value,
                        );
                        if (existing) {
                          setResultStatus(existing.status);
                          setResultNotes(existing.notes ?? "");
                        } else {
                          setResultStatus("PASS");
                          setResultNotes("");
                        }
                      }}
                      className="mt-1 w-full rounded-md border border-[#d9dee4] bg-white px-3 py-2 text-sm text-[#18202b]"
                    >
                      <option value="">Select a governance rule</option>
                      {rules.map((rule) => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#626b77]">
                      Result
                    </label>
                    <select
                      value={resultStatus}
                      onChange={(event) => {
                        setResultStatus(
                          event.target.value as "PASS" | "FAIL" | "NOT_APPLICABLE",
                        );
                        setResultsSaved(false);
                      }}
                      className="mt-1 w-full rounded-md border border-[#d9dee4] bg-white px-3 py-2 text-sm text-[#18202b]"
                    >
                      <option value="PASS">PASS</option>
                      <option value="FAIL">FAIL</option>
                      <option value="NOT_APPLICABLE">NOT APPLICABLE</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-medium text-[#626b77]">Notes</label>
                  <textarea
                    value={resultNotes}
                    onChange={(event) => {
                      setResultNotes(event.target.value);
                      setResultsSaved(false);
                    }}
                    rows={3}
                    placeholder="Record the basis for this result."
                    className="mt-1 w-full rounded-md border border-[#d9dee4] bg-white px-3 py-2 text-sm text-[#18202b]"
                  />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveRuleResult}
                    disabled={!resultRuleId}
                    className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Save Rule Result
                  </button>
                  {resultsSaved && (
                    <span className="text-xs font-medium text-[#3e6b4d]">
                      Saved to this evaluation.
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {ruleResults.length === 0 ? (
                  <p className="text-sm text-[#9299a3]">No rule results recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {ruleResults.map((result) => {
                      const rule = rules.find((item) => item.id === result.rule_id);
                      return (
                        <div
                          key={result.rule_id}
                          className="rounded-md border border-[#e1e5e9] bg-white px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-sm font-medium text-[#18202b]">
                                {rule?.name ?? result.rule_id}
                              </div>
                              {result.notes && (
                                <div className="mt-1 text-xs leading-5 text-[#737b87]">
                                  {result.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openRuleHistory(result.rule_id)}
                                title="View history"
                                aria-label={`View history for ${rule?.name ?? result.rule_id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d9dee4] text-[#626b77] hover:bg-[#f7f8fa]"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                  <path d="M12 8v5l3 2" />
                                  <circle cx="12" cy="12" r="8" />
                                </svg>
                              </button>
                              <span className="rounded bg-[#f1f3f5] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#626b77]">
                                {result.status}
                              </span>
                              <button type="button" onClick={() => { setResultRuleId(result.rule_id); setResultStatus(result.status); setResultNotes(result.notes ?? ""); setResultsSaved(false); }} className="rounded border border-[#d7dce1] px-2.5 py-1.5 text-xs font-medium text-[#626b77] hover:bg-[#f7f8fa]">
                                Edit
                              </button>
                              <button type="button" onClick={() => deleteRuleResult(result.rule_id)} className="rounded border border-[#e1caca] px-2.5 py-1.5 text-xs font-medium text-[#9a4b4b] hover:bg-[#fff7f7]">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {historyRuleId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#e1e5e9] px-5 py-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#18202b]">Rule Result History</h3>
                      <p className="mt-1 text-xs text-[#737b87]">
                        {rules.find((item) => item.id === historyRuleId)?.name ?? historyRuleId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryRuleId(null);
                        setRuleHistory([]);
                      }}
                      className="rounded-md px-2 py-1 text-lg text-[#737b87] hover:bg-[#f7f8fa]"
                      aria-label="Close history"
                    >
                      ×
                    </button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                    {historyLoading ? (
                      <p className="text-sm text-[#737b87]">Loading history...</p>
                    ) : ruleHistory.length === 0 ? (
                      <p className="text-sm text-[#9299a3]">No history recorded for this rule yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {ruleHistory.map((item) => (
                          <div key={item.id} className="rounded-md border border-[#e1e5e9] bg-[#fafbfc] px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-medium text-[#737b87]">
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                              <span className="rounded bg-[#f1f3f5] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#626b77]">
                                {item.status}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="mt-2 text-sm leading-6 text-[#626b77]">{item.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#e1e5e9] bg-white p-5">
                <h3 className="text-sm font-semibold text-[#18202b]">
                  Review requirements
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#737b87]">
                  Requirements for governance review will be derived from the
                  applicable rules, evaluation results, evidence, and findings.
                </p>
                <div className="mt-4 rounded-md border border-dashed border-[#d7dce1] bg-[#fafbfc] p-4 text-sm text-[#9299a3]">
                  No review requirements identified yet.
                </div>
              </div>

              <div className="rounded-lg border border-[#e1e5e9] bg-white p-5">
                <h3 className="text-sm font-semibold text-[#18202b]">Actions</h3>
                <p className="mt-2 text-sm leading-6 text-[#737b87]">
                  Track remediation or governance actions arising from evaluation results.
                </p>
                <div className="mt-4 rounded-md border border-dashed border-[#d7dce1] bg-[#fafbfc] p-4 text-sm text-[#9299a3]">
                  No actions recorded yet.
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#e1e5e9] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">Governance outcome</h3>
              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                The final governance outcome will aggregate evaluation results,
                evidence, reviews, and actions.
              </p>
              <div className="mt-4 rounded-md bg-[#f1f3f5] p-4 text-sm font-medium text-[#737b87]">
                Not evaluated
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
