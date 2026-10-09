
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type AssuranceCriterion = {
  criterionId?: string;
  source?: string;
  description?: string;
  mandatory?: boolean;
  status?: string;
  result?: string;
  finding?: string;
};

type AssuranceEvidence = {
  evidenceId?: string;
  title?: string;
  description?: string;
  source?: string;
  status?: string;
};

type AssuranceFinding = {
  findingId?: string;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  recommendation?: string;
};

type AssuranceAction = {
  actionId?: string;
  title?: string;
  description?: string;
  owner?: string;
  status?: string;
  dueDate?: string;
};

type Assurance = {
  id?: string;
  objectType?: string;
  objectVersion?: string;
  schemaVersion?: string;
  status?: string;
  assuranceType?: string;
  title?: string;
  objective?: string;
  aiSystemId?: string;

  scope?: {
    description?: string;
  };

  criteria?: AssuranceCriterion[];

  assessor?: string;
  assuranceOwner?: string;
  assessmentDate?: string;
  reviewPeriod?: string;
  conclusion?: string;
  overallResult?: string;
  recommendations?: string;
  nextReviewDate?: string;
  approvalAuthority?: string;
  approvedAt?: string;

  evidence?: AssuranceEvidence[];
  evidenceReviewed?: AssuranceEvidence[];
  findings?: AssuranceFinding[];
  actions?: AssuranceAction[];
};

function displayValue(value?: string | null): string {
  const cleaned = value?.trim();
  return cleaned || "Not recorded";
}

function formatDate(value?: string): string {
  if (!value?.trim()) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function statusStyle(status?: string) {
  const normalized = status?.toUpperCase();

  if (normalized === "PASSED" || normalized === "APPROVED") {
    return "border-green-200 bg-green-50 text-green-800";
  }

  if (
    normalized === "FAILED" ||
    normalized === "REJECTED" ||
    normalized === "OVERDUE"
  ) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (
    normalized === "IN_PROGRESS" ||
    normalized === "UNDER_REVIEW" ||
    normalized === "PENDING"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  return "border-gray-200 bg-gray-100 text-gray-700";
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-900">
        {displayValue(value)}
      </dd>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
      {children}
    </p>
  );
}

export default function AssurancePage() {
  const params = useParams();
  const id = params.id as string;

  const [assurance, setAssurance] = useState<Assurance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/assurances?ai_system_id=${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          throw new Error("Unable to load assurance. Please try again.");
        }

        const data = await response.json();
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        if (!cancelled) {
          setAssurance(records[0] || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load assurance."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    } else {
      setLoading(false);
      setError("The AI system identifier is missing.");
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6 sm:p-8">
        <p className="text-sm text-gray-600">Loading assurance report...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6 sm:p-8">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-blue-700 underline"
        >
          ← Back to Governance Workspace
        </Link>

        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        >
          {error}
        </div>
      </main>
    );
  }

  const evidence = assurance?.evidenceReviewed ?? assurance?.evidence ?? [];
  const findings = assurance?.findings ?? [];
  const actions = assurance?.actions ?? [];
  const criteria = assurance?.criteria ?? [];

  const status = assurance
    ? displayValue(assurance.status)
    : "Not started";

  const result = assurance
    ? displayValue(assurance.overallResult)
    : "Not recorded";

  const isNotStarted =
    !assurance ||
    ["NOT_STARTED", "NOT STARTED", "DRAFT"].includes(
      assurance.status?.toUpperCase() || ""
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 sm:p-8">
      <header>
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm font-medium text-blue-700 underline underline-offset-4"
        >
          ← Back to Governance Workspace
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Governance Lifecycle / Report
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
              Assurance Report
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Review the recorded assurance activity, supporting evidence,
              findings, conclusions, and follow-up actions for this AI system.
            </p>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-medium ${statusStyle(
              assurance?.status
            )}`}
          >
            {status}
          </span>
        </div>
      </header>

      {!assurance && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">
            Assurance has not started
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            No assurance record was returned for this AI system. Assessment
            details, evidence, findings, and conclusions are therefore not
            available. This does not mean that the system has passed or failed
            an assurance assessment.
          </p>
        </div>
      )}

      <Section
        title="1. Assurance summary"
        description="Identification and current recorded state of the assurance activity."
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Assurance ID" value={assurance?.id} />
          <Field label="Assurance title" value={assurance?.title} />
          <Field label="Assurance type" value={assurance?.assuranceType} />
          <Field label="Record status" value={assurance?.status} />
          <Field label="Overall result" value={assurance?.overallResult} />
          <Field label="AI system ID" value={assurance?.aiSystemId || id} />
          <Field label="Objective" value={assurance?.objective} />
          <Field
            label="Scope"
            value={assurance?.scope?.description}
          />
        </dl>
      </Section>

      <Section
        title="2. Assessment details"
        description="Who performed or owns the assessment, and when it took place."
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Assessor" value={assurance?.assessor} />
          <Field label="Assurance owner" value={assurance?.assuranceOwner} />
          <Field
            label="Assessment date"
            value={formatDate(assurance?.assessmentDate)}
          />
          <Field label="Review period" value={assurance?.reviewPeriod} />
          <Field
            label="Approval authority"
            value={assurance?.approvalAuthority}
          />
          <Field
            label="Approval date"
            value={formatDate(assurance?.approvedAt)}
          />
        </dl>
      </Section>

      <Section
        title="3. Assurance criteria"
        description="Criteria recorded for evaluating the AI system and its governance arrangements."
      >
        {criteria.length === 0 ? (
          <EmptyState>
            No assurance criteria are recorded. The assessment criteria need
            to be defined or linked before a conclusion can be substantiated.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {criteria.map((criterion, index) => (
              <article
                key={criterion.criterionId || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-medium text-gray-900">
                    {criterion.criterionId || `Criterion ${index + 1}`}
                  </h3>
                  {typeof criterion.mandatory === "boolean" && (
                    <span className="text-xs text-gray-500">
                      {criterion.mandatory ? "Mandatory" : "Optional"}
                    </span>
                  )}
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {displayValue(criterion.description || criterion.source)}
                </p>

                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Source" value={criterion.source} />
                  <Field label="Recorded status" value={criterion.status} />
                  <Field label="Result" value={criterion.result} />
                  <Field label="Finding" value={criterion.finding} />
                </dl>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="4. Evidence reviewed"
        description="Evidence supporting the assessment and its conclusions."
      >
        {evidence.length === 0 ? (
          <EmptyState>
            No evidence reviewed is recorded in the available assurance
            record. Evidence should be linked or documented before claiming
            that the relevant criteria have been verified.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {evidence.map((item, index) => (
              <article
                key={item.evidenceId || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="font-medium text-gray-900">
                  {displayValue(item.title || item.evidenceId)}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {displayValue(item.description)}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Evidence ID" value={item.evidenceId} />
                  <Field label="Source" value={item.source} />
                  <Field label="Evidence status" value={item.status} />
                </dl>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="5. Governance coverage"
        description="Governance areas that should be considered as part of the assurance review."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              title: "Risk management",
              detail:
                "Review risk assessments, treatment decisions, and residual risks.",
            },
            {
              title: "Controls",
              detail:
                "Review control design, implementation evidence, and effectiveness.",
            },
            {
              title: "Validation",
              detail:
                "Review test results, limitations, and unresolved validation checks.",
            },
            {
              title: "Monitoring",
              detail:
                "Review monitoring objectives, indicators, results, and escalation records.",
            },
            {
              title: "Incidents",
              detail:
                "Review incident records, investigations, corrective actions, and closure evidence.",
            },
            {
              title: "Change management",
              detail:
                "Review approvals, testing, deployment records, and rollback readiness.",
            },
            {
              title: "Review and reassessment",
              detail:
                "Review recorded reviews, reassessment triggers, and outstanding requirements.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-gray-200 p-4"
            >
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.detail}
              </p>
              <p className="mt-3 text-xs font-medium text-gray-500">
                Coverage result: Not recorded in this report
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          These are recommended coverage areas, not verified findings. This
          page does not independently inspect or verify the underlying records.
        </p>
      </Section>

      <Section
        title="6. Findings and recommendations"
        description="Documented assurance findings, their significance, and recommended responses."
      >
        {findings.length === 0 ? (
          <EmptyState>
            No assurance findings are recorded in the available record. This
            means findings are unavailable here; it does not establish that
            no issues exist.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <article
                key={finding.findingId || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-medium text-gray-900">
                    {finding.title || finding.findingId || `Finding ${index + 1}`}
                  </h3>
                  {finding.severity && (
                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(
                        finding.severity
                      )}`}
                    >
                      {finding.severity}
                    </span>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {displayValue(finding.description)}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Finding ID" value={finding.findingId} />
                  <Field label="Status" value={finding.status} />
                  <Field
                    label="Recommendation"
                    value={finding.recommendation}
                  />
                </dl>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5">
          <Field
            label="Overall recommendations"
            value={assurance?.recommendations}
          />
        </div>
      </Section>

      <Section
        title="7. Conclusion"
        description="The recorded assurance conclusion and the basis for it."
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="Overall result" value={result} />
          <Field label="Record status" value={assurance?.status} />
          <div className="sm:col-span-2">
            <Field label="Conclusion and rationale" value={assurance?.conclusion} />
          </div>
        </dl>

        {isNotStarted && (
          <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            No completed assurance conclusion is established by the current
            record. Do not interpret missing results as a pass.
          </p>
        )}
      </Section>

      <Section
        title="8. Follow-up actions"
        description="Actions arising from assurance findings and the planned follow-up."
      >
        {actions.length === 0 ? (
          <EmptyState>
            No assurance follow-up actions are recorded in the available
            record. If findings require corrective work, record the actions,
            owners, due dates, and completion evidence in the appropriate
            workflow.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <article
                key={action.actionId || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="font-medium text-gray-900">
                  {action.title || action.actionId || `Action ${index + 1}`}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {displayValue(action.description)}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Action ID" value={action.actionId} />
                  <Field label="Owner" value={action.owner} />
                  <Field label="Status" value={action.status} />
                  <Field
                    label="Due date"
                    value={formatDate(action.dueDate)}
                  />
                </dl>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Next assurance review"
            value={formatDate(assurance?.nextReviewDate)}
          />
          <Field
            label="Approval authority"
            value={assurance?.approvalAuthority}
          />
        </div>
      </Section>

      <footer className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-semibold text-gray-900">
          Report limitations
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This report displays information returned by the existing assurance
          endpoint. Sections marked “Not recorded” may be unavailable because
          the relevant information has not been entered, is stored elsewhere,
          or is not exposed by the current API response. Governance coverage
          labels are not verification results. Confirm the underlying records
          and evidence before relying on an assurance conclusion.
        </p>
      </footer>
    </main>
  );
}