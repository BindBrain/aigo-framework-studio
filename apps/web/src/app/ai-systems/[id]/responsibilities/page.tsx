"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  title?: string | null;
  organizationUnit?: string | null;
  active: boolean;
  activeFrom?: string | null;
  activeTo?: string | null;
};

type Responsibility = {
  id: string;
  aiSystemId: string;
  userId: string;
  role: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
};

function display(value?: string | null) {
  if (!value) return "Not specified";
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Present";
  return new Date(value).toLocaleDateString();
}

export default function ResponsibilitiesPage() {
  const params = useParams();
  const id = params.id as string;

  const [users, setUsers] = useState<User[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [personForm, setPersonForm] = useState({ name: "", title: "", organization_unit: "", active: true });
  const [assignmentForm, setAssignmentForm] = useState({ userId: "", role: "SYSTEM_OWNER", effectiveFrom: new Date().toISOString().slice(0, 16) });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", title: "", organization_unit: "", active: true });

  useEffect(() => {
    async function load() {
      try {
        const [usersResponse, responsibilitiesResponse] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/ai-systems/${id}/responsibilities`),
        ]);

        if (!usersResponse.ok || !responsibilitiesResponse.ok) {
          throw new Error("Unable to load responsibility records.");
        }

        const usersData = await usersResponse.json();
        const responsibilitiesData = await responsibilitiesResponse.json();

        setUsers(Array.isArray(usersData) ? usersData : usersData.value || []);
        setResponsibilities(
          Array.isArray(responsibilitiesData)
            ? responsibilitiesData
            : responsibilitiesData.value || []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load responsibility records."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function createPerson(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personForm),
    });
    if (!response.ok) {
      setError("Unable to create person.");
      return;
    }
    const created = await response.json();
    setUsers((current) => [...current, created]);
    setAssignmentForm((current) => ({ ...current, userId: created.id }));
    setPersonForm({ name: "", title: "", organization_unit: "", active: true });
  }

  async function createAssignment(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/ai-systems/${id}/responsibilities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: assignmentForm.userId,
        role: assignmentForm.role,
        effective_from: new Date(assignmentForm.effectiveFrom).toISOString(),
      }),
    });
    if (!response.ok) {
      setError("Unable to create responsibility assignment.");
      return;
    }
    const created = await response.json();
    setResponsibilities((current) => [...current, created]);
  }
  const userById = new Map(users.map((user) => [user.id, user]));

  async function updatePerson(event: React.FormEvent) {
    event.preventDefault();
    if (!editingUser) return;
    setError("");

    const response = await fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.detail || "Unable to update person.");
      return;
    }

    const updated = await response.json();
    setUsers((current) =>
      current.map((user) => user.id === updated.id ? updated : user)
    );
    setEditingUser(null);
  }

  async function deletePerson(user: User) {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setError("");

    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.detail || "Unable to delete person.");
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== user.id));
    if (assignmentForm.userId === user.id) {
      setAssignmentForm((current) => ({ ...current, userId: "" }));
    }
  }
  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-[#626b77] hover:text-[#18202b]"
        >
          &#8592; Back to AI system
        </Link>

        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9299a3]">
            Governance Workspace / Responsibilities
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#18202b]">
            People &amp; Responsibilities
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#737b87]">
            Maintain accountable people, governance roles, and responsibility
            history for this AI system.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6 text-sm text-[#737b87]">
            Loading responsibility records...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-white p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
              <h2 className="text-base font-semibold text-[#18202b]">
                Responsibility history
              </h2>
              <p className="mt-1 text-sm text-[#737b87]">
                Historical assignments are retained rather than overwritten.
              </p>

              <div className="mt-5 space-y-3">
                {responsibilities.length > 0 ? (
                  responsibilities.map((assignment) => {
                    const user = userById.get(assignment.userId);

                    async function updatePerson(event: React.FormEvent) {
    event.preventDefault();
    if (!editingUser) return;
    setError("");

    const response = await fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.detail || "Unable to update person.");
      return;
    }

    const updated = await response.json();
    setUsers((current) =>
      current.map((user) => user.id === updated.id ? updated : user)
    );
    setEditingUser(null);
  }

  async function deletePerson(user: User) {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setError("");

    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.detail || "Unable to delete person.");
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== user.id));
    if (assignmentForm.userId === user.id) {
      setAssignmentForm((current) => ({ ...current, userId: "" }));
    }
  }
  return (
                      <div
                        key={assignment.id}
                        className="rounded-lg border border-[#e1e5e9] bg-[#fafbfc] p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <div className="text-sm font-semibold text-[#18202b]">
                              {user?.name || "Person not found"}
                            </div>
                            <div className="mt-1 text-sm text-[#626b77]">
                              {display(assignment.role)}
                            </div>
                            <div className="mt-2 text-xs text-[#737b87]">
                              {user?.title || "Title not specified"}
                              {user?.organizationUnit
                                ? ` / ${user.organizationUnit}`
                                : ""}
                            </div>
                          </div>

                          <div className="text-sm text-[#626b77] md:text-right">
                            <div>
                              {formatDate(assignment.effectiveFrom)} /{" "}
                              {formatDate(assignment.effectiveTo)}
                            </div>
                            <div className="mt-1 text-xs text-[#9299a3]">
                              {user?.active ? "Active person" : "Inactive person"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-[#cfd5dc] p-5 text-sm text-[#737b87]">
                    No responsibility assignments have been recorded yet.
                  </div>
                )}
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
              <h2 className="text-base font-semibold text-[#18202b]">Assign responsibility</h2>
              <p className="mt-1 text-sm text-[#737b87]">Assign an accountable governance role to a registered person.</p>
              <form onSubmit={createAssignment} className="mt-5 grid gap-4 md:grid-cols-2">
                <select required value={assignmentForm.userId} onChange={(e) => setAssignmentForm({ ...assignmentForm, userId: e.target.value })} className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm">
                  <option value="">Select person</option>
                  {users.filter((user) => user.active).map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <select value={assignmentForm.role} onChange={(e) => setAssignmentForm({ ...assignmentForm, role: e.target.value })} className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm">
                  <option value="SYSTEM_OWNER">System Owner</option>
                  <option value="GOVERNANCE_OWNER">Governance Owner</option>
                  <option value="RISK_OWNER">Risk Owner</option>
                  <option value="CONTROL_OWNER">Control Owner</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="APPROVER">Approver</option>
                </select>
                <label className="text-sm text-[#626b77]">
                  Effective from
                  <input required type="datetime-local" value={assignmentForm.effectiveFrom} onChange={(e) => setAssignmentForm({ ...assignmentForm, effectiveFrom: e.target.value })} className="mt-1 block w-full rounded-md border border-[#d7dce2] px-3 py-2 text-sm" />
                </label>
                <button type="submit" className="self-end rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#303946]">Assign responsibility</button>
              </form>
            </section>
            <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
            {editingUser && (
              <section className="mt-8 rounded-lg border border-[#e1e5e9] bg-white p-6">
                <h2 className="text-base font-semibold text-[#18202b]">Edit person</h2>
                <form onSubmit={updatePerson} className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    value={editForm.name}
                    onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                    placeholder="Name"
                    className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm"
                    required
                  />
                  <input
                    value={editForm.title}
                    onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                    placeholder="Title"
                    className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm"
                  />
                  <input
                    value={editForm.organization_unit}
                    onChange={(event) => setEditForm({ ...editForm, organization_unit: event.target.value })}
                    placeholder="Organization unit"
                    className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm text-[#626b77]">
                    <input
                      type="checkbox"
                      checked={editForm.active}
                      onChange={(event) => setEditForm({ ...editForm, active: event.target.checked })}
                    />
                    Active
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <button type="submit" className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white">
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="rounded-md border border-[#d7dce2] px-4 py-2 text-sm font-medium text-[#626b77]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
            <section className="mt-6 rounded-lg border border-[#e1e5e9] bg-white p-6">
              <h2 className="text-base font-semibold text-[#18202b]">Add person</h2>
              <p className="mt-1 text-sm text-[#737b87]">Register a person who can hold governance responsibility.</p>
              <form onSubmit={createPerson} className="mt-5 grid gap-4 md:grid-cols-2">
                <input required placeholder="Name" value={personForm.name} onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })} className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm" />
                <input placeholder="Title" value={personForm.title} onChange={(e) => setPersonForm({ ...personForm, title: e.target.value })} className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm" />
                <input placeholder="Organization unit" value={personForm.organization_unit} onChange={(e) => setPersonForm({ ...personForm, organization_unit: e.target.value })} className="rounded-md border border-[#d7dce2] px-3 py-2 text-sm" />
                <label className="flex items-center gap-2 text-sm text-[#626b77]"><input type="checkbox" checked={personForm.active} onChange={(e) => setPersonForm({ ...personForm, active: e.target.checked })} /> Active</label>
                <button type="submit" className="rounded-md bg-[#18202b] px-4 py-2 text-sm font-medium text-white hover:bg-[#303946] md:col-span-2">Add person</button>
              </form>
            </section>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-[#18202b]">
                    People directory
                  </h2>
                  <p className="mt-1 text-sm text-[#737b87]">
                    People available for governance responsibility assignment.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border border-[#e1e5e9] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-[#18202b]">
                            {user.name}
                          </div>
                          <div className="mt-1 text-sm text-[#626b77]">
                            {user.title || "Title not specified"}
                          </div>
                          <div className="mt-1 text-xs text-[#9299a3]">
                            {user.organizationUnit || "Organization unit not specified"}
                            {" / "}
                            {user.active ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(user);
                              setEditForm({
                                name: user.name,
                                title: user.title || "",
                                organization_unit: user.organizationUnit || "",
                                active: user.active,
                              });
                            }}
                            className="rounded-md border border-[#d7dce2] px-3 py-1.5 text-xs font-medium text-[#18202b]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePerson(user)}
                            className="rounded-md border border-[#d7dce2] px-3 py-1.5 text-xs font-medium text-[#626b77]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[#cfd5dc] p-5 text-sm text-[#737b87]">
                    No people have been registered yet.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
