"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudioSidebar from "@/components/StudioSidebar";

const API_BASE = "/api";

type AISystem = {
  id: string;
  name?: string;
  systemName?: string;
};

type Rule = {
  id: string;
  name: string;
  description?: string | null;
  source?: string | null;
  applicability?: string | null;
};

type RuleRecord = Rule & {
  aiSystemId: string;
  aiSystemName: string;
};

export default function RulesPage() {
  const [records, setRecords] = useState<RuleRecord[]>([]);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRules() {
      try {
        const systemsResponse = await fetch(`${API_BASE}/ai-systems`, {
          cache: "no-store",
        });

        if (!systemsResponse.ok) {
          throw new Error("Unable to load AI Systems.");
        }

        const systemsData = await systemsResponse.json();
        const aiSystems: AISystem[] = Array.isArray(systemsData)
          ? systemsData
          : systemsData?.value ?? [];

        setSystems(aiSystems);

        const ruleRecords = await Promise.all(
          aiSystems.map(async (system) => {
            const response = await fetch(
              `${API_BASE}/ai-systems/${system.id}/rules`,
              { cache: "no-store" }
            );

            if (!response.ok) {
              throw new Error(
                `Unable to load rules for ${system.name || system.id}.`
              );
            }

            const data = await response.json();
            const rules: Rule[] = Array.isArray(data)
              ? data
              : data?.value ?? [];

            return rules.map((rule) => ({
              ...rule,
              aiSystemId: system.id,
              aiSystemName:
                system.systemName ||
                system.name ||
                "Unnamed AI System",
            }));
          })
        );

        setRecords(ruleRecords.flat());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load governance rules."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f6f7f9] text-[#18202b]">
      <StudioSidebar />

      <main className="ml-0 min-w-0 flex-1 lg:ml-[248px]">
        <header className="flex h-[68px] items-center justify-between border-b border-[#dfe3e8] bg-white px-5 sm:px-8">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9299a3]">
              Governance workspace
            </div>
            <div className="mt-0.5 text-sm font-semibold">
              Governance Rules
            </div>
          </div>

          <Link
            href="/ai-systems"
            className="rounded-md border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#626b77] hover:bg-[#f7f8f9]"
          >
            AI Systems
          </Link>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-7">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7b838e]">
              Governance configuration
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Rules
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68717d]">
              Record governance rules that define applicable requirements,
              expectations, or constraints for an AI system. Rules are managed
              within the system evaluation workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-[#e7caca] bg-[#fff7f7] p-4 text-sm text-[#8a3d3d]">
              {error}
            </div>
          )}

          <section className="mb-7 grid gap-4 sm:grid-cols-2">
            <div className="border border-[#dfe3e8] bg-white p-5">
              <div className="text-xs font-medium text-[#737c88]">
                Recorded Rules
              </div>

              <div className="mt-3 text-3xl font-semibold tracking-tight">
                {loading ? "—" : records.length}
              </div>

              <div className="mt-1 text-xs text-[#969da6]">
                Governance rules recorded across AI Systems
              </div>
            </div>

            <div className="border border-[#dfe3e8] bg-white p-5">
              <div className="text-xs font-medium text-[#737c88]">
                AI Systems
              </div>

              <div className="mt-3 text-3xl font-semibold tracking-tight">
                {loading ? "—" : systems.length}
              </div>

              <div className="mt-1 text-xs text-[#969da6]">
                Systems available for governance rule configuration
              </div>
            </div>
          </section>

          <section className="border border-[#dfe3e8] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e5e7eb] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <div>
                <div className="text-sm font-semibold">
                  Recorded Governance Rules
                </div>

                <div className="mt-1 text-xs text-[#7b838e]">
                  Rules currently recorded across the AIGO workspace.
                </div>
              </div>

              <Link
                href="/ai-systems"
                className="w-fit rounded-md bg-[#18202b] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#27313e]"
              >
                Open AI Systems
              </Link>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-sm text-[#737b87]">
                Loading governance rules...
              </div>
            ) : records.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto max-w-md">
                  <div className="text-sm font-semibold text-[#343d48]">
                    No governance rules recorded yet
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#737b87]">
                    Rules are created from an AI System evaluation workspace
                    when governance requirements or constraints need to be
                    recorded for that system.
                  </p>

                  <Link
                    href="/ai-systems"
                    className="mt-5 inline-flex rounded-md border border-[#dfe3e8] px-4 py-2.5 text-xs font-semibold text-[#343d48] hover:bg-[#f7f8f9]"
                  >
                    Select an AI System
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#edf0f2]">
                {records.map((rule) => (
                  <div
                    key={`${rule.aiSystemId}-${rule.id}`}
                    className="px-5 py-5 sm:px-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#343d48]">
                          {rule.name}
                        </div>

                        <div className="mt-1 text-xs text-[#737b87]">
                          {rule.aiSystemName}
                        </div>
                      </div>

                      <Link
                        href={`/ai-systems/${rule.aiSystemId}/evaluation`}
                        className="shrink-0 text-xs font-semibold text-[#3f596f] hover:text-[#18202b]"
                      >
                        Open Evaluation
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                          Description
                        </div>
                        <div className="mt-1 text-[#626b77]">
                          {rule.description || "Not specified"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                          Source
                        </div>
                        <div className="mt-1 text-[#626b77]">
                          {rule.source || "Not specified"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                          Applicability
                        </div>
                        <div className="mt-1 text-[#626b77]">
                          {rule.applicability || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}