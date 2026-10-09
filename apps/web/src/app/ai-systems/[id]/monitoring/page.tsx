"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Indicator = {
  indicatorId: string;
  name: string;
  category: string;
  measurementDefinition: string;
  measurementMethod?: string | null;
  frequency?: string | null;
  target?: number | null;
  active: boolean;
};

type Monitoring = {
  id?: string;
  objectType: string;
  objectVersion: string;
  schemaVersion: string;
  status: string;
  aiSystemId: string;
  monitoringObjectives: string[];
  indicators: Indicator[];
};

const FREQUENCY_OPTIONS = [
  "Continuous",
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
];

export default function MonitoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [object, setObject] = useState<Monitoring | null>(null);
  const [objective, setObjective] = useState("");
  const [indicatorName, setIndicatorName] = useState("");
  const [measurementDefinition, setMeasurementDefinition] = useState("");
  const [target, setTarget] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    params.then(async ({ id }) => {
      if (cancelled) return;

      setId(id);

      try {
        const response = await fetch(`/api/ai-systems/${id}/monitoring`);

        if (!response.ok) {
          if (!cancelled && response.status !== 404) {
            setMessage("Unable to load monitoring data.");
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setObject(data);
        }
      } catch {
        if (!cancelled) {
          setMessage("Unable to load monitoring data. Check your connection and try again.");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  async function saveMonitoring() {
    if (
      !objective.trim() ||
      !indicatorName.trim() ||
      !measurementDefinition.trim()
    ) {
      setMessage("Complete the objective, indicator name, and measurement definition.");
      return;
    }

    const parsedTarget = target.trim() === "" ? null : Number(target);

    if (
      target.trim() !== "" &&
      (!Number.isFinite(parsedTarget) || parsedTarget === null)
    ) {
      setMessage("Enter a valid numeric target or leave it blank.");
      return;
    }

    if (saving) return;

    const payload = {
      id: object?.id,
      objectType: "MONITORING",
      objectVersion: "1.0",
      schemaVersion: "0.1",
      status: object?.status || "DRAFT",
      aiSystemId: id,
      monitoringObjectives: [
        ...(object?.monitoringObjectives || []),
        objective.trim(),
      ],
      indicators: [
        ...(object?.indicators || []),
        {
          indicatorId: `IND-${Date.now()}`,
          name: indicatorName.trim(),
          category: "GOVERNANCE",
          measurementDefinition: measurementDefinition.trim(),
          target: parsedTarget,
          frequency,
          active: true,
        },
      ],
    };

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/ai-systems/${id}/monitoring`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setMessage("Unable to save monitoring. Please try again.");
        return;
      }

      setObject(await response.json());
      setObjective("");
      setIndicatorName("");
      setMeasurementDefinition("");
      setTarget("");
      setFrequency("Monthly");
      setMessage("Monitoring saved.");
    } catch {
      setMessage("Unable to save monitoring. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/ai-systems/${id}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          &#8592; Back to Governance Workspace
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">
            Governance Lifecycle
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Monitoring</h1>
          <p className="mt-2 text-slate-600">
            Define ongoing monitoring objectives and measurable indicators for
            this AI System.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Monitoring Arrangement</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
              {object?.status || "DRAFT"}
            </span>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Monitoring Objective</span>
              <input
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="e.g. Detect deterioration in system performance"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Indicator Name</span>
              <input
                value={indicatorName}
                onChange={(event) => setIndicatorName(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="e.g. AI system error rate"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Measurement Definition
              </span>
              <textarea
                value={measurementDefinition}
                onChange={(event) =>
                  setMeasurementDefinition(event.target.value)
                }
                className="min-h-24 rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Define what is measured and how deviations are investigated."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Target / Threshold</span>
              <input
                type="number"
                step="any"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="e.g. 99.5"
              />
              <span className="text-xs text-slate-500">
                Optional. Enter a numeric target in the indicator&apos;s own
                unit, such as 99.5 for a percentage. Define the unit and what
                happens when the threshold is breached in the measurement
                definition.
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Review Frequency</span>
              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">
                How often this indicator should be reviewed. This setting
                records the intended frequency; it does not schedule or perform
                monitoring automatically.
              </span>
            </label>

            <button
              type="button"
              onClick={saveMonitoring}
              disabled={saving}
              className="w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Monitoring"}
            </button>

            {message && (
              <p role="status" className="text-sm text-slate-600">
                {message}
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Monitoring Objectives</h2>

          <div className="mt-4 space-y-2">
            {(object?.monitoringObjectives || []).map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm"
              >
                {item}
              </div>
            ))}

            {!object?.monitoringObjectives?.length && (
              <p className="text-sm text-slate-500">
                No objectives defined.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Indicators</h2>

          <div className="mt-4 space-y-3">
            {(object?.indicators || []).map((indicator) => (
              <div
                key={indicator.indicatorId}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">{indicator.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {indicator.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {indicator.measurementDefinition}
                </p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-slate-500">Target / Threshold</dt>
                    <dd className="mt-1 font-medium">
                      {indicator.target != null
                        ? indicator.target
                        : "Not specified"}
                    </dd>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-slate-500">Review Frequency</dt>
                    <dd className="mt-1 font-medium">
                      {indicator.frequency?.trim() || "Not specified"}
                    </dd>
                  </div>

                  {indicator.measurementMethod?.trim() && (
                    <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                      <dt className="text-slate-500">Measurement Method</dt>
                      <dd className="mt-1 font-medium">
                        {indicator.measurementMethod}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}

            {!object?.indicators?.length && (
              <p className="text-sm text-slate-500">No indicators defined.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}