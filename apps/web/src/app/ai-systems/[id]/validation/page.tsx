"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ValidationCheck = {
  level: string;
  description: string;
  status: "PASS" | "WARNING" | "NOT_CHECKED";
  detail?: string;
};

export default function ValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [checks, setChecks] = useState<ValidationCheck[]>([]);

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);

      try {
        const [systemsResponse, evidenceResponse, classificationResponse, evaluationResponse, riskResponse, reviewResponse, approvalResponse, assuranceResponse] =
          await Promise.all([
            fetch("/api/ai-systems"),
            fetch(`/api/evidence?ai_system_id=${id}`),
            fetch(`/api/ai-systems/${id}/classification`),
            fetch(`/api/ai-systems/${id}/evaluation`),
            fetch(`/api/ai-systems/${id}/risk`),
            fetch(`/api/ai-systems/${id}/review`),
            fetch(`/api/ai-systems/${id}/approval`),
            fetch(`/api/assurances?ai_system_id=${id}`),
          ]);

        const systems = systemsResponse.ok ? await systemsResponse.json() : [];
        const evidence = evidenceResponse.ok ? await evidenceResponse.json() : [];
        const classification = classificationResponse.ok ? await classificationResponse.json() : null;
        const evaluation = evaluationResponse.ok ? await evaluationResponse.json() : null;
        const risk = riskResponse.ok ? await riskResponse.json() : null;
        const review = reviewResponse.ok ? await reviewResponse.json() : null;
        const approval = approvalResponse.ok ? await approvalResponse.json() : null;
        const assurances = assuranceResponse.ok ? await assuranceResponse.json() : [];

        const system = Array.isArray(systems)
          ? systems.find((item) => item.id === id)
          : null;

        const hasSystem = Boolean(system);
        const hasEvidence = Array.isArray(evidence) && evidence.length > 0;
        const hasClassification = Boolean(classification) && classification.status !== "NOT_STARTED";
        const hasEvaluation = Boolean(evaluation) && evaluation.status !== "NOT_STARTED";
        const hasRisk = Boolean(risk) && risk.status !== "NOT_STARTED";
        const hasReview = Boolean(review) && review.status !== "NOT_STARTED";
        const hasApproval = Boolean(approval) && approval.status !== "NOT_STARTED";
        const hasAssurance = Array.isArray(assurances) && assurances.length > 0;

        setChecks([
          {
            level: "1. Syntax",
            description: "Confirm governance records are structurally readable.",
            status: systemsResponse.ok ? "PASS" : "WARNING",
            detail: systemsResponse.ok ? "AI System records are reachable." : "AI System records could not be loaded.",
          },
          {
            level: "2. Schema",
            description: "Confirm records follow their applicable AIGO schemas.",
            status: systemsResponse.ok ? "PASS" : "WARNING",
            detail: systemsResponse.ok ? "AI System records are reachable." : "AI System records could not be loaded.",
          },
          {
            level: "3. Reference",
            description: "Verify referenced AI System and governance records exist.",
            status: hasSystem ? "PASS" : "WARNING",
            detail: hasSystem ? "Referenced AI System exists." : "Referenced AI System was not found.",
          },
          {
            level: "4. Traceability",
            description: "Verify required governance relationships are present.",
            status: hasEvidence ? "PASS" : "WARNING",
            detail: hasEvidence ? "Evidence is linked to the AI System." : "No evidence is currently linked.",
          },
          {
            level: "5. Governance",
            description: "Verify lifecycle records are consistent with governance requirements.",
            status:
              hasClassification &&
              hasEvaluation &&
              hasRisk &&
              hasReview &&
              hasApproval
                ? "PASS"
                : "WARNING",
          },
          {
            level: "6. Assurance",
            description: "Verify supporting evidence and independent assurance where required.",
            status: hasAssurance ? "PASS" : "WARNING",
            detail: hasAssurance ? "Assurance record is persisted for this AI System." : "No assurance record is currently persisted.",
          },
        ]);
      } catch {
        setChecks([
          {
            level: "1. Syntax",
            description: "Confirm governance records are structurally readable.",
            status: "WARNING",
            detail: "Validation check could not be completed.",
          },
          {
            level: "2. Schema",
            description: "Confirm records follow their applicable AIGO schemas.",
            status: "WARNING",
            detail: "Validation check could not be completed.",
          },
          {
            level: "3. Reference",
            description: "Verify referenced AI System and governance records exist.",
            status: "WARNING",
            detail: "Validation check could not be completed.",
          },
          {
            level: "4. Traceability",
            description: "Verify required governance relationships are present.",
            status: "WARNING",
            detail: "Validation check could not be completed.",
          },
          {
            level: "5. Governance",
            description: "Verify lifecycle records are consistent with governance requirements.",
            status: "WARNING",
            detail: "Validation check could not be completed.",
          },
          {
            level: "6. Assurance",
            description: "Verify supporting evidence and independent assurance where required.",
            status: "NOT_CHECKED",
            detail: "Validation check was not completed.",
          },
        ]);
      }
    });
  }, [params]);

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          &#8592; Back to Governance Workspace
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">Governance Lifecycle</p>
          <h1 className="mt-2 text-3xl font-semibold">Validation</h1>
          <p className="mt-2 text-slate-600">
            Validate the AI System governance record against the AIGO validation model.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Validation Checks</h2>

          <div className="mt-5 space-y-3">
            {checks.map((check) => (
              <div
                key={check.level}
                className="flex items-center justify-between gap-6 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <h3 className="font-medium">{check.level}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {check.description}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

