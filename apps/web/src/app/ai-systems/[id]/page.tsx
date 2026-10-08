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
  evidence?: {
    id: string;
    evidenceTitle: string;
    purpose: string;
    source: string;
    status: string;
  }[];
  canonical?: {
    systemName?: string;
    intendedPurpose?: string;
    systemOwner?: {
      roleType?: string;
      personReference?: string | null;
    };
    classification?: {
      level?: string;
    };
    status?: string;
    currentLifecycleStage?: string;
    description?: string | null;
    businessCriticality?: string | null;
    decisionRole?: string | null;
  };
};

const lifecycleStages = [
  ["Register", "Maintain the governed AI system record, ownership, purpose, and context.", "register"],
  ["Responsibilities", "Maintain accountable people, governance roles, and responsibility history.", "responsibilities"],
  ["Classify", "Determine applicable governance domains, requirements, risk considerations, and evaluation scope.", "classification"],
  ["Evaluate", "Evaluate the AI system against applicable governance rules, controls, and requirements.", "evaluation"],
  ["Review", "Review evaluation results, evidence, risks, and governance decisions.", "review"],
  ["Approve", "Record applicable organizational governance decisions and approvals.", "approval"],
  ["Validate", "Validate governance structures, mappings, rules, and evaluation behavior.", "validation"],
  ["Monitor", "Maintain governance after deployment and identify conditions requiring action.", "monitoring"],
  ["Reassess", "Re-evaluate the system when material changes or governance conditions occur.", "reassessment"],
];

const governanceRecords = [
  ["Risks", "Identify, assess, treat, accept, monitor, and review risks.", "risk"],
  ["Controls", "Define, implement, monitor, and review governance controls.", "controls"],
  ["Changes", "Manage changes that may affect the AI system or its governance.", "changes"],
  ["Incidents", "Manage AI-related incidents and their lifecycle.", "incidents"],
  ["Assurance", "Maintain ongoing governance assurance and outcomes.", "assurance"],
];

function display(value?: string | null) {
  if (!value) return "Not specified";
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function GovernanceWorkspacePage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [evidence, setEvidence] = useState<AISystem["evidence"]>([]);
  const [classification, setClassification] = useState<{ status?: string } | null>(null);
  const [evaluation, setEvaluation] = useState<{ status?: string } | null>(null);
  const [risk, setRisk] = useState<{ status?: string } | null>(null);
  const [review, setReview] = useState<{ status?: string } | null>(null);
  const [approval, setApproval] = useState<{ status?: string } | null>(null);
  const [monitoring, setMonitoring] = useState<{ status?: string } | null>(null);
  const [controls, setControls] = useState<unknown[]>([]);
    const [changes, setChanges] = useState<unknown[]>([]);
  const [incidents, setIncidents] = useState<unknown[]>([]);
  const [reassessment, setReassessment] = useState<{ required?: boolean } | null>(null);
  const [assurance, setAssurance] = useState<unknown[]>([]);
  const [validationStatus, setValidationStatus] = useState("Not started");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const evidenceResponse = await fetch(
          `/api/evidence?ai_system_id=${id}`
        );

        if (evidenceResponse.ok) {
          setEvidence(await evidenceResponse.json());
        }

        const classificationResponse = await fetch(
          `/api/ai-systems/${id}/classification`
        );

        if (classificationResponse.ok) {
          setClassification(await classificationResponse.json());
        }

        const evaluationResponse = await fetch(
          `/api/ai-systems/${id}/evaluation`
        );
        const riskResponse = await fetch(`/api/ai-systems/${id}/risk`);
        if (riskResponse.ok) {
          const riskData = await riskResponse.json();
          const riskItems = Array.isArray(riskData) ? riskData : riskData.value || [];
          setRisk(riskItems.length > 0 ? { status: riskItems[0].status } : null);
        }

        const reviewResponse = await fetch(`/api/ai-systems/${id}/review`);
        const approvalResponse = await fetch(`/api/ai-systems/${id}/approval`);
        const monitoringResponse = await fetch(`/api/ai-systems/${id}/monitoring`);
        const controlsResponse = await fetch(`/api/ai-systems/${id}/control`);
          const changesResponse = await fetch(`/api/ai-systems/${id}/change`);
        const incidentsResponse = await fetch(`/api/ai-systems/${id}/incidents`);
        const assuranceResponse = await fetch(`/api/assurances?ai_system_id=${id}`);

        if (reviewResponse.ok) {
          setReview(await reviewResponse.json());
        }

        if (approvalResponse.ok) {
          setApproval(await approvalResponse.json());
        }

        if (controlsResponse.ok) {
          const controlsData = await controlsResponse.json();
          setControls(Array.isArray(controlsData) ? controlsData : []);

          if (changesResponse.ok) {
            const changesData = await changesResponse.json();
            setChanges(Array.isArray(changesData) ? changesData : changesData.value || []);
          }
        }

        if (incidentsResponse.ok) {
          const incidentsData = await incidentsResponse.json();
          setIncidents(Array.isArray(incidentsData) ? incidentsData : incidentsData.value || []);
        }

        if (monitoringResponse.ok) {
          setMonitoring(await monitoringResponse.json());
        }

        if (evaluationResponse.ok) {
          const evaluationData = await evaluationResponse.json();
          setEvaluation(evaluationData);
          setReassessment(evaluationData.reassessment || null);
        }

        if (assuranceResponse.ok) {
          const assuranceData = await assuranceResponse.json();
          setAssurance(Array.isArray(assuranceData) ? assuranceData : assuranceData.value || []);
        }

        setValidationStatus(
          evidenceResponse.ok &&
          classificationResponse.ok &&
          evaluationResponse.ok &&
          riskResponse.ok &&
          reviewResponse.ok &&
          approvalResponse.ok
            ? "PASS"
            : "WARNING"
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load AI system.");
      } finally {
        setLoading(false);
      }
    }

    loadSystem();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-sm text-[#737b87]">Loading governance workspace...</p>
        </div>
      </main>
    );
  }

  if (!system) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-6xl px-6 py-8">

<Link href="/ai-systems" className="text-sm text-[#626b77] hover:text-[#18202b]">
            &#8592; Back to AI Systems
          </Link>

          <div className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-8">
            <h1 className="text-xl font-semibold text-[#18202b]">AI system not found</h1>
            <p className="mt-2 text-sm text-[#737b87]">
              {error || "The requested AI system could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const canonical = system.canonical;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-3">
          <Link href="/" className="text-sm text-[#626b77] hover:text-[#18202b]">
            &#8592; Dashboard
          </Link>
        </div>
        <Link href="/ai-systems" className="text-sm text-[#626b77] hover:text-[#18202b]">
            &#8592; Back to AI Systems
        </Link>

        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9299a3]">
            Governance Workspace
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#18202b]">
                {canonical?.systemName || system.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#737b87]">
                Manage this AI system using the AIGO governance lifecycle and connected governance records.
               </p>
            </div>

            <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-medium text-[#3e6b4d]">
              {display(canonical?.status || system.lifecycle_status)}
            </span>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-base font-semibold text-[#18202b]">System identity</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Purpose</div>
              <p className="mt-2 text-sm leading-6 text-[#626b77]">
                {canonical?.intendedPurpose || system.purpose}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Owner</div>
              <p className="mt-2 text-sm text-[#626b77]">
                {canonical?.systemOwner?.personReference ||
                  display(canonical?.systemOwner?.roleType) ||
                  system.owner}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Provider</div>
              <p className="mt-2 text-sm text-[#626b77]">{system.provider || "Not specified"}</p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Model</div>
              <p className="mt-2 text-sm text-[#626b77]">{system.model || "Not specified"}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-base font-semibold text-[#18202b]">Governance profile</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Classification</div>
              <p className="mt-2 text-sm text-[#626b77]">
                {display(canonical?.classification?.level)}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Lifecycle stage</div>
              <p className="mt-2 text-sm text-[#626b77]">
                {display(canonical?.currentLifecycleStage)}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Decision role</div>
              <p className="mt-2 text-sm text-[#626b77]">
                {display(canonical?.decisionRole)}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Criticality</div>
              <p className="mt-2 text-sm text-[#626b77]">
                {display(canonical?.businessCriticality)}
              </p>
            </div>
          </div>

          {canonical?.description && (
            <div className="mt-6 border-t border-[#eef0f2] pt-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">Description</div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[#626b77]">
                {canonical.description}
              </p>
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Evidence</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Evidence linked to this AI system.
                </p>
              </div>

              <a
                href="/evidence"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Manage Evidence &#8594;
              </a>
            </div>

            <div className="mt-5 space-y-3">
              {evidence && evidence.length > 0 ? (
                evidence.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {item.evidenceTitle}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.purpose}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Source: {item.source}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  No evidence linked to this AI system yet.
                </div>
              )}
            </div>
          </div>
        </section>
                <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#18202b]">
              AIGO lifecycle
            </h2>
            <p className="mt-1 text-sm text-[#737b87]">
              Manage this AI system through the AIGO governance lifecycle.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {lifecycleStages.map(([name, description, path]) => (
              <Link
                key={name}
                href={name === "Register" ? "/ai-systems/register" : `/ai-systems/${system.id}/${path}`}
                className="rounded-lg border border-[#e1e5e9] bg-white p-4 transition-colors hover:border-[#c8ced5] hover:bg-[#fcfcfd]"
              >
                <div className="text-sm font-semibold text-[#18202b]">{name}</div>
                <p className="mt-2 text-sm leading-5 text-[#737b87]">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#18202b]">
              Governance records
            </h2>
            <p className="mt-1 text-sm text-[#737b87]">
              Manage the risks, controls, evidence, events, changes, and assurance records connected to this AI system.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {governanceRecords.map(([name, description, path]) => (
              <Link
                key={name}
                href={path.startsWith("/") ? path : `/ai-systems/${system.id}/${path}`}
                className="rounded-lg border border-[#e1e5e9] bg-white p-4 transition-colors hover:border-[#c8ced5] hover:bg-[#fcfcfd]"
              >
                <div className="text-sm font-semibold text-[#18202b]">{name}</div>
                <p className="mt-2 text-sm leading-5 text-[#737b87]">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}






