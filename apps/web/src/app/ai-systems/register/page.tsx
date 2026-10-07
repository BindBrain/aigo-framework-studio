"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterAISystemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);

    const payload = {
      systemName: String(form.get("systemName") ?? "").trim(),
      intendedPurpose: String(form.get("intendedPurpose") ?? "").trim(),
      systemOwner: {
        roleType: "SYSTEM_OWNER",
        personReference: String(form.get("systemOwner") ?? "").trim(),
      },
      classification: {
        level: String(form.get("classification") ?? "CLASS_1"),
      },
      status: String(form.get("status") ?? "DRAFT"),
      currentLifecycleStage: String(
        form.get("lifecycleStage") ?? "IDENTIFY"
      ),
      description: String(form.get("description") ?? "").trim() || null,
      model: {
        modelName: String(form.get("model") ?? "").trim() || null,
        provider: String(form.get("provider") ?? "").trim() || null,
      },
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/ai-systems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.detail || "The AI system could not be registered."
        );
      }

      router.push("/ai-systems");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The AI system could not be registered."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#18202b]">
      <header className="flex h-[68px] items-center justify-between border-b border-[#dfe3e8] bg-white px-5 sm:px-8">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9299a3]">
            AIGO Framework Studio
          </div>
          <div className="mt-0.5 text-sm font-semibold">
            Register AI System
          </div>
        </div>

        <Link
          href="/ai-systems"
          className="rounded-md border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#626b77] hover:bg-[#f7f8f9]"
        >
          Back to AI Systems
        </Link>
      </header>

      <main className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-10">
        <div className="max-w-3xl">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7b838e]">
            Governance registration
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Register an AI System
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#68717d]">
            Register the basic identity, purpose, ownership and governance
            classification of an AI system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7">
          <section className="border border-[#dfe3e8] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
              <div className="text-sm font-semibold">System Identity</div>
              <div className="mt-1 text-xs text-[#7b838e]">
                Basic information about the AI system.
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div className="sm:col-span-2">
                <label
                  htmlFor="systemName"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  AI system name
                </label>
                <input
                  id="systemName"
                  name="systemName"
                  type="text"
                  required
                  placeholder="e.g. Customer Support Assistant"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a0a6ae] focus:border-[#8c96a2]"
                />
              </div>

              <div>
                <label
                  htmlFor="provider"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Provider
                </label>
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  placeholder="e.g. OpenAI"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a0a6ae] focus:border-[#8c96a2]"
                />
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Model
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  placeholder="Model or model family"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a0a6ae] focus:border-[#8c96a2]"
                />
              </div>
            </div>
          </section>

          <section className="border border-[#dfe3e8] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
              <div className="text-sm font-semibold">Purpose and Ownership</div>
              <div className="mt-1 text-xs text-[#7b838e]">
                Establish why the system exists and who owns it.
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="intendedPurpose"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Intended purpose
                </label>
                <textarea
                  id="intendedPurpose"
                  name="intendedPurpose"
                  rows={4}
                  required
                  placeholder="Describe the intended purpose of the AI system."
                  className="mt-2 w-full resize-y rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a0a6ae] focus:border-[#8c96a2]"
                />
              </div>

              <div>
                <label
                  htmlFor="systemOwner"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  System owner
                </label>
                <input
                  id="systemOwner"
                  name="systemOwner"
                  type="text"
                  required
                  placeholder="Person, team or organizational owner"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a0a6ae] focus:border-[#8c96a2]"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Additional information about the system."
                  className="mt-2 w-full resize-y rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a0a6ae] focus:border-[#8c96a2]"
                />
              </div>
            </div>
          </section>

          <section className="border border-[#dfe3e8] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
              <div className="text-sm font-semibold">Governance</div>
              <div className="mt-1 text-xs text-[#7b838e]">
                Initial AIGO classification and lifecycle position.
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <label
                  htmlFor="classification"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Classification
                </label>
                <select
                  id="classification"
                  name="classification"
                  defaultValue="CLASS_1"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8c96a2]"
                >
                  <option value="CLASS_1">Class 1</option>
                  <option value="CLASS_2">Class 2</option>
                  <option value="CLASS_3">Class 3</option>
                  <option value="CLASS_4">Class 4</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="DRAFT"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8c96a2]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PROPOSED">Proposed</option>
                  <option value="UNDER_ASSESSMENT">Under Assessment</option>
                  <option value="REGISTERED">Registered</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="lifecycleStage"
                  className="text-xs font-semibold text-[#343d48]"
                >
                  Lifecycle stage
                </label>
                <select
                  id="lifecycleStage"
                  name="lifecycleStage"
                  defaultValue="IDENTIFY"
                  className="mt-2 w-full rounded-md border border-[#cfd5dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8c96a2]"
                >
                  <option value="GOVERN">Govern</option>
                  <option value="IDENTIFY">Identify</option>
                  <option value="CLASSIFY">Classify</option>
                  <option value="ASSESS">Assess</option>
                  <option value="TREAT">Treat</option>
                  <option value="APPROVE">Approve</option>
                  <option value="DEPLOY">Deploy</option>
                  <option value="OPERATE">Operate</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="ASSURE">Assure</option>
                  <option value="IMPROVE">Improve</option>
                  <option value="CHANGE">Change</option>
                  <option value="CONTINUE">Continue</option>
                  <option value="RETIRE">Retire</option>
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div className="border border-[#e3caca] bg-[#fff8f8] px-4 py-3 text-sm text-[#8a4545]">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/ai-systems"
              className="rounded-md border border-[#cfd5dc] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#59636f] hover:bg-[#f7f8f9]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#18202b] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#27313e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Registering..." : "Register AI System"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}