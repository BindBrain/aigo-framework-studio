"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StudioSidebar from "@/components/StudioSidebar";

type AISystem = {
  id: string;
  name?: string;
  systemName?: string;
};

type Assurance = {
  id: string;
  objectType: string;
  objectVersion: string;
  schemaVersion: string;
  status: string;
  assuranceType: string;
  title?: string | null;
  aiSystemId?: string | null;
  objective: string;
  scope: {
    description: string;
  };
  criteria: Array<{
    criterionId: string;
    source: string;
    description?: string;
    mandatory?: boolean;
  }>;
};

const API_BASE = "/api";

export default function AssurancePage() {
  const [assurances, setAssurances] = useState<Assurance[]>([]);
  const [aiSystems, setAiSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Assurance | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/assurances`).then((response) => response.json()),
      fetch(`${API_BASE}/ai-systems`).then((response) => response.json()),
    ])
      .then(([assuranceData, aiSystemData]) => {
        setAssurances(Array.isArray(assuranceData) ? assuranceData : []);
        const systems = Array.isArray(aiSystemData)
          ? aiSystemData
          : aiSystemData?.value ?? [];
        setAiSystems(systems);
      })
      .catch(() => {
        setAssurances([]);
        setAiSystems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSystemName = (aiSystemId?: string | null) => {
    if (!aiSystemId) return "Not linked";
    const system = aiSystems.find((item) => item.id === aiSystemId);
    return system?.name || system?.systemName || aiSystemId;
  };

  const linkedSystemCount = new Set(
    assurances
      .map((assurance) => assurance.aiSystemId)
      .filter(Boolean),
  ).size;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#18202b]">
      <StudioSidebar />

      <div className="ml-0 lg:ml-[248px]">
        <header className="flex h-[68px] items-center justify-between border-b border-[#dfe3e8] bg-white px-5 sm:px-8">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9299a3]">
              Governance workspace
            </div>
            <div className="mt-0.5 text-sm font-semibold">Assurance</div>
          </div>

          <Link
            href="/ai-systems"
            className="text-xs font-medium text-[#59636f] hover:text-[#18202b]"
          >
            AI Systems
          </Link>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7b838e]">
              Governance assurance
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Assurance
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#68717d]">
              Plan, record and review formal assurance activities and
              assurance outcomes across governed AI systems.
            </p>
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-[#dfe3e8] bg-white px-5 py-5">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#7b838e]">
                Assurance records
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {loading ? "—" : assurances.length}
              </div>
              <div className="mt-1 text-xs text-[#9299a3]">
                Recorded assurance activities
              </div>
            </div>

            <div className="border border-[#dfe3e8] bg-white px-5 py-5">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#7b838e]">
                Governed systems
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {loading ? "—" : linkedSystemCount}
              </div>
              <div className="mt-1 text-xs text-[#9299a3]">
                AI systems with assurance records
              </div>
            </div>
          </section>

          <section className="mt-8 border border-[#dfe3e8] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-5 sm:px-6">
              <div>
                <div className="text-sm font-semibold">
                  Recorded Assurance
                </div>
                <div className="mt-1 text-xs text-[#7b838e]">
                  Formal assurance activities persisted in the governance
                  workspace.
                </div>
              </div>

              <Link
                href="/ai-systems"
                className="border border-[#d5dae0] px-3 py-2 text-xs font-medium text-[#4d5662] hover:bg-[#f8f9fa]"
              >
                Select AI System
              </Link>
            </div>

            {loading ? (
              <div className="px-6 py-14 text-center text-sm text-[#7b838e]">
                Loading assurance records...
              </div>
            ) : assurances.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="text-sm font-medium text-[#4d5662]">
                  No assurance records have been created yet.
                </div>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7b838e]">
                  Assurance records are associated with governed AI systems
                  and provide a formal record of assurance scope, criteria and
                  outcomes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {assurances.map((assurance) => (
                  <div key={assurance.id} className="px-5 py-5 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">
                          {assurance.title || assurance.id}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7b838e]">
                          <span>{assurance.assuranceType}</span>
                          <span>·</span>
                          <span>{assurance.status}</span>
                          <span>·</span>
                          <span>
                            {getSystemName(assurance.aiSystemId)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(assurance)}
                          className="border border-[#d5dae0] px-3 py-2 text-xs font-medium text-[#4d5662] hover:bg-[#f8f9fa]"
                        >
                          View details
                        </button>

                        {assurance.aiSystemId && (
                          <Link
                            href={`/ai-systems/${assurance.aiSystemId}/assurance`}
                            className="border border-[#d5dae0] px-3 py-2 text-xs font-medium text-[#4d5662] hover:bg-[#f8f9fa]"
                          >
                            Open workspace
                          </Link>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 max-w-4xl text-sm leading-6 text-[#59636f]">
                      {assurance.objective}
                    </p>

                    <div className="mt-4 grid gap-4 text-xs text-[#68717d] sm:grid-cols-3">
                      <div>
                        <div className="font-medium text-[#4d5662]">
                          AI System
                        </div>
                        <div className="mt-1">
                          {getSystemName(assurance.aiSystemId)}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-[#4d5662]">
                          Criteria
                        </div>
                        <div className="mt-1">
                          {assurance.criteria?.length ?? 0} recorded
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-[#4d5662]">
                          Schema
                        </div>
                        <div className="mt-1">
                          {assurance.objectType} v{assurance.schemaVersion}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#dfe3e8] bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#e5e7eb] px-6 py-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#7b838e]">
                  Assurance details
                </div>
                <h2 className="mt-1 text-lg font-semibold">
                  {selected.title || selected.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xl leading-none text-[#7b838e] hover:text-[#18202b]"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-[#7b838e]">
                    Status
                  </div>
                  <div className="mt-1 text-sm">{selected.status}</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-[#7b838e]">
                    Assurance type
                  </div>
                  <div className="mt-1 text-sm">
                    {selected.assuranceType}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-[#7b838e]">
                    AI System
                  </div>
                  <div className="mt-1 text-sm">
                    {getSystemName(selected.aiSystemId)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-[#7b838e]">
                    Object
                  </div>
                  <div className="mt-1 text-sm">
                    {selected.objectType} v{selected.objectVersion}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">
                  Objective
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4d5662]">
                  {selected.objective}
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">
                  Scope
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4d5662]">
                  {selected.scope?.description || "No scope description recorded."}
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">
                  Assurance criteria
                </div>

                {selected.criteria?.length ? (
                  <div className="mt-3 divide-y divide-[#e5e7eb] border border-[#e5e7eb]">
                    {selected.criteria.map((criterion) => (
                      <div key={criterion.criterionId} className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium">
                            {criterion.criterionId}
                          </div>
                          {criterion.mandatory && (
                            <span className="text-[11px] font-medium uppercase tracking-wide text-[#7b838e]">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-[#7b838e]">
                          {criterion.source}
                        </div>
                        {criterion.description && (
                          <p className="mt-2 text-sm leading-5 text-[#59636f]">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-[#7b838e]">
                    No criteria recorded.
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">
                  Assurance ID
                </div>
                <div className="mt-1 break-all font-mono text-xs text-[#59636f]">
                  {selected.id}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e5e7eb] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="border border-[#d5dae0] px-4 py-2 text-xs font-medium text-[#4d5662] hover:bg-[#f8f9fa]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}