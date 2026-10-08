"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  title?: string | null;
  active: boolean;
};

type AISystem = {
  id: string;
  name: string;
  purpose: string;
  owner: string;
  provider?: string | null;
  model?: string | null;
  lifecycle_status: string;
};

const CHANGE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_ASSESSMENT",
  "APPROVED",
  "APPROVED_WITH_CONDITIONS",
  "DEFERRED",
  "REJECTED",
  "SCHEDULED",
  "IN_IMPLEMENTATION",
  "DEPLOYED",
  "UNDER_ENHANCED_MONITORING",
  "VALIDATED",
  "CLOSED",
  "CLOSED_WITH_CONDITIONS",
  "SUSPENDED",
  "ROLLED_BACK",
  "CANCELLED",
];

const CHANGE_TYPES = [
  "BUSINESS_REQUIREMENT",
  "PERFORMANCE_IMPROVEMENT",
  "RISK_TREATMENT",
  "INCIDENT",
  "SECURITY",
  "PRIVACY",
  "REGULATORY",
  "TECHNOLOGY_UPGRADE",
  "MODEL_UPGRADE",
  "DATA_CHANGE",
  "SUPPLIER_CHANGE",
  "CONTROL_IMPROVEMENT",
  "MONITORING_FINDING",
  "ASSURANCE_FINDING",
  "CORRECTIVE_ACTION",
  "STRATEGIC",
  "OTHER",
];

const TEST_METHODS = [
  "FUNCTIONAL",
  "REGRESSION",
  "PERFORMANCE",
  "FAIRNESS",
  "SECURITY",
  "PRIVACY",
  "ROBUSTNESS",
  "RESILIENCE",
  "EXPLAINABILITY",
  "HUMAN_OVERSIGHT",
  "INTEGRATION",
  "DATA_QUALITY",
  "ROLLBACK",
  "OTHER",
];

export default function ChangeManagementPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [performedBy, setPerformedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedChange, setSelectedChange] = useState<any | null>(null);
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);

  const [changeTitle, setChangeTitle] = useState("");
  const [changeType, setChangeType] = useState("MODEL_UPGRADE");
  const [status, setStatus] = useState("DRAFT");
  const [changeDescription, setChangeDescription] = useState("");
  const [changeOwner, setChangeOwner] = useState("CHANGE_OWNER");
  const [changeRequestor, setChangeRequestor] = useState("");
  const [changeObjective, setChangeObjective] = useState("");
  const [background, setBackground] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [proposedState, setProposedState] = useState("");
  const [plannedImplementationDate, setPlannedImplementationDate] = useState("");
  const [actualImplementationDate, setActualImplementationDate] = useState("");
  const [riskIds, setRiskIds] = useState("");
  const [controlIds, setControlIds] = useState("");
  const [approvalIds, setApprovalIds] = useState("");
  const [incidentIds, setIncidentIds] = useState("");
  const [assuranceIds, setAssuranceIds] = useState("");

  const [testingObjective, setTestingObjective] = useState("");
  const [testingMethods, setTestingMethods] = useState<string[]>(["FUNCTIONAL"]);
  const [testingOverallResult, setTestingOverallResult] = useState("NOT_STARTED");

  const [rollbackRequired, setRollbackRequired] = useState(false);
  const [rollbackAvailable, setRollbackAvailable] = useState(false);
  const [rollbackPreviousState, setRollbackPreviousState] = useState("");
  const [rollbackProcedure, setRollbackProcedure] = useState("");
  const [rollbackTested, setRollbackTested] = useState(false);

  const [emergencyUsed, setEmergencyUsed] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyRisk, setEmergencyRisk] = useState("");
  const [emergencyAuthority, setEmergencyAuthority] = useState("CHANGE_AUTHORITY");
  const [emergencyControls, setEmergencyControls] = useState("");
  const [retrospectiveRequired, setRetrospectiveRequired] = useState(false);
  const [retrospectiveReviewDate, setRetrospectiveReviewDate] = useState("");

  const [reviewFrequency, setReviewFrequency] = useState("ANNUAL");
  const [nextReviewDate, setNextReviewDate] = useState("");
  const [reviewOwner, setReviewOwner] = useState("CHANGE_REVIEW_OWNER");
  const [reviewCriteria, setReviewCriteria] = useState("");

  function listValue(value: unknown) {
    if (value === null || value === undefined || value === "") {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === "string" ? item.trim() : String(item)
      ).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [String(value)];
  }

  function resetForm() {
    setEditingChangeId(null);
    setSaved(false);
    setPerformedBy("");
    setChangeTitle("");
    setChangeType("MODEL_UPGRADE");
    setStatus("DRAFT");
    setChangeDescription("");
    setChangeOwner("CHANGE_OWNER");
    setChangeRequestor("");
    setChangeObjective("");
    setBackground("");
    setCurrentState("");
    setProposedState("");
    setPlannedImplementationDate("");
    setActualImplementationDate("");
    setRiskIds("");
    setControlIds("");
    setApprovalIds("");
    setIncidentIds("");
    setAssuranceIds("");
    setTestingObjective("");
    setTestingMethods(["FUNCTIONAL"]);
    setTestingOverallResult("NOT_STARTED");
    setRollbackRequired(false);
    setRollbackAvailable(false);
    setRollbackPreviousState("");
    setRollbackProcedure("");
    setRollbackTested(false);
    setEmergencyUsed(false);
    setEmergencyReason("");
    setEmergencyRisk("");
    setEmergencyAuthority("CHANGE_AUTHORITY");
    setEmergencyControls("");
    setRetrospectiveRequired(false);
    setRetrospectiveReviewDate("");
    setReviewFrequency("ANNUAL");
    setNextReviewDate("");
    setReviewOwner("CHANGE_REVIEW_OWNER");
    setReviewCriteria("");
  }

  function editChange(change: any) {
    setEditingChangeId(change.id);
    setSelectedChange(null);
    setSaved(false);

    setChangeTitle(change.changeTitle || "");
    setPerformedBy(change.performedBy || "");
    setChangeType(change.changeType || "MODEL_UPGRADE");
    setStatus(change.status || "DRAFT");
    setChangeDescription(change.changeDescription || "");
    setChangeOwner(change.changeOwner?.roleType || "CHANGE_OWNER");
    setChangeRequestor(change.changeRequestor?.roleType || "");
    setChangeObjective(change.changeObjective || "");
    setBackground(change.background || "");
    setCurrentState(change.currentState || "");
    setProposedState(change.proposedState || "");
    setPlannedImplementationDate(change.plannedImplementationDate || "");
    setActualImplementationDate(change.actualImplementationDate || "");
    setRiskIds((change.riskIds || []).join(", "));
    setControlIds((change.controlIds || []).join(", "));
    setApprovalIds((change.approvalIds || []).join(", "));
    setIncidentIds((change.incidentIds || []).join(", "));
    setAssuranceIds((change.assuranceIds || []).join(", "));

    setTestingObjective(change.testing?.objective || "");
    setTestingMethods(change.testing?.methods || ["FUNCTIONAL"]);
    setTestingOverallResult(change.testing?.overallResult || "NOT_STARTED");

    setRollbackRequired(Boolean(change.rollback?.required));
    setRollbackAvailable(Boolean(change.rollback?.available));
    setRollbackPreviousState(change.rollback?.approvedPreviousState || "");
    setRollbackProcedure(change.rollback?.procedureReference || "");
    setRollbackTested(Boolean(change.rollback?.tested));

    setEmergencyUsed(Boolean(change.emergencyChange?.used));
    setEmergencyReason(change.emergencyChange?.reason || "");
    setEmergencyRisk(change.emergencyChange?.immediateRisk || "");
    setEmergencyAuthority(change.emergencyChange?.authority?.roleType || "CHANGE_AUTHORITY");
    setEmergencyControls((change.emergencyChange?.immediateControls || []).join(", "));
    setRetrospectiveRequired(Boolean(change.emergencyChange?.retrospectiveReviewRequired));
    setRetrospectiveReviewDate(change.emergencyChange?.retrospectiveReviewDate || "");

    setReviewFrequency(change.review?.frequency || "ANNUAL");
    setNextReviewDate(change.review?.nextReviewDate || "");
    setReviewOwner(change.review?.reviewOwner?.roleType || "CHANGE_REVIEW_OWNER");
    setReviewCriteria((change.review?.triggeredReviewCriteria || []).join(", "));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadChanges() {
    const response = await fetch(
      `/api/ai-systems/${id}/change`
    );

    if (!response.ok) {
      throw new Error("Unable to load changes.");
    }

    const data = await response.json();
    setChanges(Array.isArray(data) ? data : data.value || []);
  }

  async function saveChange() {
    setError("");
    setSaved(false);

    if (!changeTitle.trim() || !changeDescription.trim()) {
      setError("Change title and change description are required.");
      return;
    }

    try {
      const response = await fetch(
        `/api/ai-systems/${id}/change${
          editingChangeId ? `/${editingChangeId}` : ""
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            objectType: "CHANGE",
            objectVersion: "0.1",
            schemaVersion: "0.1",
            status,
            performedBy: performedBy || null,
            aiSystemId: id,
            changeTitle: changeTitle.trim(),
            changeType,
            changeOwner: {
              roleType: changeOwner,
            },
            changeRequestor: changeRequestor.trim()
              ? { roleType: changeRequestor.trim() }
              : undefined,
            changeDescription: changeDescription.trim(),
            changeObjective: changeObjective.trim() || undefined,
            background: background.trim() || undefined,
            currentState: currentState.trim() || undefined,
            proposedState: proposedState.trim() || undefined,
            plannedImplementationDate:
              plannedImplementationDate || undefined,
            actualImplementationDate:
              actualImplementationDate || undefined,
            riskIds: listValue(riskIds),
            controlIds: listValue(controlIds),
            approvalIds: listValue(approvalIds),
            incidentIds: listValue(incidentIds),
            assuranceIds: listValue(assuranceIds),
            testing: {
              objective: testingObjective.trim() || undefined,
              methods: testingMethods,
              overallResult: testingOverallResult,
            },
            rollback: {
              required: rollbackRequired,
              available: rollbackAvailable,
              approvedPreviousState:
                rollbackPreviousState.trim() || undefined,
              procedureReference: rollbackProcedure.trim() || undefined,
              tested: rollbackTested,
            },
            emergencyChange: {
              used: emergencyUsed,
              reason: emergencyReason.trim() || undefined,
              immediateRisk: emergencyRisk.trim() || undefined,
              authority: {
                roleType: emergencyAuthority,
              },
              immediateControls: listValue(emergencyControls),
              retrospectiveReviewRequired: retrospectiveRequired,
              retrospectiveReviewDate:
                retrospectiveReviewDate || undefined,
            },
            review: {
              frequency: reviewFrequency,
              nextReviewDate: nextReviewDate || undefined,
              reviewOwner: {
                roleType: reviewOwner,
              },
              triggeredReviewCriteria: listValue(reviewCriteria),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save change.");
      }

      const savedChange = await response.json();

      if (editingChangeId) {
        setChanges((current) =>
          current.map((item) =>
            item.id === editingChangeId ? savedChange : item
          )
        );
      } else {
        setChanges((current) => [savedChange, ...current]);
      }

      setSaved(true);
      setEditingChangeId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save change.");
    }
  }

  async function deleteChange(change: any) {
    if (!window.confirm(`Delete change "${change.changeTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/ai-systems/${id}/change/${change.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete change.");
      }

      setChanges((current) =>
        current.filter((item) => item.id !== change.id)
      );

      if (selectedChange?.id === change.id) {
        setSelectedChange(null);
      }

      if (editingChangeId === change.id) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete change.");
    }
  }

  function toggleTestMethod(method: string) {
    setTestingMethods((current) =>
      current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method]
    );
  }

  useEffect(() => {
    async function load() {
      try {
        const [systemsResponse, usersResponse] = await Promise.all([
          fetch("/api/ai-systems"),
          fetch("/api/users"),
          loadChanges(),
        ]);

        if (!systemsResponse.ok) {
          throw new Error("Unable to load AI systems.");
        }

        const systems: AISystem[] = await systemsResponse.json();
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : usersData.value || []);
        setSystem(systems.find((item) => item.id === id) || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load page.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <main className="p-8">Loading Change Management...</main>;
  }

  if (!system) {
    return <main className="p-8">AI System not found.</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <a href={`/ai-systems/${id}`} className="text-sm text-[#626b77] hover:text-[#18202b]">
            Back to AI System Workspace
          </a>
          <h1 className="mt-3 text-2xl font-semibold text-[#18202b]">Change Management</h1>
          <p className="mt-1 text-sm text-[#626b77]">
            Record, assess, implement, validate, and close changes affecting this AI system.
          </p>
        </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Change saved successfully.
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {editingChangeId ? "Edit Change" : "Record Change"}
          </h2>
          <p className="text-sm text-slate-500">
            Record the change and its governance impact.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Change Title</span>
            <input
              value={changeTitle}
              onChange={(e) => setChangeTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Change Type</span>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {CHANGE_TYPES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {CHANGE_STATUSES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Change Owner</span>
            <input
              value={changeOwner}
              onChange={(e) => setChangeOwner(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Change Requestor</span>
            <input
              value={changeRequestor}
              onChange={(e) => setChangeRequestor(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Performed by</span>
            <select
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Actor not recorded</option>
              {users.filter((user) => user.active).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}{user.title ? ` - ${user.title}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Planned Implementation Date</span>
            <input
              type="date"
              value={plannedImplementationDate}
              onChange={(e) => setPlannedImplementationDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Actual Implementation Date</span>
            <input
              type="date"
              value={actualImplementationDate}
              onChange={(e) => setActualImplementationDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm font-medium">Change Description</span>
          <textarea
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Change Objective", changeObjective, setChangeObjective],
            ["Background", background, setBackground],
            ["Current State", currentState, setCurrentState],
            ["Proposed State", proposedState, setProposedState],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="space-y-1">
              <span className="text-sm font-medium">{label as string}</span>
              <textarea
                value={value as string}
                onChange={(e) => (setter as (value: string) => void)(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Risk IDs", riskIds, setRiskIds],
            ["Control IDs", controlIds, setControlIds],
            ["Approval IDs", approvalIds, setApprovalIds],
            ["Incident IDs", incidentIds, setIncidentIds],
            ["Assurance IDs", assuranceIds, setAssuranceIds],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="space-y-1">
              <span className="text-sm font-medium">{label as string}</span>
              <input
                value={value as string}
                onChange={(e) => (setter as (value: string) => void)(e.target.value)}
                placeholder="Comma-separated IDs"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Testing</h2>
          <p className="text-sm text-slate-500">
            Define the testing plan and overall result.
          </p>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm font-medium">Testing Objective</span>
          <textarea
            value={testingObjective}
            onChange={(e) => setTestingObjective(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium">Test Methods</p>
          <div className="grid gap-2 md:grid-cols-3">
            {TEST_METHODS.map((method) => (
              <label key={method} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={testingMethods.includes(method)}
                  onChange={() => toggleTestMethod(method)}
                />
                {method}
              </label>
            ))}
          </div>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm font-medium">Overall Result</span>
          <select
            value={testingOverallResult}
            onChange={(e) => setTestingOverallResult(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {["NOT_STARTED", "IN_PROGRESS", "PASSED", "PASSED_WITH_CONDITIONS", "FAILED", "INCONCLUSIVE"].map(
              (value) => (
                <option key={value}>{value}</option>
              )
            )}
          </select>
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">Rollback</h2>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rollbackRequired}
              onChange={(e) => setRollbackRequired(e.target.checked)}
            />
            Rollback required
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rollbackAvailable}
              onChange={(e) => setRollbackAvailable(e.target.checked)}
            />
            Rollback available
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rollbackTested}
              onChange={(e) => setRollbackTested(e.target.checked)}
            />
            Rollback tested
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Approved Previous State</span>
            <textarea
              value={rollbackPreviousState}
              onChange={(e) => setRollbackPreviousState(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Procedure Reference</span>
            <input
              value={rollbackProcedure}
              onChange={(e) => setRollbackProcedure(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">Emergency Change</h2>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={emergencyUsed}
            onChange={(e) => setEmergencyUsed(e.target.checked)}
          />
          Emergency change used
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Reason</span>
            <textarea
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Immediate Risk</span>
            <textarea
              value={emergencyRisk}
              onChange={(e) => setEmergencyRisk(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Authority</span>
            <input
              value={emergencyAuthority}
              onChange={(e) => setEmergencyAuthority(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Immediate Controls</span>
            <input
              value={emergencyControls}
              onChange={(e) => setEmergencyControls(e.target.value)}
              placeholder="Comma-separated controls"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={retrospectiveRequired}
              onChange={(e) => setRetrospectiveRequired(e.target.checked)}
            />
            Retrospective review required
          </label>

          <label className="space-y-1">
            <span className="mr-2 font-medium">Retrospective Review Date</span>
            <input
              type="date"
              value={retrospectiveReviewDate}
              onChange={(e) => setRetrospectiveReviewDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">Change Review</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Frequency</span>
            <input
              value={reviewFrequency}
              onChange={(e) => setReviewFrequency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Next Review Date</span>
            <input
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Review Owner</span>
            <input
              value={reviewOwner}
              onChange={(e) => setReviewOwner(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Triggered Review Criteria</span>
            <input
              value={reviewCriteria}
              onChange={(e) => setReviewCriteria(e.target.value)}
              placeholder="Comma-separated criteria"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveChange}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            {editingChangeId ? "Update Change" : "Save Change"}
          </button>

          {editingChangeId && (
            <button
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Change History</h2>

        {changes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No changes recorded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {changes.map((change) => (
              <div
                key={change.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {change.changeTitle || "Untitled Change"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {change.changeDescription}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {change.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {change.changeType}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedChange(change)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => editChange(change)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteChange(change)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedChange.changeTitle || "Change Details"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedChange.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedChange(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Overview</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div><div className="text-xs text-slate-500">Status</div><div className="font-medium">{selectedChange.status || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Change Type</div><div className="font-medium">{selectedChange.changeType || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Change Owner</div><div className="font-medium">{selectedChange.changeOwner?.roleType || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Requestor</div><div className="font-medium">{selectedChange.changeRequestor?.roleType || "—"}</div></div>
    </div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Description & Objective</h3>
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <div><div className="text-xs text-slate-500">Description</div><div className="mt-1 whitespace-pre-wrap">{selectedChange.changeDescription || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Objective</div><div className="mt-1 whitespace-pre-wrap">{selectedChange.changeObjective || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Background</div><div className="mt-1 whitespace-pre-wrap">{selectedChange.background || "—"}</div></div>
    </div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Current & Proposed State</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-slate-200 p-4"><div className="text-xs text-slate-500">Current State</div><div className="mt-1 whitespace-pre-wrap">{selectedChange.currentState || "—"}</div></div>
      <div className="rounded-lg border border-slate-200 p-4"><div className="text-xs text-slate-500">Proposed State</div><div className="mt-1 whitespace-pre-wrap">{selectedChange.proposedState || "—"}</div></div>
    </div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Implementation</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div><div className="text-xs text-slate-500">Planned Implementation</div><div className="font-medium">{selectedChange.plannedImplementationDate || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Actual Implementation</div><div className="font-medium">{selectedChange.actualImplementationDate || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Target Closure</div><div className="font-medium">{selectedChange.targetClosureDate || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Affected Components</div><div className="font-medium">{listValue(selectedChange.affectedComponents)}</div></div>
    </div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Testing</h3>
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div><div className="text-xs text-slate-500">Objective</div><div className="font-medium">{selectedChange.testing?.objective || "—"}</div></div>
        <div><div className="text-xs text-slate-500">Overall Result</div><div className="font-medium">{selectedChange.testing?.overallResult || "—"}</div></div>
        </div>
      <div className="mt-4"><div className="text-xs text-slate-500">Methods</div><div className="font-medium">{listValue(selectedChange.testing?.methods)}</div></div>
    </div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Rollback</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div><div className="text-xs text-slate-500">Required</div><div className="font-medium">{selectedChange.rollback?.required === undefined ? "—" : selectedChange.rollback.required ? "Yes" : "No"}</div></div>
      <div><div className="text-xs text-slate-500">Available</div><div className="font-medium">{selectedChange.rollback?.available === undefined ? "—" : selectedChange.rollback.available ? "Yes" : "No"}</div></div>
      <div><div className="text-xs text-slate-500">Tested</div><div className="font-medium">{selectedChange.rollback?.tested === undefined ? "—" : selectedChange.rollback.tested ? "Yes" : "No"}</div></div>
      <div><div className="text-xs text-slate-500">Previous State</div><div className="font-medium">{selectedChange.rollback?.approvedPreviousState || "—"}</div></div>
    </div>
    <div className="mt-4"><div className="text-xs text-slate-500">Procedure Reference</div><div className="font-medium">{selectedChange.rollback?.procedureReference || "—"}</div></div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Emergency Change</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div><div className="text-xs text-slate-500">Used</div><div className="font-medium">{selectedChange.emergencyChange?.used === undefined ? "—" : selectedChange.emergencyChange.used ? "Yes" : "No"}</div></div>
      <div><div className="text-xs text-slate-500">Authority</div><div className="font-medium">{selectedChange.emergencyChange?.authority?.roleType || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Reason</div><div className="font-medium">{selectedChange.emergencyChange?.reason || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Immediate Risk</div><div className="font-medium">{selectedChange.emergencyChange?.immediateRisk || "—"}</div></div>
    </div>
    <div className="mt-4"><div className="text-xs text-slate-500">Immediate Controls</div><div className="font-medium">{listValue(selectedChange.emergencyChange?.immediateControls)}</div></div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Review</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div><div className="text-xs text-slate-500">Frequency</div><div className="font-medium">{selectedChange.review?.frequency || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Next Review Date</div><div className="font-medium">{selectedChange.review?.nextReviewDate || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Review Owner</div><div className="font-medium">{selectedChange.review?.reviewOwner?.roleType || "—"}</div></div>
      <div><div className="text-xs text-slate-500">Triggered Criteria</div><div className="font-medium">{listValue(selectedChange.review?.triggeredReviewCriteria)}</div></div>
    </div>
  </section>

  <section>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Related Records</h3>
    <div className="grid gap-4 md:grid-cols-2">
      <div><div className="text-xs text-slate-500">Risk IDs</div><div className="font-medium">{listValue(selectedChange.riskIds)}</div></div>
      <div><div className="text-xs text-slate-500">Control IDs</div><div className="font-medium">{listValue(selectedChange.controlIds)}</div></div>
      <div><div className="text-xs text-slate-500">Approval IDs</div><div className="font-medium">{listValue(selectedChange.approvalIds)}</div></div>
      <div><div className="text-xs text-slate-500">Incident IDs</div><div className="font-medium">{listValue(selectedChange.incidentIds)}</div></div>
      <div><div className="text-xs text-slate-500">Assurance IDs</div><div className="font-medium">{listValue(selectedChange.assuranceIds)}</div></div>
      <div><div className="text-xs text-slate-500">Evidence IDs</div><div className="font-medium">{listValue(selectedChange.evidenceIds)}</div></div>
    </div>
  </section>
</div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
