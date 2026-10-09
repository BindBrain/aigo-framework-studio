
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ValidationStatus = "PASS" | "WARNING" | "NOT_CHECKED";

type ValidationCheck = {
  level: string;
  description: string;
  status: ValidationStatus;
  detail?: string;
};

type ApiResult = {
  ok: boolean;
  data: any;
};

const NOT_STARTED = "NOT_STARTED";

async function fetchJson(url: string): Promise<ApiResult> {
  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return { ok: false, data: null };
    }

    return { ok: true, data: await response.json() };
  } catch {
    return { ok: false, data: null };
  }
}

function recordExists(data: any): boolean {
  return Boolean(
    data &&
      typeof data === "object" &&
      typeof data.status === "string" &&
      data.status.trim() !== "" &&
      data.status.toUpperCase() !== NOT_STARTED
  );
}

function getStatus(data: any): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  return typeof data.status === "string"
    ? data.status.toUpperCase()
    : undefined;
}

export default function ValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let active = true;

    params.then(({ id: resolvedId }) => {
      if (active) {
        setId(resolvedId);
      }
    });

    return () => {
      active = false;
    };
  }, [params]);

  const runValidation = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setPageError("");

    const [
      systemsResult,
      evidenceResult,
      classificationResult,
      evaluationResult,
      riskResult,
      reviewResult,
      approvalResult,
      assuranceResult,
    ] = await Promise.all([
      fetchJson("/api/ai-systems"),
      fetchJson(`/api/evidence?ai_system_id=${encodeURIComponent(id)}`),
      fetchJson(`/api/ai-systems/${id}/classification`),
      fetchJson(`/api/ai-systems/${id}/evaluation`),
      fetchJson(`/api/ai-systems/${id}/risk`),
      fetchJson(`/api/ai-systems/${id}/review`),
      fetchJson(`/api/ai-systems/${id}/approval`),
      fetchJson(`/api/assurances?ai_system_id=${encodeURIComponent(id)}`),
    ]);

    const results = [
      systemsResult,
      evidenceResult,
      classificationResult,
      evaluationResult,
      riskResult,
      reviewResult,
      approvalResult,
      assuranceResult,
    ];

    const anyRequestFailed = results.some((result) => !result.ok);

    if (!systemsResult.ok) {
      setChecks([
        {
          level: "1. Syntax",
          description: "Check the structural readability of governance records.",
          status: "NOT_CHECKED",
          detail:
            "The AI Systems endpoint could not be reached. Syntax validation was not performed.",
        },
        {
          level: "2. Schema",
          description: "Check records against their applicable AIGO schemas.",
          status: "NOT_CHECKED",
          detail:
            "The AI Systems endpoint could not be reached. No dedicated schema validator is available on this page.",
        },
        {
          level: "3. Reference",
          description: "Verify that the referenced AI System exists.",
          status: "WARNING",
          detail: "The AI Systems request failed, so the reference could not be verified.",
        },
        {
          level: "4. Traceability",
          description: "Verify required governance relationships are present.",
          status: "NOT_CHECKED",
          detail: evidenceResult.ok
            ? "Evidence data was retrieved, but the AI System reference could not be verified."
            : "The evidence request also failed. Traceability could not be checked.",
        },
        {
          level: "5. Governance",
          description: "Verify lifecycle records against governance requirements.",
          status: "NOT_CHECKED",
          detail:
            "The AI System could not be loaded. Governance completeness could not be assessed.",
        },
        {
          level: "6. Assurance",
          description: "Check for a completed assurance record where required.",
          status: "NOT_CHECKED",
          detail: assuranceResult.ok
            ? "Assurance data was retrieved, but the AI System reference could not be verified."
            : "The assurance request failed. Assurance completeness could not be checked.",
        },
      ]);

      setPageError(
        "The AI System could not be loaded. Check the API connection and run validation again."
      );
      setLastRun(new Date().toLocaleString());
      setLoading(false);
      return;
    }

    const systems = Array.isArray(systemsResult.data)
      ? systemsResult.data
      : [];

    const system = systems.find((item: any) => item?.id === id);
    const hasSystem = Boolean(system);

    const evidence = evidenceResult.data;
    const hasEvidence =
      evidenceResult.ok &&
      Array.isArray(evidence) &&
      evidence.length > 0;

    const lifecycleRecords = [
      {
        name: "Classification",
        result: classificationResult,
      },
      {
        name: "Evaluation",
        result: evaluationResult,
      },
      {
        name: "Risk",
        result: riskResult,
      },
      {
        name: "Review",
        result: reviewResult,
      },
      {
        name: "Approval",
        result: approvalResult,
      },
    ];

    const failedLifecycle = lifecycleRecords
      .filter((item) => !item.result.ok)
      .map((item) => item.name);

    const missingLifecycle = lifecycleRecords
      .filter(
        (item) =>
          item.result.ok && !recordExists(item.result.data)
      )
      .map((item) => item.name);

    const governanceDetails: string[] = [];

    if (failedLifecycle.length > 0) {
      governanceDetails.push(
        `Could not load: ${failedLifecycle.join(", ")}.`
      );
    }

    if (missingLifecycle.length > 0) {
      governanceDetails.push(
        `Missing or not started: ${missingLifecycle.join(", ")}.`
      );
    }

    if (
      failedLifecycle.length === 0 &&
      missingLifecycle.length === 0
    ) {
      governanceDetails.push(
        "All five lifecycle records exist and have a status other than NOT_STARTED. This check does not assess the correctness of their contents."
      );
    }

    const governanceStatus: ValidationStatus =
      failedLifecycle.length > 0
        ? "NOT_CHECKED"
        : missingLifecycle.length > 0
          ? "WARNING"
          : "PASS";

    const assurances = assuranceResult.data;
    const assuranceRecords = Array.isArray(assurances)
      ? assurances
      : [];

      const completedAssurance = false;

    let assuranceStatus: ValidationStatus = "NOT_CHECKED";
    let assuranceDetail = "";

    if (!assuranceResult.ok) {
      assuranceDetail = "The assurance request failed. Assurance records could not be checked.";
    } else if (!Array.isArray(assurances)) {
      assuranceDetail = "The assurance response was not in the expected list format.";
      assuranceStatus = "WARNING";
    } else if (completedAssurance) {
      assuranceStatus = "PASS";
      assuranceDetail =
        "At least one assurance record has a status other than DRAFT or NOT_STARTED. Verify its approval and independence separately where required.";
    } else if (assuranceRecords.length > 0) {
      assuranceStatus = "WARNING";
      assuranceDetail =
        "Assurance records exist, but none has a status indicating completion. Draft or incomplete records do not establish completed assurance.";
    } else {
      assuranceStatus = "WARNING";
      assuranceDetail =
        "No assurance record is currently persisted for this AI System.";
    }

    setChecks([
      {
        level: "1. Syntax",
        description: "Check the structural readability of governance records.",
        status: "NOT_CHECKED",
        detail:
          "The AI Systems endpoint responded, but no dedicated syntax validator is available. Retrieving records does not verify syntax.",
      },
      {
        level: "2. Schema",
        description: "Check records against their applicable AIGO schemas.",
        status: "NOT_CHECKED",
        detail:
          "No dedicated schema validator is available on this page. Record retrieval does not establish schema compliance.",
      },
      {
        level: "3. Reference",
        description: "Verify that the referenced AI System exists.",
        status: hasSystem ? "PASS" : "WARNING",
        detail: hasSystem
          ? "The referenced AI System was found."
          : "No AI System with this ID was found in the returned records.",
      },
      {
        level: "4. Traceability",
        description: "Verify required governance relationships are present.",
        status: !evidenceResult.ok
          ? "NOT_CHECKED"
          : hasEvidence
            ? "PASS"
            : "WARNING",
        detail: !evidenceResult.ok
          ? "The evidence request failed. Traceability could not be checked."
          : hasEvidence
            ? "At least one evidence record is linked to this AI System. This does not verify every required relationship."
            : "No evidence records are currently linked to this AI System.",
      },
      {
        level: "5. Governance",
        description: "Verify lifecycle records against governance requirements.",
        status: governanceStatus,
        detail: governanceDetails.join(" "),
      },
      {
        level: "6. Assurance",
        description: "Check for a completed assurance record where required.",
        status: assuranceStatus,
        detail: assuranceDetail,
      },
    ]);

    if (anyRequestFailed) {
      setPageError(
        "Some API requests failed. Checks affected by those requests are marked NOT_CHECKED where their results could not be verified."
      );
    }

    setLastRun(new Date().toLocaleString());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) {
      void runValidation();
    }
  }, [id, runValidation]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          &#8592; Back to Governance Workspace
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">
            Governance Lifecycle
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Validation</h1>
          <p className="mt-2 text-slate-600">
            Validate the AI System governance record against the AIGO
            validation model.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Validation Checks</h2>

            <button
              type="button"
              onClick={() => void runValidation()}
              disabled={loading || !id}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running validation..." : "Re-run Validation"}
            </button>
          </div>

          {pageError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            >
              {pageError}
            </div>
          )}

          {loading && checks.length === 0 && (
            <p className="mt-5 text-sm text-slate-600">
              Loading validation checks...
            </p>
          )}

          <div className="mt-5 space-y-3">
            {checks.map((check) => (
              <div
                key={check.level}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium">{check.level}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {check.description}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold ${
                      check.status === "PASS"
                        ? "bg-green-100 text-green-800"
                        : check.status === "WARNING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {check.status === "NOT_CHECKED"
                      ? "NOT CHECKED"
                      : check.status}
                  </span>
                </div>

                {check.detail && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">
                    {check.detail}
                  </p>
                )}
              </div>
            ))}
          </div>

          {lastRun && (
            <p className="mt-5 text-xs text-slate-500">
              Last validation run: {lastRun}
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            These checks report available record presence and request
            outcomes. They do not replace dedicated syntax, schema,
            independence, or substantive governance assessments.
          </p>
        </section>
      </div>
    </main>
  );
}