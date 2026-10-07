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

export default function ControlsPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [controls, setControls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedControl, setSelectedControl] = useState<any | null>(null);
  const [editingControlId, setEditingControlId] = useState<string | null>(null);

  const [controlName, setControlName] = useState("");
  const [controlObjective, setControlObjective] = useState("");
  const [controlOwner, setControlOwner] = useState("CONTROL_OWNER");
  const [status, setStatus] = useState("DRAFT");
  const [controlFamily, setControlFamily] = useState("");
  const [controlType, setControlType] = useState("PREVENTIVE");
  const [controlDescription, setControlDescription] = useState("");
  const [criticality, setCriticality] = useState("");
  const [frequency, setFrequency] = useState("");
  const [lifecycleStages, setLifecycleStages] = useState("");
  const [riskIds, setRiskIds] = useState("");
  const [controlPerformers, setControlPerformers] = useState("");
  const [controlReviewer, setControlReviewer] = useState("");
  const [approvalAuthority, setApprovalAuthority] = useState("");
  const [executionMethod, setExecutionMethod] = useState("");
  const [executionTrigger, setExecutionTrigger] = useState("");
  const [implementationStatus, setImplementationStatus] = useState("");
  const [monitoringRequired, setMonitoringRequired] = useState(false);
  const [reviewFrequency, setReviewFrequency] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [systemsResponse, controlsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/ai-systems"),
          fetch(`http://127.0.0.1:8000/ai-systems/${id}/control`),
        ]);

        if (!systemsResponse.ok || !controlsResponse.ok) {
          throw new Error("Unable to load Control workspace.");
        }

        const systems = await systemsResponse.json();
        const systemData = systems.find((item: AISystem) => item.id === id);

        setSystem(systemData ?? null);
        setControls(await controlsResponse.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load Control workspace.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function resetForm() {
    setEditingControlId(null);
    setSaved(false);
    setControlName("");
    setControlObjective("");
    setControlOwner("CONTROL_OWNER");
    setStatus("DRAFT");
    setControlFamily("");
    setControlType("PREVENTIVE");
    setControlDescription("");
    setCriticality("");
    setFrequency("");
    setLifecycleStages("");
    setRiskIds("");
    setControlPerformers("");
    setControlReviewer("");
    setApprovalAuthority("");
    setExecutionMethod("");
    setExecutionTrigger("");
    setImplementationStatus("");
    setMonitoringRequired(false);
    setReviewFrequency("");
    setNextReviewDate("");
  }

  function editControl(control: any) {
    setEditingControlId(control.id);
    setSaved(false);
    setControlName(control.controlName ?? "");
    setControlObjective(control.controlObjective ?? "");
    setControlOwner(control.controlOwner?.roleType ?? "CONTROL_OWNER");
    setStatus(control.status ?? "DRAFT");
    setControlFamily(control.controlFamily ?? "");
    setControlType(control.controlType ?? "PREVENTIVE");
    setControlDescription(control.controlDescription ?? "");
    setCriticality(control.criticality ?? "");
    setFrequency(control.frequency ?? "");
    setLifecycleStages((control.lifecycleStages ?? []).join(", "));
    setRiskIds((control.riskIds ?? []).join(", "));
    setControlPerformers(
      (control.controlPerformers ?? []).map((item: any) => item.roleType).join(", "),
    );
    setControlReviewer(control.controlReviewer?.roleType ?? "");
    setApprovalAuthority(control.approvalAuthority?.roleType ?? "");
    setExecutionMethod(control.execution?.method ?? "");
    setExecutionTrigger(control.execution?.trigger ?? "");
    setImplementationStatus(control.implementation?.status ?? "");
    setMonitoringRequired(Boolean(control.monitoring?.required));
    setReviewFrequency(control.review?.frequency ?? "");
    setNextReviewDate(control.review?.nextReviewDate ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveControl() {
    setError("");
    setSaved(false);

    if (!controlName.trim() || !controlObjective.trim() || !controlOwner.trim()) {
      setError("Control name, control objective, and control owner are required.");
      return;
    }

    const payload = {
      objectType: "CONTROL",
      objectVersion: "0.1",
      schemaVersion: "0.1",
      status,
      controlName: controlName.trim(),
      controlObjective: controlObjective.trim(),
      controlOwner: { roleType: controlOwner.trim() },
      controlFamily: controlFamily.trim() || null,
      controlType: controlType || null,
      controlDescription: controlDescription.trim() || null,
      riskIds: riskIds.split(",").map((value) => value.trim()).filter(Boolean),
      aiSystemIds: [id],
      lifecycleStages: lifecycleStages.split(",").map((value) => value.trim()).filter(Boolean),
      controlPerformers: controlPerformers
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((roleType) => ({ roleType })),
      controlReviewer: controlReviewer.trim() ? { roleType: controlReviewer.trim() } : null,
      approvalAuthority: approvalAuthority.trim() ? { roleType: approvalAuthority.trim() } : null,
      criticality: criticality.trim() || null,
      frequency: frequency.trim() || null,
      execution: executionMethod.trim() || executionTrigger.trim()
        ? {
            method: executionMethod.trim() || null,
            trigger: executionTrigger.trim() || null,
          }
        : null,
      implementation: implementationStatus.trim()
        ? { status: implementationStatus.trim() }
        : null,
      monitoring: {
        required: monitoringRequired,
      },
      review: reviewFrequency.trim() || nextReviewDate
        ? {
            frequency: reviewFrequency.trim() || null,
            nextReviewDate: nextReviewDate || null,
          }
        : null,
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/control${editingControlId ? `/${editingControlId}` : ""}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Unable to save Control.");
      }

      const savedControl = await response.json();

      if (editingControlId) {
        setControls((current) =>
          current.map((control) => control.id === editingControlId ? savedControl : control),
        );
      } else {
        setControls((current) => [savedControl, ...current]);
      }

      setSaved(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save Control.");
    }
  }

  async function deleteControl(control: any) {
    if (!window.confirm(`Delete Control "${control.controlName}"?`)) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/control/${control.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Unable to delete Control.");

      setControls((current) => current.filter((item) => item.id !== control.id));
      setSelectedControl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete Control.");
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f6f7f8] p-8 text-sm text-[#626b77]">Loading Controls...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link href={`/ai-systems/${id}`} className="text-sm text-[#626b77] hover:text-[#18202b]">
            ← Back to AI System Workspace
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-[#18202b]">Controls</h1>
          <p className="mt-1 text-sm text-[#626b77]">
            Record and manage governance controls for {system?.name ?? "this AI system"}.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {saved ? (
          <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Control saved successfully.
          </div>
        ) : null}

        <section className="rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#18202b]">
            {editingControlId ? "Edit Control" : "Record a Control"}
          </h2>
          <p className="mt-1 text-sm text-[#626b77]">
            Required: Control Name, Control Objective, and Control Owner.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Control Name" value={controlName} onChange={setControlName} required />
            <SelectField label="Status" value={status} onChange={setStatus} options={[
              "DRAFT", "PROPOSED", "APPROVED", "IMPLEMENTATION_PENDING", "IMPLEMENTED",
              "ACTIVE", "PARTIALLY_IMPLEMENTED", "SUSPENDED", "EXCEPTION",
              "UNDER_REASSESSMENT", "RETIRED", "SUPERSEDED",
            ]} />
            <Field label="Control Objective" value={controlObjective} onChange={setControlObjective} required wide />
            <Field label="Control Owner" value={controlOwner} onChange={setControlOwner} required />
            <Field label="Control Family" value={controlFamily} onChange={setControlFamily} />
            <SelectField label="Control Type" value={controlType} onChange={setControlType} options={[
              "PREVENTIVE", "DETECTIVE", "CORRECTIVE", "DIRECTIVE", "COMPENSATING", "OTHER",
            ]} />
            <Field label="Criticality" value={criticality} onChange={setCriticality} />
            <Field label="Frequency" value={frequency} onChange={setFrequency} />
            <Field label="Lifecycle Stages" value={lifecycleStages} onChange={setLifecycleStages} placeholder="IDENTIFY, DEVELOP, OPERATE" />
            <Field label="Risk IDs" value={riskIds} onChange={setRiskIds} placeholder="Comma-separated risk IDs" />
            <Field label="Control Performers" value={controlPerformers} onChange={setControlPerformers} placeholder="Comma-separated roles" />
            <Field label="Control Reviewer" value={controlReviewer} onChange={setControlReviewer} />
            <Field label="Approval Authority" value={approvalAuthority} onChange={setApprovalAuthority} />
            <Field label="Implementation Status" value={implementationStatus} onChange={setImplementationStatus} />
            <Field label="Execution Method" value={executionMethod} onChange={setExecutionMethod} />
            <Field label="Execution Trigger" value={executionTrigger} onChange={setExecutionTrigger} />
            <Field label="Review Frequency" value={reviewFrequency} onChange={setReviewFrequency} />
            <Field label="Next Review Date" value={nextReviewDate} onChange={setNextReviewDate} type="date" />
            <label className="flex items-center gap-2 text-sm text-[#18202b]">
              <input
                type="checkbox"
                checked={monitoringRequired}
                onChange={(event) => setMonitoringRequired(event.target.checked)}
              />
              Monitoring required
            </label>
            <TextArea label="Control Description" value={controlDescription} onChange={setControlDescription} wide />
          </div>

          <div className="mt-6 flex items-center gap-2">
            {editingControlId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-[#d7dce1] px-4 py-2 text-sm font-medium text-[#626b77] hover:bg-[#f7f8fa]"
              >
                Cancel Edit
              </button>
            ) : null}
            <button
              type="button"
              onClick={saveControl}
              className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#252e3a]"
            >
              {editingControlId ? "Update Control" : "Save Control"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#18202b]">Control History</h2>

          {controls.length === 0 ? (
            <p className="mt-4 text-sm text-[#626b77]">No Controls recorded yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {controls.map((control) => (
                <div key={control.id} className="rounded-lg border border-[#e1e5e9] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-[#18202b]">{control.controlName}</h3>
                      <p className="mt-1 text-sm text-[#626b77]">{control.controlObjective}</p>
                    </div>
                    <span className="rounded-full border border-[#d7dce1] px-3 py-1 text-xs font-medium text-[#626b77]">
                      {control.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedControl(control)}
                      className="rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-medium text-[#18202b] hover:bg-[#f7f8fa]"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => editControl(control)}
                      className="rounded-md border border-[#d7dce1] px-3 py-2 text-sm font-medium text-[#18202b] hover:bg-[#f7f8fa]"
                    >
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteControl(control)}
                      className="rounded-md border border-[#d7dce1] px-3 py-2 text-sm text-[#626b77] hover:bg-[#f7f8fa]"
                      aria-label={`Delete Control ${control.controlName}`}
                      title="Delete Control"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedControl ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#18202b]">{selectedControl.controlName}</h2>
                  <p className="mt-1 text-sm text-[#626b77]">Control details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedControl(null)}
                  className="rounded-md border border-[#d7dce1] px-3 py-2 text-sm text-[#626b77]"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Detail label="Status" value={selectedControl.status} />
                <Detail label="Control Owner" value={selectedControl.controlOwner?.roleType} />
                <Detail label="Control Family" value={selectedControl.controlFamily} />
                <Detail label="Control Type" value={selectedControl.controlType} />
                <Detail label="Criticality" value={selectedControl.criticality} />
                <Detail label="Frequency" value={selectedControl.frequency} />
                <Detail label="Lifecycle Stages" value={(selectedControl.lifecycleStages ?? []).join(", ")} />
                <Detail label="Risk IDs" value={(selectedControl.riskIds ?? []).join(", ")} />
                <Detail label="Control Performers" value={(selectedControl.controlPerformers ?? []).map((item: any) => item.roleType).join(", ")} />
                <Detail label="Control Reviewer" value={selectedControl.controlReviewer?.roleType} />
                <Detail label="Approval Authority" value={selectedControl.approvalAuthority?.roleType} />
                <Detail label="Implementation Status" value={selectedControl.implementation?.status} />
                <Detail label="Execution Method" value={selectedControl.execution?.method} />
                <Detail label="Execution Trigger" value={selectedControl.execution?.trigger} />
                <Detail label="Monitoring Required" value={selectedControl.monitoring?.required ? "Yes" : "No"} />
                <Detail label="Review Frequency" value={selectedControl.review?.frequency} />
                <Detail label="Next Review Date" value={selectedControl.review?.nextReviewDate} />
                <div className="md:col-span-2">
                  <Detail label="Control Objective" value={selectedControl.controlObjective} />
                </div>
                <div className="md:col-span-2">
                  <Detail label="Control Description" value={selectedControl.controlDescription} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  wide,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  wide?: boolean;
  type?: string;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-1 block text-sm font-medium text-[#18202b]">
        {label}{required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#8d96a3]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-1 block text-sm font-medium text-[#18202b]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b] outline-none focus:border-[#8d96a3]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-medium text-[#18202b]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-[#d7dce1] bg-white px-3 py-2 text-sm text-[#18202b]"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-[#7a838e]">{label}</div>
      <div className="rounded-md border border-[#e1e5e9] bg-[#f8f9fa] px-3 py-2 text-sm leading-6 text-[#18202b]">
        {value || "Not specified"}
      </div>
    </div>
  );
}