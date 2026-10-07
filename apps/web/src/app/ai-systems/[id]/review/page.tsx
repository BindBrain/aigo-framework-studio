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

type EvaluationRequest = {
  evaluation_purpose?: string | null;
  governance_context?: string | null;
  evaluation_scope?: string | null;
  evaluation_trigger?: string | null;
};

type GovernanceRule = {
  id: string;
  name: string;
  description?: string | null;
  source?: string | null;
  applicability?: string | null;
};

type Review = {
  id: string;
  objectType?: string;
  objectVersion?: string;
  schemaVersion?: string;
  status?: string;
  reviewType?: string;
  ai_system_id?: string;
  review_scope?: string | null;
  review_notes?: string | null;
  review_outcome?: string;
  created_at?: string;
};

export default function ReviewPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationRequest | null>(null);
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewScope, setReviewScope] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewOutcome, setReviewOutcome] = useState("NOT_ASSESSED");
  const [savingReview, setSavingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReviewData() {
    try {
      const [systemsResponse, evaluationResponse, rulesResponse, reviewResponse] =
        await Promise.all([
          fetch("http://127.0.0.1:8000/ai-systems"),
          fetch(`http://127.0.0.1:8000/ai-systems/${id}/evaluation`),
          fetch(`http://127.0.0.1:8000/ai-systems/${id}/rules`),
          fetch(`http://127.0.0.1:8000/ai-systems/${id}/review`),
        ]);

      if (!systemsResponse.ok) {
        throw new Error("Unable to load AI systems.");
      }

      if (!evaluationResponse.ok) {
        throw new Error("Unable to load evaluation request.");
      }

      if (!rulesResponse.ok) {
        throw new Error("Unable to load governance rules.");
      }

      if (!reviewResponse.ok) {
        throw new Error("Unable to load review history.");
      }

      const systems: AISystem[] = await systemsResponse.json();
      const evaluationData: EvaluationRequest =
        await evaluationResponse.json();
      const rulesData = await rulesResponse.json();
      const reviewData = await reviewResponse.json();

      const found = systems.find((item) => item.id === id);

      if (!found) {
        throw new Error("AI system not found.");
      }

      setSystem(found);
      setEvaluation(evaluationData);
      setRules(rulesData.value || rulesData.rules || []);
      setReviews(
        Array.isArray(reviewData)
          ? reviewData
          : reviewData.value || []
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load review data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviewData();
  }, [id]);

  async function saveReview() {
    setError("");

    if (!reviewScope.trim()) {
      setError("Review scope is required.");
      return;
    }

    setSavingReview(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DRAFT",
            reviewType: "GOVERNANCE_REVIEW",
            objectVersion: "0.1",
            schemaVersion: "0.1",
            ai_system_id: id,
            review_scope: reviewScope.trim(),
            review_notes: reviewNotes.trim() || null,
            review_outcome: reviewOutcome,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unable to save review: ${errorText}`);
      }

      setReviewScope("");
      setReviewNotes("");
      setReviewOutcome("NOT_ASSESSED");
      await loadReviewData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save review."
      );
    } finally {
      setSavingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-8 py-10">
        <div className="mx-auto max-w-6xl text-sm text-[#737b87]">
          Loading review workspace...
        </div>
      </main>
    );
  }

  if (error || !system) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-8 py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/ai-systems/${id}`}
            className="text-sm text-[#626b77] hover:text-[#18202b]"
          >
            ← Back to Governance Workspace
          </Link>

          <div className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6 text-sm text-[#a33a3a]">
            {error || "AI system not found."}
          </div>
        </div>
      </main>
    );
  }

  const hasEvaluation =
    Boolean(evaluation?.evaluation_purpose) ||
    Boolean(evaluation?.governance_context) ||
    Boolean(evaluation?.evaluation_scope);

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-[#626b77] hover:text-[#18202b]"
        >
          ← Back to Governance Workspace
        </Link>

        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#9299a3]">
            Governance Review
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#18202b]">
            Review
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#626b77]">
            Record governance reviews as chronological, traceable records.
            Saved reviews are retained as history rather than overwritten.
          </p>
        </div>

        <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.1em] text-[#9299a3]">
                AI System
              </div>

              <h2 className="mt-2 text-lg font-semibold text-[#18202b]">
                {system.name}
              </h2>

              <p className="mt-1 text-sm text-[#737b87]">
                {system.purpose}
              </p>
            </div>

            <span className="rounded bg-[#f1f3f5] px-2 py-1 text-xs font-medium text-[#626b77]">
              {system.lifecycle_status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#edf0f2] pt-5 sm:grid-cols-3">
            <div>
              <div className="text-xs text-[#9299a3]">Owner</div>
              <div className="mt-1 text-sm font-medium text-[#18202b]">
                {system.owner}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#9299a3]">Provider</div>
              <div className="mt-1 text-sm font-medium text-[#18202b]">
                {system.provider || "Not specified"}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#9299a3]">Model</div>
              <div className="mt-1 text-sm font-medium text-[#18202b]">
                {system.model || "Not specified"}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#18202b]">
                Evaluation Request
              </h2>

              <p className="mt-1 text-sm text-[#737b87]">
                The evaluation context that the review is based on.
              </p>
            </div>

            <span className="rounded bg-[#f1f3f5] px-2 py-1 text-xs font-medium text-[#626b77]">
              {evaluation?.evaluation_trigger || "Not specified"}
            </span>
          </div>

          {hasEvaluation ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <div className="text-xs text-[#9299a3]">
                  Evaluation purpose
                </div>
                <div className="mt-1 text-sm leading-6 text-[#18202b]">
                  {evaluation?.evaluation_purpose || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-xs text-[#9299a3]">
                  Governance context
                </div>
                <div className="mt-1 text-sm leading-6 text-[#18202b]">
                  {evaluation?.governance_context || "Not specified"}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-xs text-[#9299a3]">
                  Evaluation scope
                </div>
                <div className="mt-1 text-sm leading-6 text-[#18202b]">
                  {evaluation?.evaluation_scope || "Not specified"}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-[#dfe3e8] bg-[#fafbfc] p-5 text-sm text-[#737b87]">
              No evaluation request has been configured for this AI system.
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.1em] text-[#9299a3]">
              New Review
            </div>

            <h2 className="mt-2 text-base font-semibold text-[#18202b]">
              Record a governance review
            </h2>

            <p className="mt-1 text-sm text-[#737b87]">
              Each save creates a new review record. Previous reviews remain
              unchanged in the history below.
            </p>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-[#18202b]">
                Review scope
              </label>
              <textarea
                value={reviewScope}
                onChange={(event) => setReviewScope(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[#9299a3]"
                placeholder="What is being reviewed?"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#18202b]">
                Review notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-[#d8dde3] px-3 py-2 text-sm outline-none focus:border-[#9299a3]"
                placeholder="Record observations, decisions, or conditions."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#18202b]">
                Review outcome
              </label>
              <select
                value={reviewOutcome}
                onChange={(event) => setReviewOutcome(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[#9299a3]"
              >
                <option value="NOT_ASSESSED">Not assessed</option>
                <option value="EFFECTIVE">Effective</option>
                <option value="GENERALLY_EFFECTIVE">Generally effective</option>
                <option value="PARTIALLY_EFFECTIVE">Partially effective</option>
                <option value="INEFFECTIVE">Ineffective</option>
                <option value="REQUIRES_REASSESSMENT">
                  Requires reassessment
                </option>
              </select>
            </div>

            {error && (
              <div className="rounded-md border border-[#ead1d1] bg-[#fff8f8] px-4 py-3 text-sm text-[#a33a3a]">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={savingReview}
              onClick={saveReview}
              className="rounded-lg bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#303844] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingReview ? "Saving..." : "Save Review"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.1em] text-[#9299a3]">
                Review History
              </div>

              <h2 className="mt-2 text-base font-semibold text-[#18202b]">
                Chronological review records
              </h2>

              <p className="mt-1 text-sm text-[#737b87]">
                Saved reviews are read-only history records.
              </p>
            </div>

            <span className="rounded bg-[#f1f3f5] px-2 py-1 text-xs font-medium text-[#626b77]">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>

          {reviews.length > 0 ? (
            <div className="mt-5 space-y-4">
              {reviews.map((review, index) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-[#e5e7eb] bg-[#fafbfc] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#9299a3]">
                        Review {reviews.length - index}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-[#18202b]">
                        {review.reviewType || "GOVERNANCE_REVIEW"}
                      </div>
                    </div>

                    <span className="rounded bg-white px-2 py-1 text-xs font-medium text-[#626b77]">
                      {review.review_outcome || "NOT_ASSESSED"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-[#9299a3]">Review ID</div>
                      <div className="mt-1 break-all text-xs text-[#626b77]">
                        {review.id}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[#9299a3]">Status</div>
                      <div className="mt-1 text-sm text-[#18202b]">
                        {review.status || "Not specified"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[#9299a3]">Recorded</div>
                      <div className="mt-1 text-sm text-[#18202b]">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleString()
                          : "Recorded"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#e5e7eb] pt-4">
                    <div className="text-xs text-[#9299a3]">Review scope</div>
                    <div className="mt-1 text-sm leading-6 text-[#18202b]">
                      {review.review_scope || "Not specified"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-[#9299a3]">Review notes</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#626b77]">
                      {review.review_notes || "No notes recorded."}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-[#dfe3e8] bg-[#fafbfc] p-5 text-sm text-[#737b87]">
              No review records have been saved yet.
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <div>
            <h2 className="text-base font-semibold text-[#18202b]">
              Governance Rules
            </h2>

            <p className="mt-1 text-sm text-[#737b87]">
              Rules currently included in the evaluation scope.
            </p>
          </div>

          {rules.length > 0 ? (
            <div className="mt-5 space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-md border border-[#e5e7eb] bg-[#fafbfc] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#18202b]">
                        {rule.name}
                      </h3>
                      <div className="mt-1 text-xs text-[#9299a3]">
                        {rule.id}
                      </div>
                    </div>

                    {rule.source && (
                      <span className="text-xs text-[#9299a3]">
                        {rule.source}
                      </span>
                    )}
                  </div>

                  {rule.description && (
                    <p className="mt-2 text-sm leading-6 text-[#626b77]">
                      {rule.description}
                    </p>
                  )}

                  {rule.applicability && (
                    <div className="mt-3 text-xs text-[#737b87]">
                      Applicability: {rule.applicability}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-[#dfe3e8] bg-[#fafbfc] p-5 text-sm text-[#737b87]">
              No governance rules have been configured for this AI system.
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Evaluation Results", "No rule results have been recorded yet."],
            ["Evidence", "No review evidence has been recorded yet."],
            ["Review Requirements", "No review requirements have been identified yet."],
            ["Actions", "No review actions have been recorded yet."],
            ["Governance Decisions", "No governance decisions have been recorded yet."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-lg border border-[#e1e5e9] bg-white p-5"
            >
              <h3 className="text-sm font-semibold text-[#18202b]">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#737b87]">
                {description}
              </p>

              <div className="mt-4 text-xs font-medium text-[#9299a3]">
                Not started
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}