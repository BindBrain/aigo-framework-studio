"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import StudioSidebar from "@/components/StudioSidebar";

const API_BASE = "/api";

type AISystem = {
  id: string;
  name?: string;
  systemName?: string;
};

type Evidence = {
  id: string;
  evidenceTitle: string;
  purpose: string;
  source: string;
  evidenceDescription?: string | null;
  evidenceType?: string | null;
  format?: string | null;
  status: string;
  objectVersion?: string;
  schemaVersion?: string;
  aiSystemId?: string | null;
  lifecycleStage?: string | null;
  controlIds?: string[];
  assessmentIds?: string[];
};

const emptyForm = {
  evidenceTitle: "",
  purpose: "",
  source: "",
  evidenceDescription: "",
  evidenceType: "DOCUMENT",
  format: "text",
  aiSystemId: "",
};

export default function EvidencePage() {
  const [items, setItems] = useState<Evidence[]>([]);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Evidence | null>(null);
  const [viewing, setViewing] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function getSystemName(id?: string | null) {
    if (!id) return "Not linked";

    const system = systems.find((item) => item.id === id);

    return system?.systemName || system?.name || "Unknown AI System";
  }

  async function loadEvidence() {
    const response = await fetch(`${API_BASE}/evidence`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load evidence.");
    }

    const data = await response.json();
    setItems(Array.isArray(data) ? data : data?.value ?? []);
  }

  async function loadSystems() {
    const response = await fetch(`${API_BASE}/ai-systems`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load AI Systems.");
    }

    const data = await response.json();
    setSystems(Array.isArray(data) ? data : data?.value ?? []);
  }

  useEffect(() => {
    Promise.all([loadEvidence(), loadSystems()])
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Evidence workspace."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  function beginEdit(item: Evidence) {
    setEditing(item);
    setForm({
      evidenceTitle: item.evidenceTitle,
      purpose: item.purpose,
      source: item.source,
      evidenceDescription: item.evidenceDescription || "",
      evidenceType: item.evidenceType || "DOCUMENT",
      format: item.format || "text",
      aiSystemId: item.aiSystemId || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      evidenceTitle: form.evidenceTitle.trim(),
      purpose: form.purpose.trim(),
      source: form.source.trim(),
      evidenceDescription: form.evidenceDescription.trim() || null,
      evidenceType: form.evidenceType,
      format: form.format.trim() || null,
      aiSystemId: form.aiSystemId || null,
      lifecycleStage: "ASSESS",
      controlIds: editing?.controlIds || [],
      assessmentIds: editing?.assessmentIds || [],
      status: editing?.status || "DRAFT",
      objectType: "EVIDENCE",
      objectVersion: editing?.objectVersion || "0.1",
      schemaVersion: editing?.schemaVersion || "0.1",
    };

    try {
      const response = await fetch(
        editing
          ? `${API_BASE}/evidence/${editing.id}`
          : `${API_BASE}/evidence`,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          editing
            ? "Unable to update evidence."
            : "Unable to save evidence."
        );
      }

      await loadEvidence();

      setMessage(editing ? "Evidence updated." : "Evidence saved.");
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save evidence."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Evidence) {
    const confirmed = window.confirm(
      `Delete "${item.evidenceTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/evidence/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete evidence.");
      }

      setItems((current) =>
        current.filter((evidence) => evidence.id !== item.id)
      );

      if (viewing?.id === item.id) {
        setViewing(null);
      }

      if (editing?.id === item.id) {
        resetForm();
      }

      setMessage("Evidence deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete evidence."
      );
    }
  }

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
              Evidence
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
              Governance evidence
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Evidence
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68717d]">
              Register and manage evidence supporting AIGO governance
              activities, assessments, decisions, and assurance.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-[#e7caca] bg-[#fff7f7] p-4 text-sm text-[#8a3d3d]">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-md border border-[#d8e4dc] bg-[#f5faf6] p-4 text-sm text-[#47604e]">
              {message}
            </div>
          )}

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <section className="border border-[#dfe3e8] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <div className="text-sm font-semibold">
                  {editing ? "Edit Evidence" : "Register Evidence"}
                </div>

                <div className="mt-1 text-xs text-[#7b838e]">
                  {editing
                    ? "Update the selected governance evidence record."
                    : "Create a governance evidence record for the AIGO workspace."}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 px-5 py-5"
              >
                <div>
                  <label className="text-xs font-medium text-[#4d5662]">
                    Evidence title
                  </label>
                  <input
                    required
                    value={form.evidenceTitle}
                    onChange={(event) =>
                      updateField("evidenceTitle", event.target.value)
                    }
                    placeholder="Evidence title"
                    className="mt-1.5 w-full rounded-md border border-[#dfe3e8] px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4d5662]">
                    Purpose
                  </label>
                  <textarea
                    required
                    value={form.purpose}
                    onChange={(event) =>
                      updateField("purpose", event.target.value)
                    }
                    placeholder="Why this evidence is maintained"
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-md border border-[#dfe3e8] px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4d5662]">
                    Source
                  </label>
                  <input
                    required
                    value={form.source}
                    onChange={(event) =>
                      updateField("source", event.target.value)
                    }
                    placeholder="Source or originating record"
                    className="mt-1.5 w-full rounded-md border border-[#dfe3e8] px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4d5662]">
                    AI System
                  </label>
                  <select
                    value={form.aiSystemId}
                    onChange={(event) =>
                      updateField("aiSystemId", event.target.value)
                    }
                    className="mt-1.5 w-full rounded-md border border-[#dfe3e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                  >
                    <option value="">
                      Not linked to an AI System
                    </option>

                    {systems.map((system) => (
                      <option key={system.id} value={system.id}>
                        {system.systemName ||
                          system.name ||
                          "Unnamed AI System"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#4d5662]">
                    Description
                  </label>
                  <textarea
                    value={form.evidenceDescription}
                    onChange={(event) =>
                      updateField(
                        "evidenceDescription",
                        event.target.value
                      )
                    }
                    placeholder="Additional evidence description"
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-md border border-[#dfe3e8] px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-[#4d5662]">
                      Evidence type
                    </label>
                    <select
                      value={form.evidenceType}
                      onChange={(event) =>
                        updateField("evidenceType", event.target.value)
                      }
                      className="mt-1.5 w-full rounded-md border border-[#dfe3e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                    >
                      <option value="DOCUMENT">Document</option>
                      <option value="RECORD">Record</option>
                      <option value="REPORT">Report</option>
                      <option value="LOG">Log</option>
                      <option value="TEST_RESULT">Test Result</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#4d5662]">
                      Format
                    </label>
                    <input
                      value={form.format}
                      onChange={(event) =>
                        updateField("format", event.target.value)
                      }
                      placeholder="Format"
                      className="mt-1.5 w-full rounded-md border border-[#dfe3e8] px-3 py-2.5 text-sm outline-none focus:border-[#9aa5b1]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-[#18202b] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#27313e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editing
                        ? "Update Evidence"
                        : "Save Evidence"}
                  </button>

                  {editing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-md border border-[#dfe3e8] px-4 py-2.5 text-xs font-semibold text-[#626b77] hover:bg-[#f7f8f9]"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="border border-[#dfe3e8] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
                <div>
                  <div className="text-sm font-semibold">
                    Evidence Register
                  </div>
                  <div className="mt-1 text-xs text-[#7b838e]">
                    {loading
                      ? "Loading evidence..."
                      : `${items.length} evidence record${items.length === 1 ? "" : "s"}`}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-sm text-[#737b87]">
                  Loading evidence records...
                </div>
              ) : items.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="text-sm font-semibold text-[#343d48]">
                    No evidence registered yet
                  </div>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737b87]">
                    Use the registration form to create the first governance
                    evidence record.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#edf0f2]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="px-5 py-5 sm:px-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#343d48]">
                              {item.evidenceTitle}
                            </h3>

                            <span className="rounded-full bg-[#f1f3f5] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68717d]">
                              {item.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-[#737b87]">
                            {getSystemName(item.aiSystemId)}
                          </p>

                          <p className="mt-3 line-clamp-2 text-sm text-[#626b77]">
                            {item.purpose}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewing(item)}
                            className="rounded-md border border-[#dfe3e8] px-3 py-2 text-xs font-semibold text-[#626b77] hover:bg-[#f7f8f9]"
                          >
                            View details
                          </button>

                          <button
                            type="button"
                            onClick={() => beginEdit(item)}
                            className="rounded-md border border-[#dfe3e8] px-3 py-2 text-xs font-semibold text-[#626b77] hover:bg-[#f7f8f9]"
                          >
                            Edit details
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            aria-label={`Delete ${item.evidenceTitle}`}
                            title="Delete evidence"
                            className="rounded-md border border-[#e3d6d6] px-2.5 py-2 text-[#8a3d3d] hover:bg-[#fff7f7]"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                            Source
                          </div>
                          <div className="mt-1 text-[#626b77]">
                            {item.source}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                            Type
                          </div>
                          <div className="mt-1 text-[#626b77]">
                            {item.evidenceType || "Not specified"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                            Format
                          </div>
                          <div className="mt-1 text-[#626b77]">
                            {item.format || "Not specified"}
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
      </main>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="evidence-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewing(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#dfe3e8] bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#e5e7eb] px-6 py-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9299a3]">
                  Evidence details
                </div>

                <h2
                  id="evidence-details-title"
                  className="mt-1 text-lg font-semibold"
                >
                  {viewing.evidenceTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label="Close details"
                className="rounded-md px-2 py-1 text-lg text-[#737b87] hover:bg-[#f5f6f7]"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Status
                </div>
                <div className="mt-1 text-sm">{viewing.status}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  AI System
                </div>
                <div className="mt-1 text-sm">
                  {getSystemName(viewing.aiSystemId)}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Purpose
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#626b77]">
                  {viewing.purpose}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Source
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#626b77]">
                  {viewing.source}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Description
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#626b77]">
                  {viewing.evidenceDescription || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Evidence type
                </div>
                <div className="mt-1 text-sm text-[#626b77]">
                  {viewing.evidenceType || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Format
                </div>
                <div className="mt-1 text-sm text-[#626b77]">
                  {viewing.format || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Lifecycle stage
                </div>
                <div className="mt-1 text-sm text-[#626b77]">
                  {viewing.lifecycleStage || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9299a3]">
                  Evidence ID
                </div>
                <div className="mt-1 break-all text-xs text-[#737b87]">
                  {viewing.id}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e5e7eb] px-6 py-4">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-md bg-[#18202b] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#27313e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
