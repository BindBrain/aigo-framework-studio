"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Approval = {
  id?: string;
  status?: string;
  approval_scope?: string | null;
  approval_notes?: string | null;
  approval_outcome?: string;
  performedBy?: string | null;
};

type User = {
  id: string;
  name: string;
  title?: string | null;
  active: boolean;
};

export default function ApprovalPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [approval, setApproval] = useState<Approval | null>(null);
  const [approvalScope, setApprovalScope] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalOutcome, setApprovalOutcome] = useState("NOT_ASSESSED");
  const [users, setUsers] = useState<User[]>([]);
  const [performedBy, setPerformedBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApproval() {
      try {
        const [response, usersResponse] = await Promise.all([
          fetch(`/api/ai-systems/${id}/approval`),
          fetch("/api/users"),
        ]);

        if (!response.ok) {
          throw new Error("Unable to load approval");
        }

        const data = await response.json();
        const usersData = await usersResponse.json();

        setApproval(data);
        setSaved(Boolean(data.id));
        setApprovalScope(data.approval_scope || "");
        setApprovalNotes(data.approval_notes || "");
        setApprovalOutcome(data.approval_outcome || "NOT_ASSESSED");
        setUsers(Array.isArray(usersData) ? usersData : usersData.value || []);
        setPerformedBy(data.performedBy || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load approval");
      } finally {
        setLoading(false);
      }
    }

    loadApproval();
  }, [id]);

  async function saveApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/ai-systems/${id}/approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DRAFT",
            approvalType: "GOVERNANCE_APPROVAL",
            objectVersion: "0.1",
            schemaVersion: "0.1",
            ai_system_id: id,
            approval_scope: approvalScope || null,
            approval_notes: approvalNotes || null,
            approval_outcome: approvalOutcome,
            performedBy: performedBy || null,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unable to save approval: ${errorText}`);
      }

      const savedApproval = await response.json();
      setApproval(savedApproval);
      setPerformedBy(savedApproval.performedBy || "");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save approval");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    if (approval) {
      setApprovalScope(approval.approval_scope || "");
      setApprovalNotes(approval.approval_notes || "");
      setApprovalOutcome(approval.approval_outcome || "NOT_ASSESSED");
      setPerformedBy(approval.performedBy || "");
      setSaved(true);
      setError("");
    }
  }

  async function deleteApproval() {
    if (!approval?.id) return;
    if (!window.confirm("Delete this approval record? This cannot be undone.")) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/ai-systems/${id}/approval`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unable to delete approval: ${errorText}`);
      }

      setApproval(null);
      setApprovalScope("");
      setApprovalNotes("");
      setApprovalOutcome("NOT_ASSESSED");
      setPerformedBy("");
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete approval");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <a
          href={`/ai-systems/${id}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to Governance Workspace
        </a>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">Governance Lifecycle</p>
          <h1 className="mt-1 text-3xl font-semibold">Approval</h1>
          <p className="mt-2 text-sm text-slate-600">
            Record the governance approval decision for this AI system.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            Loading approval...
          </div>
        ) : (
          <form onSubmit={saveApproval} className="mt-8 space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Approval Record</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                  {approval?.status || "NOT_STARTED"}
                </span>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium">Approval Scope</label>
                  <textarea
                    value={approvalScope}
                    onChange={(event) => setApprovalScope(event.target.value)}
                    disabled={saved || saving}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
                    placeholder="Describe what is being approved."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Approval Notes</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(event) => setApprovalNotes(event.target.value)}
                    disabled={saved || saving}
                    rows={5}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
                    placeholder="Record the approval rationale, conditions, or notes."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Performed by</label>
                  <select
                    value={performedBy}
                    onChange={(event) => setPerformedBy(event.target.value)}
                    disabled={saved || saving}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                  >
                    <option value="">Actor not recorded</option>
                    {users.filter((user) => user.active).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}{user.title ? ` - ${user.title}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Approval Outcome</label>
                  <select
                    value={approvalOutcome}
                    onChange={(event) => setApprovalOutcome(event.target.value)}
                    disabled={saved || saving}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                  >
                    <option value="NOT_ASSESSED">Not assessed</option>
                    <option value="APPROVED">Approved</option>
                    <option value="APPROVED_WITH_CONDITIONS">
                      Approved with conditions
                    </option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REQUIRES_REASSESSMENT">
                      Requires reassessment
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!saved && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving ? "Saving..." : approval?.id ? "Save Changes" : "Save Approval"}
                  </button>
                )}

                {approval?.id && saved && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSaved(false)}
                      disabled={saving}
                      className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={deleteApproval}
                      disabled={saving}
                      className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 disabled:opacity-50"
                    >
                      {saving ? "Please wait..." : "Delete"}
                    </button>
                  </>
                )}

                {approval?.id && !saved && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}

                {saved && approval?.id && (
                  <p className="text-sm text-slate-600">Approval record saved.</p>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </section>
          </form>
        )}
      </div>
    </main>
  );
}