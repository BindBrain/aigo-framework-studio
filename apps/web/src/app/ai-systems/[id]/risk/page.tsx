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

export default function RiskPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [risks, setRisks] = useState<any[]>([]);
  const [riskTitle, setRiskTitle] = useState("");
  const [riskStatement, setRiskStatement] = useState("");
  const [riskOwner, setRiskOwner] = useState("RISK_OWNER");
  const [riskStatus, setRiskStatus] = useState("IDENTIFIED");
  const [riskCategory, setRiskCategory] = useState("");
  const [consequences, setConsequences] = useState("");
  const [potentialHarms, setPotentialHarms] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [assessmentType, setAssessmentType] = useState("INITIAL");
  const [assessmentResult, setAssessmentResult] = useState("NOT_ASSESSED");
  const [likelihood, setLikelihood] = useState("2");
  const [likelihoodLevel, setLikelihoodLevel] = useState("UNLIKELY");
  const [impact, setImpact] = useState("2");
  const [impactLevel, setImpactLevel] = useState("MINOR");
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [riskTreatmentDecision, setRiskTreatmentDecision] = useState("REDUCE");
  const [riskTreatmentObjective, setRiskTreatmentObjective] = useState("");
  const [riskTreatmentRationale, setRiskTreatmentRationale] = useState("");
  const [riskTreatmentStatus, setRiskTreatmentStatus] = useState("PLANNED");
  const [riskAcceptanceRequired, setRiskAcceptanceRequired] = useState(false);
  const [riskAcceptanceId, setRiskAcceptanceId] = useState("");
  const [riskAcceptanceAuthority, setRiskAcceptanceAuthority] = useState("RISK_ACCEPTANCE_AUTHORITY");
  const [riskAcceptanceStatus, setRiskAcceptanceStatus] = useState("NOT_REQUIRED");
  const [riskAcceptanceEffectiveDate, setRiskAcceptanceEffectiveDate] = useState("");
  const [riskAcceptanceExpiryDate, setRiskAcceptanceExpiryDate] = useState("");
  const [riskAcceptanceRationale, setRiskAcceptanceRationale] = useState("");
  const [riskSaved, setRiskSaved] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);

  async function saveRisk() {
    setError("");
    setRiskSaved(false);

    if (!riskTitle.trim() || !riskStatement.trim() || !assessmentId.trim() || !assessmentDate) {
      setError("Risk title, risk statement, assessment ID, and assessment date are required.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/risk${editingRiskId ? `/${editingRiskId}` : ""}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            objectType: "RISK",
            objectVersion: "0.1",
            schemaVersion: "0.1",
            status: riskStatus,
            aiSystemId: id,
            riskTitle: riskTitle.trim(),
            riskStatement: riskStatement.trim(),
            riskOwner: {
              roleType: riskOwner,
            },
            riskAssessment: {
              assessmentId: assessmentId.trim(),
              assessmentDate,
              assessmentType,
              result: assessmentResult,
              evidenceIds: [],
            },
            riskCategory: riskCategory
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            consequences: consequences
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
            potentialHarms: potentialHarms
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
            inherentRisk: {
              likelihood: Number(likelihood),
              likelihoodLevel,
              impact: Number(impact),
              impactLevel,
              score: Number(likelihood) * Number(impact),
              level: riskLevel,
              method: "Initial qualitative assessment",
              rationale: "Recorded through the AIGO Risk Management workspace.",
            },
            riskTreatment: {
              decision: riskTreatmentDecision,
              objective: riskTreatmentObjective.trim(),
              rationale: riskTreatmentRationale.trim(),
              status: riskTreatmentStatus,
            },
            riskAcceptance: riskAcceptanceRequired
              ? {
                  required: true,
                  acceptanceId: riskAcceptanceId.trim() || null,
                  authority: {
                    roleType: riskAcceptanceAuthority.trim() || "RISK_ACCEPTANCE_AUTHORITY",
                    personReference: null,
                    organizationUnit: null,
                  },
                  status: riskAcceptanceStatus,
                  effectiveDate: riskAcceptanceEffectiveDate || null,
                  expiryDate: riskAcceptanceExpiryDate || null,
                  conditions: [],
                  rationale: riskAcceptanceRationale.trim(),
                }
              : null,
            riskAcceptanceId: riskAcceptanceId.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save risk.");
      }

      const savedRisk = await response.json();

      if (editingRiskId) {
        setRisks((current) =>
          current.map((risk) =>
            risk.id === editingRiskId ? savedRisk : risk
          )
        );
        setEditingRiskId(null);
      } else {
        setRisks((current) => [savedRisk, ...current]);
      }

      setRiskSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save risk."
      );
    }
  }
  async function deleteRisk(risk: any) {
    if (!window.confirm(`Delete risk "${risk.riskTitle}"?`)) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/risk/${risk.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete risk.");
      }

      setRisks((current) => current.filter((item) => item.id !== risk.id));

      if (selectedRisk?.id === risk.id) {
        setSelectedRisk(null);
      }

      if (editingRiskId === risk.id) {
        setEditingRiskId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete risk."
      );
    }
  }
  function resetRiskForm() {
    setEditingRiskId(null);
    setRiskSaved(false);
    setRiskTitle("");
    setRiskStatement("");
    setRiskOwner("RISK_OWNER");
    setRiskStatus("IDENTIFIED");
    setRiskCategory("");
    setConsequences("");
    setPotentialHarms("");
    setAssessmentId("");
    setAssessmentDate("");
    setAssessmentType("INITIAL");
    setAssessmentResult("NOT_ASSESSED");
    setLikelihood("2");
    setLikelihoodLevel("UNLIKELY");
    setImpact("2");
    setImpactLevel("MINOR");
    setRiskLevel("LOW");
    setRiskTreatmentDecision("REDUCE");
    setRiskTreatmentStatus("PLANNED");
    setRiskTreatmentObjective("");
    setRiskTreatmentRationale("");
    setRiskAcceptanceRequired(false);
    setRiskAcceptanceId("");
    setRiskAcceptanceAuthority("RISK_ACCEPTANCE_AUTHORITY");
    setRiskAcceptanceStatus("NOT_REQUIRED");
    setRiskAcceptanceEffectiveDate("");
    setRiskAcceptanceExpiryDate("");
    setRiskAcceptanceRationale("");
  }

  function editRisk(risk: any) {
    setEditingRiskId(risk.id);
    setSelectedRisk(null);
    setRiskSaved(false);
    setRiskTitle(risk.riskTitle || "");
    setRiskStatement(risk.riskStatement || "");
    setRiskOwner(risk.riskOwner?.roleType || "RISK_OWNER");
    setRiskStatus(risk.status || "IDENTIFIED");
    setRiskCategory((risk.riskCategory || []).join(", "));
    setConsequences((risk.consequences || []).join("\n"));
    setPotentialHarms((risk.potentialHarms || []).join("\n"));
    setAssessmentId(risk.riskAssessment?.assessmentId || "");
    setAssessmentDate(risk.riskAssessment?.assessmentDate || "");
    setAssessmentType(risk.riskAssessment?.assessmentType || "INITIAL");
    setAssessmentResult(risk.riskAssessment?.result || "NOT_ASSESSED");
    setLikelihood(String(risk.inherentRisk?.likelihood ?? 2));
    setLikelihoodLevel(risk.inherentRisk?.likelihoodLevel || "UNLIKELY");
    setImpact(String(risk.inherentRisk?.impact ?? 2));
    setImpactLevel(risk.inherentRisk?.impactLevel || "MINOR");
    setRiskLevel(risk.inherentRisk?.level || "LOW");
    setRiskTreatmentDecision(risk.riskTreatment?.decision || "REDUCE");
    setRiskTreatmentObjective(risk.riskTreatment?.objective || "");
    setRiskTreatmentRationale(risk.riskTreatment?.rationale || "");
    setRiskTreatmentStatus(risk.riskTreatment?.status || "PLANNED");
    setRiskAcceptanceRequired(risk.riskAcceptance?.required === true);
    setRiskAcceptanceId(risk.riskAcceptance?.acceptanceId || "");
    setRiskAcceptanceAuthority(risk.riskAcceptance?.authority?.roleType || "RISK_ACCEPTANCE_AUTHORITY");
    setRiskAcceptanceStatus(risk.riskAcceptance?.status || "NOT_REQUIRED");
    setRiskAcceptanceEffectiveDate(risk.riskAcceptance?.effectiveDate || "");
    setRiskAcceptanceExpiryDate(risk.riskAcceptance?.expiryDate || "");
    setRiskAcceptanceRationale(risk.riskAcceptance?.rationale || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {

    async function loadRisks() {
      try {
        const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/risk`,
        );

        if (!response.ok) {
          throw new Error("Unable to load risks.");
        }

        const data = await response.json();
        setRisks(Array.isArray(data) ? data : data.value || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load risks."
        );
      }
    }

    loadRisks();

    async function loadSystem() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/ai-systems"
        );

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
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-[#737b87]">
            Loading risk management workspace...
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
            AI System Risk Management
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#18202b]">
                  Risk Management &#8212; {system.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#737b87]">
                Identify, assess, treat, accept, monitor, and review risks
                associated with this AI system.
              </p>
            </div>

            <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-medium capitalize text-[#3e6b4d]">
              {system.lifecycle_status}
            </span>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-base font-semibold text-[#18202b]">
            Risk Management
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#737b87]">
            Record and manage governance risks for this AI system.
          </p>            <div className="mt-5 rounded-md border border-[#e1e5e9] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">
                Record a Risk
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#737b87]">
                Record the identified risk, assessment basis, inherent rating, and treatment decision.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="text-xs font-medium text-[#626b77]">
                  Risk title
                  <input
                    value={riskTitle}
                    onChange={(event) => setRiskTitle(event.target.value)}
                    placeholder="e.g. Inaccurate customer support response"
                    className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  />
                </label>

                <label className="text-xs font-medium text-[#626b77]">
                  Risk status
                  <select
                    value={riskStatus}
                    onChange={(event) => setRiskStatus(event.target.value)}
                    className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="IDENTIFIED">IDENTIFIED</option>
                    <option value="UNDER_ASSESSMENT">UNDER ASSESSMENT</option>
                    <option value="ASSESSED">ASSESSED</option>
                    <option value="TREATMENT_REQUIRED">TREATMENT REQUIRED</option>
                    <option value="UNDER_TREATMENT">UNDER TREATMENT</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="ACCEPTED_WITH_CONDITIONS">ACCEPTED WITH CONDITIONS</option>
                    <option value="MONITORED">MONITORED</option>
                    <option value="ESCALATED">ESCALATED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="TRANSFERRED">TRANSFERRED</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </label>

                <label className="text-xs font-medium text-[#626b77] md:col-span-2">
                  Risk statement
                  <textarea
                    value={riskStatement}
                    onChange={(event) => setRiskStatement(event.target.value)}
                    rows={3}
                    placeholder="Describe the risk event and potential impact."
                    className="mt-2 w-full resize-y rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  />
                </label>

                <label className="text-xs font-medium text-[#626b77]">
                  Risk owner
                  <select
                    value={riskOwner}
                    onChange={(event) => setRiskOwner(event.target.value)}
                    className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  >
                    <option value="RISK_OWNER">Risk Owner</option>
                    <option value="GOVERNANCE_OWNER">Governance Owner</option>
                    <option value="SYSTEM_OWNER">System Owner</option>
                    <option value="BUSINESS_OWNER">Business Owner</option>
                    <option value="TECHNICAL_OWNER">Technical Owner</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label className="text-xs font-medium text-[#626b77]">
                  Risk category
                  <input
                    value={riskCategory}
                    onChange={(event) => setRiskCategory(event.target.value)}
                    placeholder="e.g. RELIABILITY"
                    className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  />
                </label>

                <label className="text-xs font-medium text-[#626b77]">
                  Consequences
                  <textarea
                    value={consequences}
                    onChange={(event) => setConsequences(event.target.value)}
                    rows={3}
                    placeholder="One consequence per line."
                    className="mt-2 w-full resize-y rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  />
                </label>

                <label className="text-xs font-medium text-[#626b77]">
                  Potential harms
                  <textarea
                    value={potentialHarms}
                    onChange={(event) => setPotentialHarms(event.target.value)}
                    rows={3}
                    placeholder="One potential harm per line."
                    className="mt-2 w-full resize-y rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                  />
                </label>
              </div>

              <div className="mt-6 border-t border-[#e5e8eb] pt-5">
                <h4 className="text-sm font-semibold text-[#18202b]">
                  Risk assessment
                </h4>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium text-[#626b77]">
                    Assessment ID
                    <input
                      value={assessmentId}
                      onChange={(event) => setAssessmentId(event.target.value)}
                      placeholder="e.g. RISK-ASSESS-002"
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Assessment date
                    <input
                      type="date"
                      value={assessmentDate}
                      onChange={(event) => setAssessmentDate(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Assessment type
                    <select
                      value={assessmentType}
                      onChange={(event) => setAssessmentType(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="INITIAL">INITIAL</option>
                      <option value="PERIODIC">PERIODIC</option>
                      <option value="TRIGGERED">TRIGGERED</option>
                      <option value="POST_INCIDENT">POST INCIDENT</option>
                      <option value="POST_CHANGE">POST CHANGE</option>
                      <option value="REASSESSMENT">REASSESSMENT</option>
                      <option value="RETIREMENT">RETIREMENT</option>
                    </select>
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Assessment result
                    <select
                      value={assessmentResult}
                      onChange={(event) => setAssessmentResult(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="NOT_ASSESSED">NOT ASSESSED</option>
                      <option value="APPROPRIATE">APPROPRIATE</option>
                      <option value="EFFECTIVE">EFFECTIVE</option>
                      <option value="PARTIALLY_EFFECTIVE">PARTIALLY EFFECTIVE</option>
                      <option value="INEFFECTIVE">INEFFECTIVE</option>
                      <option value="REQUIRES_REASSESSMENT">REQUIRES REASSESSMENT</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-6 border-t border-[#e5e8eb] pt-5">
                <h4 className="text-sm font-semibold text-[#18202b]">
                  Inherent risk rating
                </h4>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <label className="text-xs font-medium text-[#626b77]">
                    Likelihood
                    <input
                      type="number"
                      min="0"
                      value={likelihood}
                      onChange={(event) => setLikelihood(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Likelihood level
                    <select
                      value={likelihoodLevel}
                      onChange={(event) => setLikelihoodLevel(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="RARE">RARE</option>
                      <option value="UNLIKELY">UNLIKELY</option>
                      <option value="POSSIBLE">POSSIBLE</option>
                      <option value="LIKELY">LIKELY</option>
                      <option value="ALMOST_CERTAIN">ALMOST CERTAIN</option>
                    </select>
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Impact
                    <input
                      type="number"
                      min="0"
                      value={impact}
                      onChange={(event) => setImpact(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Impact level
                    <select
                      value={impactLevel}
                      onChange={(event) => setImpactLevel(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="INSIGNIFICANT">INSIGNIFICANT</option>
                      <option value="MINOR">MINOR</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="MAJOR">MAJOR</option>
                      <option value="SEVERE">SEVERE</option>
                    </select>
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Risk level
                    <select
                      value={riskLevel}
                      onChange={(event) => setRiskLevel(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-6 border-t border-[#e5e8eb] pt-5">
                <h4 className="text-sm font-semibold text-[#18202b]">
                  Risk treatment
                </h4>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium text-[#626b77]">
                    Treatment decision
                    <select
                      value={riskTreatmentDecision}
                      onChange={(event) => setRiskTreatmentDecision(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="AVOID">AVOID</option>
                      <option value="REDUCE">REDUCE</option>
                      <option value="MITIGATE">MITIGATE</option>
                      <option value="TRANSFER">TRANSFER</option>
                      <option value="RESTRICT">RESTRICT</option>
                      <option value="ACCEPT">ACCEPT</option>
                      <option value="SUSPEND">SUSPEND</option>
                      <option value="RETIRE">RETIRE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Treatment status
                    <select
                      value={riskTreatmentStatus}
                      onChange={(event) => setRiskTreatmentStatus(event.target.value)}
                      className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    >
                      <option value="NOT_STARTED">NOT STARTED</option>
                      <option value="PLANNED">PLANNED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="PARTIALLY_COMPLETE">PARTIALLY COMPLETE</option>
                      <option value="COMPLETE">COMPLETE</option>
                      <option value="OVERDUE">OVERDUE</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Treatment objective
                    <textarea
                      value={riskTreatmentObjective}
                      onChange={(event) => setRiskTreatmentObjective(event.target.value)}
                      rows={3}
                      placeholder="Describe the treatment objective."
                      className="mt-2 w-full resize-y rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>

                  <label className="text-xs font-medium text-[#626b77]">
                    Treatment rationale
                    <textarea
                      value={riskTreatmentRationale}

                      onChange={(event) => setRiskTreatmentRationale(event.target.value)}
                      rows={3}
                      placeholder="Explain the treatment decision."
                      className="mt-2 w-full resize-y rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 border-t border-[#e5e8eb] pt-5">
                <h4 className="text-sm font-semibold text-[#18202b]">Risk acceptance</h4>
                <p className="mt-1 text-sm leading-6 text-[#737b87]">Record whether formal acceptance is required and, where applicable, the acceptance authority and validity period.</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 text-sm font-medium text-[#626b77] md:col-span-2">
                    <input type="checkbox" checked={riskAcceptanceRequired} onChange={(event) => setRiskAcceptanceRequired(event.target.checked)} className="h-4 w-4" />
                    Formal risk acceptance required
                  </label>
                  <label className="text-xs font-medium text-[#626b77]">Acceptance ID<input value={riskAcceptanceId} onChange={(event) => setRiskAcceptanceId(event.target.value)} placeholder="e.g. RISK-ACCEPT-001" className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none" /></label>
                  <label className="text-xs font-medium text-[#626b77]">Acceptance status<select value={riskAcceptanceStatus} onChange={(event) => setRiskAcceptanceStatus(event.target.value)} className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"><option value="NOT_REQUIRED">NOT REQUIRED</option><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="APPROVED_WITH_CONDITIONS">APPROVED WITH CONDITIONS</option><option value="REJECTED">REJECTED</option><option value="EXPIRED">EXPIRED</option><option value="REVOKED">REVOKED</option></select></label>
                  <label className="text-xs font-medium text-[#626b77]">Acceptance authority<select value={riskAcceptanceAuthority} onChange={(event) => setRiskAcceptanceAuthority(event.target.value)} className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none"><option value="RISK_ACCEPTANCE_AUTHORITY">Risk Acceptance Authority</option><option value="GOVERNANCE_OWNER">Governance Owner</option><option value="RISK_OWNER">Risk Owner</option><option value="SYSTEM_OWNER">System Owner</option><option value="BUSINESS_OWNER">Business Owner</option><option value="OTHER">Other</option></select></label>
                  <label className="text-xs font-medium text-[#626b77]">Effective date<input type="date" value={riskAcceptanceEffectiveDate} onChange={(event) => setRiskAcceptanceEffectiveDate(event.target.value)} className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none" /></label>
                  <label className="text-xs font-medium text-[#626b77]">Expiry date<input type="date" value={riskAcceptanceExpiryDate} onChange={(event) => setRiskAcceptanceExpiryDate(event.target.value)} className="mt-2 w-full rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none" /></label>
                  <label className="text-xs font-medium text-[#626b77] md:col-span-2">Acceptance rationale<textarea value={riskAcceptanceRationale} onChange={(event) => setRiskAcceptanceRationale(event.target.value)} rows={3} placeholder="Explain why the residual risk is accepted." className="mt-2 w-full resize-y rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-normal text-[#18202b] outline-none" /></label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#e5e8eb] pt-5">
                {riskSaved ? (
                  <span className="text-sm text-[#3e6b4d]">
                    Risk saved successfully.
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  {editingRiskId ? (
                    <button
                      type="button"
                      onClick={resetRiskForm}
                      className="rounded-md border border-[#d7dce1] px-4 py-2 text-sm font-medium text-[#626b77] hover:bg-[#f7f8fa]"
                    >
                      Cancel Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={saveRisk}
                    className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#252e3a]"
                  >
                    {editingRiskId ? "Update Risk" : "Save Risk"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-md border border-[#e1e5e9] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#18202b]">
                Risk History
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#737b87]">
                Previously recorded risks for this AI system.
              </p>

              {risks.length === 0 ? (
                <p className="mt-5 text-sm text-[#737b87]">
                  No risks have been recorded yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {risks.map((risk) => (
                    <div
                      key={risk.id}
                      className="rounded-md border border-[#e5e8eb] p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                        <div>
                          <h4 className="text-sm font-semibold text-[#18202b]">
                            {risk.riskTitle}
                          </h4>
                          <p className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm leading-6 text-[#18202b]">
                            {risk.riskStatement}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[10px] font-medium text-[#737b87]">
                          {risk.status || "DRAFT"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-xs text-[#626b77] md:grid-cols-3">
                        <div>
                          <span className="font-medium text-[#18202b]">Risk level:</span>{" "}
                          {risk.inherentRisk?.level || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium text-[#18202b]">Assessment:</span>{" "}
                          {risk.riskAssessment?.result || "Not assessed"}
                        </div>
                        <div>
                          <span className="font-medium text-[#18202b]">Treatment:</span>{" "}
                          {risk.riskTreatment?.decision || "Not specified"}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRisk(risk)}
                            className="rounded-md border border-[#d7dce1] px-3 py-2 text-xs font-medium text-[#18202b] hover:bg-[#f7f8fa]"
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() => editRisk(risk)}
                            className="rounded-md border border-[#d7dce1] px-3 py-2 text-xs font-medium text-[#18202b] hover:bg-[#f7f8fa]"
                          >
                            Edit Details
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteRisk(risk)}
                            aria-label={`Delete risk ${risk.riskTitle}`}
                            title="Delete risk"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e1caca] text-[#a33a3a] hover:bg-[#fff5f5]"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M4 7h16" />
                              <path d="M9 7V4h6v3" />
                              <path d="M7 7l1 13h8l1-13" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </section>
      </div>
      {selectedRisk ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#e1e5e9] px-6 py-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Risk Details
                </div>
                <h2 className="mt-1 text-xl font-semibold text-[#18202b]">
                  {selectedRisk.riskTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRisk(null)}
                className="rounded-md border border-[#d7dce1] px-3 py-2 text-sm text-[#626b77] hover:bg-[#f7f8fa]"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <section>
                <h3 className="text-sm font-semibold text-[#18202b]">Record</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">ID</div>
                    <div className="mt-1 break-all text-sm text-[#18202b]">{selectedRisk.id}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Status</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">{selectedRisk.status || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Object Type</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">{selectedRisk.objectType || "RISK"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Schema Version</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">{selectedRisk.schemaVersion || "Not specified"}</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#18202b]">Risk Definition</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Risk Statement</div>
                    <p className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm leading-6 text-[#18202b]">
                      {selectedRisk.riskStatement || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Risk Owner</div>
                    <p className="mt-1 text-sm text-[#626b77]">
                      {selectedRisk.riskOwner?.roleType || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Risk Category</div>
                    <p className="mt-1 text-sm text-[#626b77]">
                      {Array.isArray(selectedRisk.riskCategory) && selectedRisk.riskCategory.length > 0
                        ? selectedRisk.riskCategory.join(", ")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#18202b]">Consequences and Potential Harms</h3>
                <div className="mt-3 grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Consequences</div>
                    <ul className="mt-2 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] py-2 pl-8 pr-3 text-sm text-[#18202b]">
                      {(selectedRisk.consequences || []).map((item: string, index: number) => (
                        <li key={`consequence-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Potential Harms</div>
                    <ul className="mt-2 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] py-2 pl-8 pr-3 text-sm text-[#18202b]">
                      {(selectedRisk.potentialHarms || []).map((item: string, index: number) => (
                        <li key={`harm-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#18202b]">Risk Assessment</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Assessment ID</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.riskAssessment?.assessmentId || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Assessment Date</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.riskAssessment?.assessmentDate || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Assessment Type</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.riskAssessment?.assessmentType || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Assessment Result</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.riskAssessment?.result || "Not assessed"}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#18202b]">Inherent Risk Rating</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Likelihood</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.inherentRisk?.likelihood ?? "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Likelihood Level</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.inherentRisk?.likelihoodLevel || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Impact</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.inherentRisk?.impact ?? "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Impact Level</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.inherentRisk?.impactLevel || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Risk Level</div>
                    <div className="mt-1 font-medium text-sm text-[#18202b]">
                      {selectedRisk.inherentRisk?.level || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Score</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.inherentRisk?.score ?? "Not specified"}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#18202b]">Risk Treatment</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Decision</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.riskTreatment?.decision || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Status</div>
                    <div className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm text-[#18202b]">
                      {selectedRisk.riskTreatment?.status || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Objective</div>
                    <p className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm leading-6 text-[#18202b]">
                      {selectedRisk.riskTreatment?.objective || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#9299a3]">Rationale</div>
                    <p className="mt-1 rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm leading-6 text-[#18202b]">
                      {selectedRisk.riskTreatment?.rationale || "Not specified"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
