
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import StudioSidebar from "@/components/StudioSidebar";

type AISystem = {
  id: string;
  name?: string;
  systemName?: string;
};

type Criterion = {
  criterionId: string;
  source: string;
  description: string;
  mandatory: boolean;
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
    [key: string]: unknown;
  };
  criteria: Criterion[];
};

const API_BASE = "/api";

const emptyCriterion = (): Criterion => ({
  criterionId: "",
  source: "",
  description: "",
  mandatory: true,
});

function createId() {
  return globalThis.crypto.randomUUID();
}

export default function AssurancePage() {
  const [assurances, setAssurances] = useState<Assurance[]>([]);
  const [aiSystems, setAiSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Assurance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [aiSystemId, setAiSystemId] = useState("");
  const [title, setTitle] = useState("");
  const [assuranceType, setAssuranceType] = useState("INITIAL");
  const [objective, setObjective] = useState("");
  const [scopeDescription, setScopeDescription] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([emptyCriterion()]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [assuranceResponse, systemsResponse] = await Promise.all([
        fetch(`${API_BASE}/assurances`),
        fetch(`${API_BASE}/ai-systems`),
      ]);

      if (!assuranceResponse.ok || !systemsResponse.ok) {
        throw new Error("Could not load assurance records and AI systems.");
      }

      const assuranceData = await assuranceResponse.json();
      const systemData = await systemsResponse.json();

      setAssurances(Array.isArray(assuranceData) ? assuranceData : []);

      const systems = Array.isArray(systemData)
        ? systemData
        : systemData?.value ?? [];

      setAiSystems(systems);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading assurance data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getSystemName = (id?: string | null) => {
    if (!id) return "Not linked";
    const system = aiSystems.find((item) => item.id === id);
    return system?.name || system?.systemName || id;
  };

  const linkedSystemCount = new Set(
    assurances.map((assurance) => assurance.aiSystemId).filter(Boolean),
  ).size;

  const resetForm = () => {
    setAiSystemId("");
    setTitle("");
    setAssuranceType("INITIAL");
    setObjective("");
    setScopeDescription("");
    setCriteria([emptyCriterion()]);
    setError("");
  };

  const updateCriterion = (
    index: number,
    field: keyof Criterion,
    value: string | boolean,
  ) => {
    setCriteria((current) =>
      current.map((criterion, i) =>
        i === index ? { ...criterion, [field]: value } : criterion,
      ),
    );
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validCriteria = criteria.filter(
      (criterion) =>
        criterion.criterionId.trim() &&
        criterion.source.trim() &&
        criterion.description.trim(),
    );

    if (!aiSystemId) {
      setError("Select the AI system this assurance record belongs to.");
      return;
    }

    if (!objective.trim() || !scopeDescription.trim()) {
      setError("Complete the objective and scope before saving.");
      return;
    }

    if (validCriteria.length === 0) {
      setError("Add at least one complete assurance criterion.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: createId(),
        objectType: "ASSURANCE",
        objectVersion: "0.1",
        schemaVersion: "0.1",
        status: "DRAFT",
        assuranceType,
        title: title.trim() || `Assurance assessment - ${new Date().toLocaleDateString()}`,
        aiSystemId,
        aiSystemIds: [aiSystemId],
        objective: objective.trim(),
        scope: {
          description: scopeDescription.trim(),
        },
        criteria: validCriteria.map((criterion) => ({
          ...criterion,
          criterionId: criterion.criterionId.trim(),
          source: criterion.source.trim(),
          description: criterion.description.trim(),
        })),
      };

      const response = await fetch(`${API_BASE}/assurances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          detail || `Saving the assurance record failed (${response.status}).`,
        );
      }

      await response.json();
      resetForm();
      setShowForm(false);
      setSuccess("Assurance draft saved successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the assurance draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#18202b]">
      <StudioSidebar />

      <div className="ml-0 lg:ml-[248px]">
        <header className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 border-b border-[#dfe3e8] bg-white px-5 py-3 sm:px-8">
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

        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
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

            <button
              type="button"
              onClick={() => {
                setShowForm((value) => !value);
                setError("");
                setSuccess("");
              }}
              className="border border-[#18202b] bg-[#18202b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#303946]"
            >
              {showForm ? "Cancel" : "Create Assurance"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-5 border border-[#cddfd3] bg-[#f2f8f4] px-4 py-3 text-sm text-[#285c3b]"
            >
              {success}
            </div>
          )}

          {showForm && (
            <section className="mt-6 border border-[#dfe3e8] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-5 sm:px-6">
                <h2 className="text-base font-semibold">
                  Create assurance draft
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#68717d]">
                  Define the assessment purpose, scope and criteria. Saving
                  creates a draft only; it does not mean the assessment has
                  been performed or passed.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-6 px-5 py-6 sm:px-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    AI system <span className="text-red-600">*</span>
                    <select
                      required
                      value={aiSystemId}
                      onChange={(event) => setAiSystemId(event.target.value)}
                      className="mt-2 block w-full border border-[#d5dae0] bg-white px-3 py-2.5 text-sm font-normal"
                    >
                      <option value="">Select an AI system</option>
                      {aiSystems.map((system) => (
                        <option key={system.id} value={system.id}>
                          {system.name || system.systemName || system.id}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium">
                    Assurance type <span className="text-red-600">*</span>
                    <select
                      required
                      value={assuranceType}
                      onChange={(event) => setAssuranceType(event.target.value)}
                      className="mt-2 block w-full border border-[#d5dae0] bg-white px-3 py-2.5 text-sm font-normal"
                    >
                      <option value="INITIAL">Initial</option>
                      <option value="PERIODIC">Periodic</option>
                      <option value="CHANGE_TRIGGERED">Change-triggered</option>
                      <option value="INCIDENT_TRIGGERED">Incident-triggered</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium">
                  Assurance title
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={1000}
                    placeholder="e.g. Initial AI governance assurance"
                    className="mt-2 block w-full border border-[#d5dae0] px-3 py-2.5 text-sm font-normal"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Objective <span className="text-red-600">*</span>
                  <textarea
                    required
                    value={objective}
                    onChange={(event) => setObjective(event.target.value)}
                    maxLength={10000}
                    rows={3}
                    placeholder="What should this assurance assessment establish?"
                    className="mt-2 block w-full border border-[#d5dae0] px-3 py-2.5 text-sm font-normal"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Scope description <span className="text-red-600">*</span>
                  <textarea
                    required
                    value={scopeDescription}
                    onChange={(event) => setScopeDescription(event.target.value)}
                    rows={3}
                    placeholder="Describe the system, processes and governance areas included."
                    className="mt-2 block w-full border border-[#d5dae0] px-3 py-2.5 text-sm font-normal"
                  />
                </label>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">
                        Assurance criteria
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#7b838e]">
                        Add at least one complete criterion that can be
                        assessed using evidence.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCriteria((current) => [...current, emptyCriterion()])
                      }
                      className="border border-[#d5dae0] px-3 py-2 text-xs font-medium hover:bg-[#f8f9fa]"
                    >
                      Add criterion
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {criteria.map((criterion, index) => (
                      <div
                        key={index}
                        className="border border-[#e5e7eb] p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h4 className="text-sm font-medium">
                            Criterion {index + 1}
                          </h4>
                          {criteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setCriteria((current) =>
                                  current.filter((_, i) => i !== index),
                                )
                              }
                              className="text-xs font-medium text-red-700 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm font-medium">
                            Criterion ID <span className="text-red-600">*</span>
                            <input
                              required
                              value={criterion.criterionId}
                              onChange={(event) =>
                                updateCriterion(index, "criterionId", event.target.value)
                              }
                              maxLength={128}
                              placeholder="e.g. GOV-01"
                              className="mt-2 block w-full border border-[#d5dae0] px-3 py-2.5 text-sm font-normal"
                            />
                          </label>

                          <label className="block text-sm font-medium">
                            Source <span className="text-red-600">*</span>
                            <input
                              required
                              value={criterion.source}
                              onChange={(event) =>
                                updateCriterion(index, "source", event.target.value)
                              }
                              placeholder="e.g. Internal AI governance policy"
                              className="mt-2 block w-full border border-[#d5dae0] px-3 py-2.5 text-sm font-normal"
                            />
                          </label>
                        </div>

                        <label className="mt-4 block text-sm font-medium">
                          Criterion description <span className="text-red-600">*</span>
                          <textarea
                            required
                            value={criterion.description}
                            onChange={(event) =>
                              updateCriterion(index, "description", event.target.value)
                            }
                            rows={2}
                            placeholder="What must be demonstrated or verified?"
                            className="mt-2 block w-full border border-[#d5dae0] px-3 py-2.5 text-sm font-normal"
                          />
                        </label>

                        <label className="mt-4 flex items-center gap-2 text-sm text-[#4d5662]">
                          <input
                            type="checkbox"
                            checked={criterion.mandatory}
                            onChange={(event) =>
                              updateCriterion(index, "mandatory", event.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          Mandatory criterion
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#e5e7eb] pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    disabled={saving}
                    className="border border-[#d5dae0] px-4 py-2.5 text-sm font-medium hover:bg-[#f8f9fa] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || aiSystems.length === 0}
                    className="border border-[#18202b] bg-[#18202b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#303946] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving draft..." : "Save assurance draft"}
                  </button>
                </div>

                {aiSystems.length === 0 && !loading && (
                  <p className="text-sm text-[#7b838e]">
                    No AI systems are available to select. Create or load an AI
                    system before starting an assurance draft.
                  </p>
                )}
              </form>
            </section>
          )}

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
                <div className="text-sm font-semibold">Recorded Assurance</div>
                <div className="mt-1 text-xs text-[#7b838e]">
                  Formal assurance activities persisted in the governance workspace.
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
                  Create a draft to record the assessment objective, scope and
                  criteria. A draft does not establish a completed assurance outcome.
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
                          <span>{getSystemName(assurance.aiSystemId)}</span>
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
                        <div className="font-medium text-[#4d5662]">AI System</div>
                        <div className="mt-1">{getSystemName(assurance.aiSystemId)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-[#4d5662]">Criteria</div>
                        <div className="mt-1">{assurance.criteria?.length ?? 0} recorded</div>
                      </div>
                      <div>
                        <div className="font-medium text-[#4d5662]">Schema</div>
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
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
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
                  <div className="text-xs font-medium text-[#7b838e]">Status</div>
                  <div className="mt-1 text-sm">{selected.status}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#7b838e]">Assurance type</div>
                  <div className="mt-1 text-sm">{selected.assuranceType}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#7b838e]">AI System</div>
                  <div className="mt-1 text-sm">{getSystemName(selected.aiSystemId)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#7b838e]">Object</div>
                  <div className="mt-1 text-sm">
                    {selected.objectType} v{selected.objectVersion}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">Objective</div>
                <p className="mt-2 text-sm leading-6 text-[#4d5662]">{selected.objective}</p>
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">Scope</div>
                <p className="mt-2 text-sm leading-6 text-[#4d5662]">
                  {selected.scope?.description || "No scope description recorded."}
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">Assurance criteria</div>
                {selected.criteria?.length ? (
                  <div className="mt-3 divide-y divide-[#e5e7eb] border border-[#e5e7eb]">
                    {selected.criteria.map((criterion) => (
                      <div key={criterion.criterionId} className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium">{criterion.criterionId}</div>
                          {criterion.mandatory && (
                            <span className="text-[11px] font-medium uppercase tracking-wide text-[#7b838e]">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-[#7b838e]">{criterion.source}</div>
                        {criterion.description && (
                          <p className="mt-2 text-sm leading-5 text-[#59636f]">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-[#7b838e]">No criteria recorded.</div>
                )}
              </div>

              <div>
                <div className="text-xs font-medium text-[#7b838e]">Assurance ID</div>
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