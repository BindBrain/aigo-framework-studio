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

  const userById = new Map(users.map((user) => [user.id, user]));

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
