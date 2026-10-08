"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AISystem = {
  id: string;
  name: string;
  provider: string | null;
  model: string | null;
  purpose: string;
  owner: string;
  description: string | null;
  lifecycle_status: string;
  governance_context: string | null;
};

const systemStages = [
  ["Register", "Capture identity, purpose, ownership and governance context."],
  ["Classify", "Determine applicable domains, requirements and evaluation scope."],
  ["Evaluate", "Evaluate the system against applicable governance rules."],
  ["Monitor", "Track changes and conditions requiring reassessment."],
];

function formatLifecycle(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AISystemsPage() {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSystems() {
      try {
        const response = await fetch("/api/ai-systems");

        if (!response.ok) {
          throw new Error("Unable to load AI systems.");
        }

        const data = await response.json();
        setSystems(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load AI systems."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSystems();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#18202b]">
      <header className="flex h-[68px] items-center justify-between border-b border-[#dfe3e8] bg-white px-5 sm:px-8">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-sm font-medium text-[#626b77] hover:text-[#18202b]"
                              >
            &#8592; Dashboard
          </Link>

          <div className="h-5 w-px bg-[#dfe3e8]" />

          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9299a3]">
              AIGO Framework Studio
            </div>
            <div className="mt-0.5 text-sm font-semibold">AI Systems</div>
          </div>
        </div>

        <Link
          href="/ai-systems/register"
          className="rounded-md bg-[#18202b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#27313e]"
                            >
          Register AI System
        </Link>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7b838e]">
            Governance inventory
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Systems
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#68717d]">
            Register and manage the AI systems that are subject to AIGO
            governance. Registration establishes the identity and governance
            context used throughout the lifecycle.
          </p>
        </div>

        <section className="mt-8 border border-[#dfe3e8] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">AI System Inventory</div>
                <div className="mt-1 text-xs text-[#7b838e]">
                  Systems registered in this governance workspace.
                </div>
              </div>

              <div className="rounded-md border border-[#e1e5e9] bg-[#fafbfc] px-3 py-1.5 text-xs font-semibold text-[#59636f]">
                {systems.length} {systems.length === 1 ? "system" : "systems"}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-14 text-center text-sm text-[#7b838e]">
              Loading AI systems...
            </div>
          ) : error ? (
            <div className="m-5 border border-[#e3caca] bg-[#fff8f8] px-4 py-3 text-sm text-[#8a4545]">
              {error}
            </div>
          ) : systems.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7dce2] bg-[#fafbfc] text-sm font-semibold">
                0
              </div>

              <h2 className="mt-4 text-sm font-semibold">
                No AI systems registered
              </h2>

              <p className="mt-2 max-w-md text-xs leading-5 text-[#858d97]">
                Register the first AI system to establish its identity, purpose,
                ownership and governance context.
              </p>

              <Link
                href="/ai-systems/register"
                className="mt-5 rounded-md border border-[#cfd5dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#343d48] hover:bg-[#f7f8f9]"
                                  >
                Register first AI system
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {systems.map((system) => (
                <div
                  key={system.id}
                  className="px-5 py-5 transition-colors hover:bg-[#fafbfc] sm:px-6"
                                    >
                  <div className="flex items-center justify-between gap-6">
                    <div className="min-w-0">
                      <Link href={`/ai-systems/${system.id}`} className="text-sm font-semibold hover:underline">{system.name}</Link>
                      <div className="mt-1">
                        <span className="rounded bg-[#edf5ef] px-2 py-1 text-[10px] font-medium text-[#3e6b4d]">
                          {formatLifecycle(system.lifecycle_status)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/ai-systems/${system.id}`}
                      className="shrink-0 rounded-md border border-[#d7dce2] bg-white px-3.5 py-2 text-xs font-semibold text-[#3f4854] hover:border-[#b9c0c9] hover:bg-[#f8f9fa]"
                    >
                      Open Workspace &#8594;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <div className="text-sm font-semibold">
              AI Governance Lifecycle
            </div>
            <div className="mt-1 text-xs text-[#7b838e]">
              Registration provides the foundation for subsequent governance
              activities.
            </div>
          </div>

          <div className="grid gap-px overflow-hidden border border-[#dfe3e8] bg-[#dfe3e8] md:grid-cols-2 xl:grid-cols-4">
            {systemStages.map(([stage, description], index) => (
              <div key={stage} className="bg-white p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9aa1aa]">
                  0{index + 1}
                </div>
                <div className="mt-3 text-sm font-semibold">{stage}</div>
                <p className="mt-2 text-xs leading-5 text-[#7b838e]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

