
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ReassessmentProfile = {
  required?: boolean;
  trigger?: string;
  assessmentId?: string;
  nextAssessmentDate?: string;
  frequency?: string;
  nextReviewDate?: string;
  reviewOwner?: {
    role?: string;
  };
  triggeredReviewCriteria?: string[];
};

type ReassessmentReport = {
  required: boolean;
  trigger: string;
  nextAssessmentDate: string;
  frequency: string;
  nextReviewDate: string;
  reviewOwner: {
    role: string;
  };
  triggeredReviewCriteria: string[];
};

const DEFAULT_PROFILE: ReassessmentReport = {
  required: true,
  trigger: "Material change",
  frequency: "Annual",
  nextAssessmentDate: "2026-10-08",
  nextReviewDate: "2026-11-08",
  reviewOwner: {
    role: "Governance Owner",
  },
  triggeredReviewCriteria: [
    "Material change to the AI system or its intended use",
    "Significant change to the underlying model or provider",
    "Change in data sources or approved knowledge sources",
    "Significant incident or recurring governance issue",
    "Material change to applicable governance requirements",
    "Significant change to human oversight arrangements",
    "Evidence of degraded response quality or unexpected system behaviour",
  ],
};

function formatDate(value?: string): string {
  if (!value) return "Not specified";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  return `${match[3]}/${match[2]}/${match[1]}`;
}

export default function ReassessmentPage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<ReassessmentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/ai-systems/${id}/evaluation`,
        );

        if (!response.ok) {
          throw new Error("Unable to load the reassessment report.");
        }

        const data = await response.json();

        if (!cancelled) {
          setProfile(data.reassessment || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the reassessment report.",
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
      setError("AI system ID is missing.");
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const report: ReassessmentReport = {
    required: profile?.required ?? DEFAULT_PROFILE.required,
    trigger: profile?.trigger || DEFAULT_PROFILE.trigger,
    frequency: profile?.frequency || DEFAULT_PROFILE.frequency,
    nextAssessmentDate:
      profile?.nextAssessmentDate ||
      DEFAULT_PROFILE.nextAssessmentDate,
    nextReviewDate:
      profile?.nextReviewDate || DEFAULT_PROFILE.nextReviewDate,
    reviewOwner: {
      role:
        profile?.reviewOwner?.role ||
        DEFAULT_PROFILE.reviewOwner.role,
    },
    triggeredReviewCriteria:
      profile?.triggeredReviewCriteria?.length
        ? profile.triggeredReviewCriteria
        : DEFAULT_PROFILE.triggeredReviewCriteria,
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-5xl">
          Loading reassessment report...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/ai-systems/${id}`}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            &#8592; Back to Governance Workspace
          </Link>

          <section className="mt-6 rounded-xl border border-red-200 bg-white p-6">
            <h1 className="text-xl font-semibold">
              Unable to load report
            </h1>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <p className="mt-2 text-sm text-slate-600">
              Refresh the page or try again later.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          &#8592; Back to Governance Workspace
        </Link>

        <header className="mt-6">
          <p className="text-sm font-medium text-slate-500">
            Governance Lifecycle / Report
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Reassessment
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Review the reassessment profile associated with the current
            governance assessment, including scheduled dates, ownership,
            and events that should trigger a review.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Reassessment status
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {report.required ? "REQUIRED" : "NOT REQUIRED"}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {report.required
                  ? "A reassessment is required under the current profile."
                  : "The current profile does not require reassessment."}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                report.required
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {report.required
                ? "Action required"
                : "No action required"}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Profile</h2>

          <p className="mt-1 text-sm text-slate-500">
            Current reassessment schedule and responsible owner.
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Trigger</dt>
              <dd className="mt-2 font-semibold">{report.trigger}</dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Frequency</dt>
              <dd className="mt-2 font-semibold">{report.frequency}</dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Review owner</dt>
              <dd className="mt-2 font-semibold">
                {report.reviewOwner.role}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-sm text-slate-500">
                Next assessment date
              </dt>
              <dd className="mt-2 text-lg font-semibold">
                {formatDate(report.nextAssessmentDate)}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-sm text-slate-500">
                Next review date
              </dt>
              <dd className="mt-2 text-lg font-semibold">
                {formatDate(report.nextReviewDate)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Triggered review criteria
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Events or changes that should prompt a reassessment review.
          </p>

          <ul className="mt-5 space-y-3">
            {report.triggeredReviewCriteria.map((criterion, index) => (
              <li
                key={criterion}
                className="flex items-start gap-3 rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>

                <span className="pt-1 text-sm leading-6 text-slate-700">
                  {criterion}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-xs leading-5 text-slate-500">
          This page is a read-only report. If no reassessment profile is
          returned by the API, the displayed fallback values are
          illustrative configuration and do not confirm that a
          reassessment has been performed or completed.
        </p>
      </div>
    </main>
  );
}