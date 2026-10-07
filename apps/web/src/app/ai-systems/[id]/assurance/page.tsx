"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  criteria?: {
    criterionId?: string;
    source?: string;
    description?: string;
    mandatory?: boolean;
  }[];
};

export default function AssurancePage() {
  const params = useParams();
  const id = params.id as string;

  const [assurance, setAssurance] = useState<Assurance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `/api/assurances?ai_system_id=${id}`
        );

        if (!response.ok) {
          throw new Error("Unable to load assurance.");
        }

        const data = await response.json();
        const records = Array.isArray(data) ? data : data.value || [];
        setAssurance(records[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load assurance.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <main className="p-8">Loading assurance...</main>;
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

      <h1 className="mt-6 text-3xl font-semibold">Assurance</h1>
      <p className="mt-2 text-gray-600">
        Review the recorded assurance activity for this AI system.
      </p>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Assurance status</h2>
        <p className="mt-3 font-medium">
          {assurance ? "RECORDED" : "Not started"}
        </p>
      </section>

      {assurance && (
        <>
          <section className="mt-6 rounded-lg border p-6">
            <h2 className="text-xl font-semibold">
              {assurance.title || "Assurance record"}
            </h2>

            <dl className="mt-4 space-y-3">
              <div>
                <dt className="font-medium">Status</dt>
                <dd>{assurance.status || "Not specified"}</dd>
              </div>

              <div>
                <dt className="font-medium">Assurance type</dt>
                <dd>{assurance.assuranceType || "Not specified"}</dd>
              </div>

              <div>
                <dt className="font-medium">Objective</dt>
                <dd>{assurance.objective || "Not specified"}</dd>
              </div>

              <div>
                <dt className="font-medium">Scope</dt>
                <dd>{assurance.scope?.description || "Not specified"}</dd>
              </div>
            </dl>
          </section>

          {assurance.criteria?.length ? (
            <section className="mt-6 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Criteria</h2>
              <ul className="mt-4 space-y-3">
                {assurance.criteria.map((criterion, index) => (
                  <li key={criterion.criterionId || index}>
                    <strong>{criterion.criterionId || "Criterion"}</strong>
                    {" — "}
                    {criterion.description || criterion.source || "Not specified"}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}