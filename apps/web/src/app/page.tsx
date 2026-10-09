"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StudioSidebar from "@/components/StudioSidebar";

const API_BASE = "/api";

const lifecycle = [
  "Register",
  "Classify",
  "Evaluate",
  "Review",
  "Approve",
  "Validate",
  "Monitor",
  "Reassess",
];

type AISystem = {
  id: string;
  name?: string;
  systemName?: string;
};

type Evaluation = {
  status?: string;
};

type Review = {
  id: string;
  status?: string;
  reviewType?: string;
};

type Incident = {
  id: string;
  incidentTitle?: string;
  status?: string;
  severity?: string;
};

type Activity = {
  systemId: string;
  systemName: string;
  type: string;
  title: string;
  status: string;
};

export default function Home() {
  const [aiSystemCount, setAiSystemCount] = useState(0);
  const [evaluationCount, setEvaluationCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [openActionCount, setOpenActionCount] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const systemsResponse = await fetch(`${API_BASE}/ai-systems`);
        const systemsData = await systemsResponse.json();
        const systems: AISystem[] = Array.isArray(systemsData)
          ? systemsData
          : systemsData?.value ?? [];

        setAiSystemCount(systems.length);

        const results = await Promise.all(
          systems.map(async (system) => {
            const [evaluationResponse, reviewResponse, incidentResponse] =
              await Promise.all([
                fetch(`${API_BASE}/ai-systems/${system.id}/evaluation`),
                fetch(`${API_BASE}/ai-systems/${system.id}/review`),
                fetch(`${API_BASE}/ai-systems/${system.id}/incidents`),
              ]);

            const evaluation: Evaluation = evaluationResponse.ok
              ? await evaluationResponse.json()
              : {};

            const reviewData = reviewResponse.ok
              ? await reviewResponse.json()
              : { value: [] };

            const incidentData = incidentResponse.ok
              ? await incidentResponse.json()
              : { value: [] };

            const reviews: Review[] = Array.isArray(reviewData)
              ? reviewData
              : reviewData?.value ?? [];

            const incidents: Incident[] = Array.isArray(incidentData)
              ? incidentData
              : incidentData?.value ?? [];

            const systemName =
              system.name || system.systemName || system.id;

            const systemActivity: Activity[] = [];

            if (
              evaluation.status &&
              evaluation.status !== "NOT_STARTED"
            ) {
              systemActivity.push({
                systemId: system.id,
                systemName,
                type: "Evaluation",
                title: "Governance evaluation",
                status: evaluation.status,
              });
            }

            reviews.forEach((review) => {
              systemActivity.push({
                systemId: system.id,
                systemName,
                type: "Review",
                title: "Governance review",
                status: review.status || "UNKNOWN",
              });
            });

            incidents.forEach((incident) => {
              systemActivity.push({
                systemId: system.id,
                systemName,
                type: "Incident",
                title:
                  incident.incidentTitle ||
                  "Governance incident",
                status: incident.status || "UNKNOWN",
              });
            });

            return {
              evaluationActive:
                !!evaluation.status &&
                evaluation.status !== "NOT_STARTED",
              reviewCount: reviews.length,
              openIncidents: incidents.filter(
                (incident) =>
                  ![
                    "CLOSED",
                    "CLOSED_WITH_CONDITIONS",
                  ].includes(incident.status || "")
              ).length,
              activity: systemActivity,
            };
          })
        );

        setEvaluationCount(
          results.filter((item) => item.evaluationActive).length
        );

        setReviewCount(
          results.reduce((total, item) => total + item.reviewCount, 0)
        );

        setOpenActionCount(
          results.reduce((total, item) => total + item.openIncidents, 0)
        );

        setActivity(
          results
            .flatMap((item) => item.activity)
            .slice(0, 6)
        );
      } catch {
        setAiSystemCount(0);
        setEvaluationCount(0);
        setReviewCount(0);
        setOpenActionCount(0);
        setActivity([]);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#18202b]">
      <div className="flex min-h-screen">
        <StudioSidebar />

        <main className="min-w-0 flex-1">
          <header className="flex h-[68px] items-center justify-between border-b border-[#dfe3e8] bg-white px-5 sm:px-8">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9299a3]">
                Workspace
              </div>
              <div className="mt-0.5 text-sm font-semibold">
                AIGO Governance
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://docs.aigoframework.com"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-md border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#626b77] hover:bg-[#f7f8f9] sm:block"
              >
                Documentation
              </a>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-xs font-semibold text-[#4e5763]"
                aria-label="User profile"
              >
                AD
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7b838e]">
                    Governance workspace
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-[#18202b] sm:text-3xl">
                    Governance Overview
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68717d]">
                    Operate the AIGO governance lifecycle across AI systems,
                    evaluations, decisions, evidence, monitoring and assurance.
                  </p>
                </div>

                <Link
                  href="/ai-systems/register"
                  className="w-fit rounded-md bg-[#18202b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#27313e]"
                >
                  Register AI System
                </Link>
              </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/ai-systems"
                className="block border border-[#dfe3e8] bg-white p-5 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]"
              >
                <div className="text-xs font-medium text-[#737c88]">
                  AI Systems
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">
                  {aiSystemCount}
                </div>
                <div className="mt-1 text-xs text-[#969da6]">
                  Registered systems
                </div>
              </Link>

              <Link
                href="/ai-systems"
                className="block border border-[#dfe3e8] bg-white p-5 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]"
              >
                <div className="text-xs font-medium text-[#737c88]">
                  Evaluations
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">
                  {evaluationCount}
                </div>
                <div className="mt-1 text-xs text-[#969da6]">
                  Active evaluations
                </div>
              </Link>

              <Link
                href="/ai-systems"
                className="block border border-[#dfe3e8] bg-white p-5 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]"
              >
                <div className="text-xs font-medium text-[#737c88]">
                  Reviews
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">
                  {reviewCount}
                </div>
                <div className="mt-1 text-xs text-[#969da6]">
                  Recorded governance reviews
                </div>
              </Link>

              <Link
                href="/ai-systems"
                className="block border border-[#dfe3e8] bg-white p-5 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]"
              >
                <div className="text-xs font-medium text-[#737c88]">
                  Open Actions
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">
                  {openActionCount}
                </div>
                <div className="mt-1 text-xs text-[#969da6]">
                  Open governance incidents
                </div>
              </Link>
            </section>

            <section className="mt-7 border border-[#dfe3e8] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
                <div className="text-sm font-semibold">
                  AIGO Governance Lifecycle
                </div>

                <div className="mt-1 text-xs text-[#7b838e]">
                  The operational sequence for governing an AI system.
                </div>
              </div>

              <div className="overflow-x-auto px-5 py-7 sm:px-6">
                <div className="flex min-w-[850px] items-center">
                  {lifecycle.map((stage, index) => (
                    <div
                      key={stage}
                      className="flex flex-1 items-center"
                    >
                      <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd5dc] bg-white text-xs font-semibold text-[#4f5864]">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="mt-3 text-xs font-semibold text-[#343d48]">
                          {stage}
                        </div>
                      </div>

                      {index < lifecycle.length - 1 && (
                        <div className="h-px w-full max-w-[55px] bg-[#d8dde3]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-7 grid gap-7 xl:grid-cols-[1.35fr_0.65fr]">
              <section className="border border-[#dfe3e8] bg-white">
                <div className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
                  <div className="text-sm font-semibold">
                    Recent Governance Activity
                  </div>

                  <div className="mt-1 text-xs text-[#7b838e]">
                    Current governance records across the workspace.
                  </div>
                </div>

                {activity.length === 0 ? (
                  <div className="flex min-h-[180px] items-center justify-center px-6 py-10 text-center">
                    <div>
                      <div className="text-sm font-medium text-[#4e5864]">
                        No governance activity recorded
                      </div>

                      <div className="mt-2 max-w-sm text-xs leading-5 text-[#9299a3]">
                        Activity will appear here as evaluations, reviews and
                        incidents are recorded.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-[#edf0f2]">
                    {activity.map((item, index) => (
                      <Link
                        key={`${item.systemId}-${item.type}-${item.title}-${index}`}
                        href={`/ai-systems/${item.systemId}`}
                        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#fafbfc] sm:px-6"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#343d48]">
                            {item.title}
                          </div>
                          <div className="mt-1 text-xs text-[#8a929c]">
                            {item.systemName} · {item.type}
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-[#dfe3e8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#69727d]">
                          {item.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="border border-[#dfe3e8] bg-white">
  <div className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
    <div className="text-sm font-semibold">Governance at a Glance</div>
    <div className="mt-1 text-xs text-[#7b838e]">
      Quick access to the governance records and workspaces managed in AIGO Studio.
    </div>
  </div>

  <div className="grid gap-3 p-5 sm:grid-cols-2 sm:px-6">
    <Link href="/ai-systems" className="group border border-[#e5e7eb] p-4 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#343d48]">AI Systems</span>
        <span className="text-xs font-medium text-[#7b838e]">Open</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#7b838e]">Manage registered systems and open their governance lifecycle.</p>
      <span className="mt-3 inline-block text-xs font-medium text-[#525d6a]">Open workspace</span>
    </Link>

    <Link href="/rules" className="group border border-[#e5e7eb] p-4 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#343d48]">Governance Rules</span>
        <span className="text-xs font-medium text-[#7b838e]">Open</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#7b838e]">View and manage the governance rules recorded in the workspace.</p>
      <span className="mt-3 inline-block text-xs font-medium text-[#525d6a]">Open rules</span>
    </Link>

    <Link href="/evidence" className="group border border-[#e5e7eb] p-4 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#343d48]">Evidence</span>
        <span className="text-xs font-medium text-[#7b838e]">Open</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#7b838e]">Access the evidence workspace and its recorded supporting material.</p>
      <span className="mt-3 inline-block text-xs font-medium text-[#525d6a]">Open evidence</span>
    </Link>

    <Link href="/assurance" className="group border border-[#e5e7eb] p-4 transition-colors hover:border-[#c7cdd5] hover:bg-[#fafbfc]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#343d48]">Assurance</span>
        <span className="text-xs font-medium text-[#7b838e]">Open</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#7b838e]">Review assurance records and create an initial assurance draft.</p>
      <span className="mt-3 inline-block text-xs font-medium text-[#525d6a]">Open assurance</span>
    </Link>
  </div>

  <div className="border-t border-[#edf0f2] px-5 py-3 sm:px-6">
    <p className="text-[11px] leading-5 text-[#9299a3]">
      Open a workspace to review its records. Links do not imply that a governance activity is complete or compliant.
    </p>
  </div>
</section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}