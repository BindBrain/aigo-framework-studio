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

export default function ReassessmentPage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<ReassessmentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `/api/ai-systems/${id}/evaluation`
        );

        if (!response.ok) {
          throw new Error("Unable to load evaluation.");
        }

        const data = await response.json();
        setProfile(data.reassessment || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load reassessment.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <main className="p-8">Loading reassessment...</main>;
  }

  if (error) {
    return <main className="p-8">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link
        href={`/ai-systems/${id}`}
        className="text-sm underline"
      >
        ← Back to Governance Workspace
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Reassessment</h1>
      <p className="mt-2 text-gray-600">
        Review the reassessment profile associated with the current governance assessment.
      </p>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Reassessment status</h2>
        <p className="mt-3 font-medium">
          {profile?.required ? "REQUIRED" : "Not required"}
        </p>
      </section>

      {profile && (
        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Profile</h2>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="font-medium">Trigger</dt>
              <dd>{profile.trigger || "Not specified"}</dd>
            </div>

            <div>
              <dt className="font-medium">Frequency</dt>
              <dd>{profile.frequency || "Not specified"}</dd>
            </div>

            <div>
              <dt className="font-medium">Next assessment date</dt>
              <dd>{profile.nextAssessmentDate || "Not specified"}</dd>
            </div>

            <div>
              <dt className="font-medium">Next review date</dt>
              <dd>{profile.nextReviewDate || "Not specified"}</dd>
            </div>

            <div>
              <dt className="font-medium">Review owner</dt>
              <dd>{profile.reviewOwner?.role || "Not specified"}</dd>
            </div>
          </dl>
        </section>
      )}

      {profile?.triggeredReviewCriteria?.length ? (
        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Triggered review criteria</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {profile.triggeredReviewCriteria.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}