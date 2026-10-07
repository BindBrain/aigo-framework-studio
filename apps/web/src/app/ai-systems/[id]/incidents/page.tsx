"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type AISystem = {
  id: string;
  name: string;
  purpose: string;
  owner: string;
  provider?: string | null;
  model?: string | null;
  lifecycle_status: string;
};

type Incident = {
  id: string;
  objectType: string;
  objectVersion: string;
  schemaVersion: string;
  status: string;
  aiSystemId: string;
  incidentType: string;
  severity: string;
  incidentTitle?: string;
  description: string;
  severityRationale?: string;
  expectedCondition?: string;
  actualCondition?: string;
  immediateRisk?: Record<string, unknown>;
  containment?: Record<string, unknown>;
  investigation?: Record<string, unknown>;
  detection?: Record<string, unknown>;
  rootCause?: Record<string, unknown>;
  impactAssessment?: Record<string, unknown>;
  riskReassessment?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
  correctiveActions?: Array<Record<string, unknown>>;
  remediation?: Record<string, unknown>;
  retesting?: Record<string, unknown>;
  recovery?: Record<string, unknown>;
  enhancedMonitoring?: Record<string, unknown>;
  resumption?: Record<string, unknown>;
  riskIds?: string[];
  controlIds?: string[];
  evidenceIds?: string[];
  changeIds?: string[];
  assuranceIds?: string[];
  relatedIncidentIds?: string[];
};

const INCIDENT_STATUSES = [
  "DETECTED",
  "REPORTED",
  "REGISTERED",
  "UNDER_TRIAGE",
  "CONTAINED",
  "UNDER_INVESTIGATION",
  "REMEDIATION",
  "RECOVERY",
  "AWAITING_CLOSURE",
  "CLOSED",
  "CLOSED_WITH_CONDITIONS",
  "REOPENED",
];

const INCIDENT_TYPES = [
  "MODEL_PERFORMANCE",
  "DATA_QUALITY",
  "DATA_DRIFT",
  "MODEL_DRIFT",
  "FAIRNESS",
  "DISCRIMINATION",
  "PRIVACY",
  "SECURITY",
  "SAFETY",
  "RELIABILITY",
  "HUMAN_OVERSIGHT",
  "TRANSPARENCY",
  "EXPLAINABILITY",
  "UNAUTHORIZED_USE",
  "UNAUTHORIZED_CHANGE",
  "GOVERNANCE",
  "CONTROL_FAILURE",
  "THIRD_PARTY",
  "REGULATORY",
  "OPERATIONAL",
  "OTHER",
];

const SEVERITIES = [
  "INFORMATIONAL",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const DETECTION_SOURCES = [
  "AUTOMATED_MONITORING",
  "USER_REPORT",
  "EMPLOYEE_REPORT",
  "CUSTOMER_REPORT",
  "SUPPLIER_NOTIFICATION",
  "ASSURANCE",
  "AUDIT",
  "RISK_REVIEW",
  "CONTROL_ASSESSMENT",
  "SECURITY_MONITORING",
  "PRIVACY_MONITORING",
  "OTHER",
];

function listValue(value: unknown): string[] {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === "string" ? item.trim() : String(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [String(value)];
}

export default function IncidentManagementPage() {
  const params = useParams();
  const id = params.id as string;

  const [system, setSystem] = useState<AISystem | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentType, setIncidentType] = useState("MODEL_PERFORMANCE");
  const [status, setStatus] = useState("DETECTED");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [severityRationale, setSeverityRationale] = useState("");
  const [expectedCondition, setExpectedCondition] = useState("");
  const [actualCondition, setActualCondition] = useState("");

  const [detectedAt, setDetectedAt] = useState("");
  const [detectionSource, setDetectionSource] = useState("AUTOMATED_MONITORING");
  const [sourceDescription, setSourceDescription] = useState("");
  const [initialObservation, setInitialObservation] = useState("");

  const [immediateRiskDescription, setImmediateRiskDescription] = useState("");
  const [immediateRiskLevel, setImmediateRiskLevel] = useState("MEDIUM");
  const [potentialHarms, setPotentialHarms] = useState("");
  const [riskRationale, setRiskRationale] = useState("");

  const [containmentRequired, setContainmentRequired] = useState(false);
  const [containmentStatus, setContainmentStatus] = useState("NOT_STARTED");
  const [containmentActions, setContainmentActions] = useState("");
  const [containmentOwner, setContainmentOwner] = useState("");
  const [containmentCompletedAt, setContainmentCompletedAt] = useState("");

  const [investigationStatus, setInvestigationStatus] = useState("NOT_STARTED");
  const [investigationObjective, setInvestigationObjective] = useState("");
  const [investigationFindings, setInvestigationFindings] = useState("");
  const [investigationOwner, setInvestigationOwner] = useState("");
  const [rootCauseStatus, setRootCauseStatus] = useState("NOT_STARTED");
  const [rootCauseFindings, setRootCauseFindings] = useState("");
  const [rootCauseOwner, setRootCauseOwner] = useState("");
  const [impactAssessmentStatus, setImpactAssessmentStatus] = useState("NOT_STARTED");
  const [impactAssessmentFindings, setImpactAssessmentFindings] = useState("");
  const [impactAssessmentOwner, setImpactAssessmentOwner] = useState("");
const [riskReassessmentStatus, setRiskReassessmentStatus] = useState("NOT_STARTED");
const [riskReassessmentFindings, setRiskReassessmentFindings] = useState("");
const [riskReassessmentOwner, setRiskReassessmentOwner] = useState("");
  const [notificationStatus, setNotificationStatus] = useState("NOT_STARTED");
  const [notificationRequired, setNotificationRequired] = useState(false);
  const [notificationRecipients, setNotificationRecipients] = useState("");
  const [notificationDate, setNotificationDate] = useState("");
  const [notificationNotes, setNotificationNotes] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [correctiveActionOwner, setCorrectiveActionOwner] = useState("");
  const [correctiveActionStatus, setCorrectiveActionStatus] = useState("NOT_STARTED");
  const [correctiveActionTargetDate, setCorrectiveActionTargetDate] = useState("");
  const [correctiveActionNotes, setCorrectiveActionNotes] = useState("");
  const [remediationStatus, setRemediationStatus] = useState("NOT_STARTED");
  const [remediationPlan, setRemediationPlan] = useState("");
  const [remediationOwner, setRemediationOwner] = useState("");
  const [remediationTargetDate, setRemediationTargetDate] = useState("");
  const [remediationNotes, setRemediationNotes] = useState("");
  const [retestingStatus, setRetestingStatus] = useState("NOT_STARTED");
  const [retestingOwner, setRetestingOwner] = useState("");
  const [retestingResult, setRetestingResult] = useState("");
  const [retestingDate, setRetestingDate] = useState("");
  const [retestingNotes, setRetestingNotes] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState("NOT_STARTED");
  const [recoveryOwner, setRecoveryOwner] = useState("");
  const [recoveryActions, setRecoveryActions] = useState("");
  const [recoveryDate, setRecoveryDate] = useState("");
  const [recoveryNotes, setRecoveryNotes] = useState("");
  const [enhancedMonitoringStatus, setEnhancedMonitoringStatus] = useState("NOT_STARTED");
  const [enhancedMonitoringOwner, setEnhancedMonitoringOwner] = useState("");
  const [enhancedMonitoringPlan, setEnhancedMonitoringPlan] = useState("");
  const [enhancedMonitoringDuration, setEnhancedMonitoringDuration] = useState("");
  const [enhancedMonitoringNotes, setEnhancedMonitoringNotes] = useState("");
  const [resumptionStatus, setResumptionStatus] = useState("NOT_STARTED");
  const [resumptionApprovedBy, setResumptionApprovedBy] = useState("");
  const [resumptionDate, setResumptionDate] = useState("");
  const [resumptionConditions, setResumptionConditions] = useState("");
  const [resumptionNotes, setResumptionNotes] = useState("");

  const [riskIds, setRiskIds] = useState("");
  const [controlIds, setControlIds] = useState("");
  const [evidenceIds, setEvidenceIds] = useState("");
  const [changeIds, setChangeIds] = useState("");
  const [assuranceIds, setAssuranceIds] = useState("");
  const [relatedIncidentIds, setRelatedIncidentIds] = useState("");

  function resetForm() {
    setEditingIncidentId(null);
    setSaved(false);
    setIncidentTitle("");
    setIncidentType("MODEL_PERFORMANCE");
    setStatus("DETECTED");
    setSeverity("MEDIUM");
    setDescription("");
    setSeverityRationale("");
    setExpectedCondition("");
    setActualCondition("");
    setDetectedAt("");
    setDetectionSource("AUTOMATED_MONITORING");
    setSourceDescription("");
    setInitialObservation("");
    setImmediateRiskDescription("");
    setImmediateRiskLevel("MEDIUM");
    setPotentialHarms("");
    setRiskRationale("");
    setContainmentRequired(false);
    setContainmentStatus("NOT_STARTED");
    setContainmentActions("");
    setContainmentOwner("");
    setContainmentCompletedAt("");
    setInvestigationStatus("NOT_STARTED");
    setInvestigationObjective("");
    setInvestigationFindings("");
    setInvestigationOwner("");
    setRootCauseStatus("NOT_STARTED");
    setRootCauseFindings("");
    setRootCauseOwner("");
    setImpactAssessmentStatus("NOT_STARTED");
    setImpactAssessmentFindings("");
    setImpactAssessmentOwner("");
setRiskReassessmentStatus("NOT_STARTED");
setRiskReassessmentFindings("");
setRiskReassessmentOwner("");
    setNotificationStatus("NOT_STARTED");
    setNotificationRequired(false);
    setNotificationRecipients("");
    setNotificationDate("");
    setNotificationNotes("");
    setCorrectiveAction("");
    setCorrectiveActionOwner("");
    setCorrectiveActionStatus("NOT_STARTED");
    setCorrectiveActionTargetDate("");
    setCorrectiveActionNotes("");
    setRemediationStatus("NOT_STARTED");
    setRemediationPlan("");
    setRemediationOwner("");
    setRemediationTargetDate("");
    setRemediationNotes("");
    setRetestingStatus("NOT_STARTED");
    setRetestingOwner("");
    setRetestingResult("");
    setRetestingDate("");
    setRetestingNotes("");
    setRecoveryStatus("NOT_STARTED");
    setRecoveryOwner("");
    setRecoveryActions("");
    setRecoveryDate("");
    setRecoveryNotes("");
    setEnhancedMonitoringStatus("NOT_STARTED");
    setEnhancedMonitoringOwner("");
    setEnhancedMonitoringPlan("");
    setEnhancedMonitoringDuration("");
    setEnhancedMonitoringNotes("");
    setResumptionStatus("NOT_STARTED");
    setResumptionApprovedBy("");
    setResumptionDate("");
    setResumptionConditions("");
    setResumptionNotes("");
    setRiskIds("");
    setControlIds("");
    setEvidenceIds("");
    setChangeIds("");
    setAssuranceIds("");
    setRelatedIncidentIds("");
  }

  function editIncident(incident: Incident) {
    setEditingIncidentId(incident.id);
    setSelectedIncident(null);
    setSaved(false);

    setIncidentTitle(incident.incidentTitle || "");
    setIncidentType(incident.incidentType || "MODEL_PERFORMANCE");
    setStatus(incident.status || "DETECTED");
    setSeverity(incident.severity || "MEDIUM");
    setDescription(incident.description || "");
    setSeverityRationale(incident.severityRationale || "");
    setExpectedCondition(incident.expectedCondition || "");
    setActualCondition(incident.actualCondition || "");

    setDetectedAt(String(incident.detection?.detectedAt || ""));
    setDetectionSource(String(incident.detection?.source || "AUTOMATED_MONITORING"));
    setSourceDescription(String(incident.detection?.sourceDescription || ""));
    setInitialObservation(String(incident.detection?.initialObservation || ""));

    const risk = incident.immediateRisk || {};
    setImmediateRiskDescription(String(risk.description || ""));
    setImmediateRiskLevel(String(risk.level || "MEDIUM"));
    setPotentialHarms(listValue(risk.potentialHarms).join(", "));
    setRiskRationale(String(risk.rationale || ""));

    const containment = incident.containment || {};
    setContainmentRequired(Boolean(containment.required));
    setContainmentStatus(String(containment.status || "NOT_STARTED"));
    setContainmentActions(String(containment.actions || ""));
    setContainmentOwner(String(containment.owner || ""));
    setContainmentCompletedAt(String(containment.completedAt || ""));

    const investigation = incident.investigation || {};
    setInvestigationStatus(String(investigation.status || "NOT_STARTED"));
    setInvestigationObjective(String(investigation.objective || ""));
    setInvestigationFindings(String(investigation.findings || ""));
    setInvestigationOwner(String(investigation.owner || ""));

    const rootCause = incident.rootCause || {};
    setRootCauseStatus(String(rootCause.status || "NOT_STARTED"));
    setRootCauseFindings(String(rootCause.findings || ""));
    setRootCauseOwner(String(rootCause.owner || ""));

    const impactAssessment = incident.impactAssessment || {};
    setImpactAssessmentStatus(String(impactAssessment.status || "NOT_STARTED"));
    setImpactAssessmentFindings(String(impactAssessment.findings || ""));
    setImpactAssessmentOwner(String(impactAssessment.owner || ""));

const riskReassessment = incident.riskReassessment || {};
setRiskReassessmentStatus(String(riskReassessment.status || "NOT_STARTED"));
setRiskReassessmentFindings(String(riskReassessment.findings || ""));
setRiskReassessmentOwner(String(riskReassessment.owner || ""));
    const notifications = incident.notifications || {};
    setNotificationStatus(String(notifications.status || "NOT_STARTED"));
    setNotificationRequired(Boolean(notifications.required));
    setNotificationRecipients(String(notifications.recipients || ""));
    setNotificationDate(String(notifications.date || ""));
    setNotificationNotes(String(notifications.notes || ""));
    const correctiveActions = Array.isArray(incident.correctiveActions) ? incident.correctiveActions : [];
    const firstCorrectiveAction = correctiveActions[0] || {};
    setCorrectiveAction(String(firstCorrectiveAction.action || firstCorrectiveAction.description || ""));
    setCorrectiveActionOwner(String(firstCorrectiveAction.owner || ""));
    setCorrectiveActionStatus(String(firstCorrectiveAction.status || "NOT_STARTED"));
    setCorrectiveActionTargetDate(String(firstCorrectiveAction.targetDate || ""));
    setCorrectiveActionNotes(String(firstCorrectiveAction.notes || firstCorrectiveAction.completionNotes || ""));
    const remediation = incident.remediation || {};
    setRemediationStatus(String(remediation.status || "NOT_STARTED"));
    setRemediationPlan(String(remediation.plan || remediation.description || ""));
    setRemediationOwner(String(remediation.owner || ""));
    setRemediationTargetDate(String(remediation.targetDate || ""));
    setRemediationNotes(String(remediation.notes || ""));
    const retesting = incident.retesting || {};
    setRetestingStatus(String(retesting.status || "NOT_STARTED"));
    setRetestingOwner(String(retesting.owner || ""));
    setRetestingResult(String(retesting.result || retesting.findings || ""));
    setRetestingDate(String(retesting.date || ""));
    setRetestingNotes(String(retesting.notes || ""));

    const recovery = incident.recovery || {};
    setRecoveryStatus(String(recovery.status || "NOT_STARTED"));
    setRecoveryOwner(String(recovery.owner || ""));
    setRecoveryActions(String(recovery.actions || recovery.description || ""));
    setRecoveryDate(String(recovery.date || ""));
    setRecoveryNotes(String(recovery.notes || ""));

    const enhancedMonitoring = incident.enhancedMonitoring || {};
    setEnhancedMonitoringStatus(String(enhancedMonitoring.status || "NOT_STARTED"));
    setEnhancedMonitoringOwner(String(enhancedMonitoring.owner || ""));
    setEnhancedMonitoringPlan(String(enhancedMonitoring.plan || enhancedMonitoring.description || ""));
    setEnhancedMonitoringDuration(String(enhancedMonitoring.duration || ""));
    setEnhancedMonitoringNotes(String(enhancedMonitoring.notes || ""));

    const resumption = incident.resumption || {};
    setResumptionStatus(String(resumption.status || "NOT_STARTED"));
    setResumptionApprovedBy(String(resumption.approvedBy || resumption.owner || ""));
    setResumptionDate(String(resumption.date || ""));
    setResumptionConditions(String(resumption.conditions || ""));
    setResumptionNotes(String(resumption.notes || ""));

    setRiskIds(listValue(incident.riskIds).join(", "));
    setControlIds(listValue(incident.controlIds).join(", "));
    setEvidenceIds(listValue(incident.evidenceIds).join(", "));
    setChangeIds(listValue(incident.changeIds).join(", "));
    setAssuranceIds(listValue(incident.assuranceIds).join(", "));
    setRelatedIncidentIds(listValue(incident.relatedIncidentIds).join(", "));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadIncidents() {
    const response = await fetch(
      `http://127.0.0.1:8000/ai-systems/${id}/incidents`
    );

    if (!response.ok) {
      throw new Error("Unable to load incidents.");
    }

    const data = await response.json();
    setIncidents(Array.isArray(data) ? data : data.value || []);
  }

  async function saveIncident() {
    setError("");
    setSaved(false);

    if (!incidentTitle.trim() || !description.trim() || !detectedAt.trim()) {
      setError("Incident title, description, and detected date/time are required.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/incidents${
          editingIncidentId ? `/${editingIncidentId}` : ""
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            objectType: "INCIDENT",
            objectVersion: "0.1",
            schemaVersion: "0.1",
            status,
            aiSystemId: id,
            incidentType,
            severity,
            description: description.trim(),
            detection: {
              detectedAt: detectedAt.trim(),
              source: detectionSource,
              sourceDescription: sourceDescription.trim() || undefined,
              initialObservation: initialObservation.trim() || undefined,
            },
            incidentTitle: incidentTitle.trim(),
            severityRationale: severityRationale.trim() || undefined,
            expectedCondition: expectedCondition.trim() || undefined,
            actualCondition: actualCondition.trim() || undefined,
            immediateRisk: {
              description: immediateRiskDescription.trim() || undefined,
              level: immediateRiskLevel,
              potentialHarms: listValue(potentialHarms),
              rationale: riskRationale.trim() || undefined,
            },
            containment: {
              required: containmentRequired,
              status: containmentStatus,
              actions: containmentActions.trim() || undefined,
              owner: containmentOwner.trim() || undefined,
              completedAt: containmentCompletedAt.trim() || undefined,
            },
            investigation: {
              status: investigationStatus,
              objective: investigationObjective.trim() || undefined,
              findings: investigationFindings.trim() || undefined,
              owner: investigationOwner.trim() || undefined,
            },
            rootCause: {
              status: rootCauseStatus,
              findings: rootCauseFindings.trim() || undefined,
              owner: rootCauseOwner.trim() || undefined,
            },
            impactAssessment: {
              status: impactAssessmentStatus,
              findings: impactAssessmentFindings.trim() || undefined,
              owner: impactAssessmentOwner.trim() || undefined,
            },
            riskReassessment: {
              status: riskReassessmentStatus,
              findings: riskReassessmentFindings.trim() || undefined,
              owner: riskReassessmentOwner.trim() || undefined,
            },
            notifications: {
              status: notificationStatus,
              required: notificationRequired,
              recipients: notificationRecipients.trim() || undefined,
                   date: notificationDate || undefined,
              notes: notificationNotes.trim() || undefined,
            },
            correctiveActions: (correctiveAction.trim() || correctiveActionOwner.trim() || correctiveActionStatus !== "NOT_STARTED" || correctiveActionTargetDate || correctiveActionNotes.trim())
              ? [{
                  action: correctiveAction.trim() || undefined,
                  owner: correctiveActionOwner.trim() || undefined,
                  status: correctiveActionStatus,
                  targetDate: correctiveActionTargetDate || undefined,
                  notes: correctiveActionNotes.trim() || undefined,
                }]
              : [],
            remediation: {
              status: remediationStatus,
              plan: remediationPlan.trim() || undefined,
              owner: remediationOwner.trim() || undefined,
              targetDate: remediationTargetDate || undefined,
              notes: remediationNotes.trim() || undefined,
            },
            retesting: {
              status: retestingStatus,
              owner: retestingOwner.trim() || undefined,
              result: retestingResult.trim() || undefined,
              date: retestingDate || undefined,
              notes: retestingNotes.trim() || undefined,
            },
            recovery: {
              status: recoveryStatus,
              owner: recoveryOwner.trim() || undefined,
              actions: recoveryActions.trim() || undefined,
              date: recoveryDate || undefined,
              notes: recoveryNotes.trim() || undefined,
            },
            enhancedMonitoring: {
              status: enhancedMonitoringStatus,
              owner: enhancedMonitoringOwner.trim() || undefined,
              plan: enhancedMonitoringPlan.trim() || undefined,
              duration: enhancedMonitoringDuration.trim() || undefined,
              notes: enhancedMonitoringNotes.trim() || undefined,
            },
            resumption: {
              status: resumptionStatus,
              approvedBy: resumptionApprovedBy.trim() || undefined,
              date: resumptionDate || undefined,
              conditions: resumptionConditions.trim() || undefined,
              notes: resumptionNotes.trim() || undefined,
            },
            riskIds: listValue(riskIds),
            controlIds: listValue(controlIds),
            evidenceIds: listValue(evidenceIds),
            changeIds: listValue(changeIds),
            assuranceIds: listValue(assuranceIds),
            relatedIncidentIds: listValue(relatedIncidentIds),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save incident.");
      }

      const savedIncident = await response.json();

      if (editingIncidentId) {
        setIncidents((current) =>
          current.map((item) =>
            item.id === editingIncidentId ? savedIncident : item
          )
        );
      } else {
        setIncidents((current) => [savedIncident, ...current]);
      }

      setSaved(true);
      setEditingIncidentId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save incident."
      );
    }
  }

  async function deleteIncident(incident: Incident) {
    if (!window.confirm(`Delete incident "${incident.incidentTitle || incident.id}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai-systems/${id}/incidents/${incident.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete incident.");
      }

      setIncidents((current) =>
        current.filter((item) => item.id !== incident.id)
      );

      if (selectedIncident?.id === incident.id) {
        setSelectedIncident(null);
      }

      if (editingIncidentId === incident.id) {
        resetForm();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete incident."
      );
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [systemsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/ai-systems"),
          loadIncidents(),
        ]);

        if (!systemsResponse.ok) {
          throw new Error("Unable to load AI systems.");
        }

        const systems: AISystem[] = await systemsResponse.json();
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
    return <main className="p-8">Loading Incident Management...</main>;
  }

  if (!system) {
    return <main className="p-8">AI System not found.</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <a
            href={`/ai-systems/${id}`}
            className="text-sm text-[#626b77] hover:text-[#18202b]"
          >
            Back to AI System Workspace
          </a>
          <h1 className="mt-3 text-2xl font-semibold text-[#18202b]">
            Incident Management
          </h1>
          <p className="mt-1 text-sm text-[#626b77]">
            Detect, triage, investigate, contain, remediate, recover, and close AI-related incidents.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Incident saved successfully.
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingIncidentId ? "Edit Incident" : "Record Incident"}
            </h2>
            <p className="text-sm text-slate-500">
              Record the incident, detection details, immediate risk, and governance relationships.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Incident Title</span>
              <input
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Incident Type</span>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {INCIDENT_TYPES.map((value) => (
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
                {INCIDENT_STATUSES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Severity</span>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {SEVERITIES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Severity Rationale</span>
              <textarea
                value={severityRationale}
                onChange={(e) => setSeverityRationale(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Expected Condition</span>
              <textarea
                value={expectedCondition}
                onChange={(e) => setExpectedCondition(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Actual Condition</span>
              <textarea
                value={actualCondition}
                onChange={(e) => setActualCondition(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Detection</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Detected At</span>
              <input
                type="datetime-local"
                value={detectedAt}
                onChange={(e) => setDetectedAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Detection Source</span>
              <select
                value={detectionSource}
                onChange={(e) => setDetectionSource(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {DETECTION_SOURCES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Source Description</span>
              <textarea
                value={sourceDescription}
                onChange={(e) => setSourceDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Initial Observation</span>
              <textarea
                value={initialObservation}
                onChange={(e) => setInitialObservation(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Immediate Risk</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Risk Level</span>
              <select
                value={immediateRiskLevel}
                onChange={(e) => setImmediateRiskLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {SEVERITIES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Potential Harms</span>
              <input
                value={potentialHarms}
                onChange={(e) => setPotentialHarms(e.target.value)}
                placeholder="Comma-separated harms"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Risk Description</span>
              <textarea
                value={immediateRiskDescription}
                onChange={(e) => setImmediateRiskDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Risk Rationale</span>
              <textarea
                value={riskRationale}
                onChange={(e) => setRiskRationale(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
        </section>

        {editingIncidentId && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mt-1 text-sm text-slate-500">Record whether immediate containment is required and track the containment response.</p>

          <label className="mt-6 flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={containmentRequired}
              onChange={(event) => setContainmentRequired(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Containment required
          </label>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Containment Status</span>
              <select
                value={containmentStatus}
                onChange={(event) => setContainmentStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="NOT_REQUIRED">Not Required</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Containment Owner</span>
              <input
                value={containmentOwner}
                onChange={(event) => setContainmentOwner(event.target.value)}
                placeholder="Person or role responsible"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Containment Actions</span>
            <textarea
              value={containmentActions}
              onChange={(event) => setContainmentActions(event.target.value)}
              rows={3}
              placeholder="Describe actions taken to contain or limit the incident."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Containment Completed At</span>
            <input
              type="datetime-local"
              value={containmentCompletedAt}
              onChange={(event) => setContainmentCompletedAt(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          </section>
        )}
        {editingIncidentId && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Root Cause</h2>
        <p className="mt-1 text-sm text-slate-500">Capture the current root-cause analysis, contributing factors, and ownership.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Root Cause Status</span>
            <select
              value={rootCauseStatus}
              onChange={(event) => setRootCauseStatus(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Root Cause Owner</span>
            <input
              value={rootCauseOwner}
              onChange={(event) => setRootCauseOwner(event.target.value)}
              placeholder="Person or role responsible"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Root Cause / Contributing Factors</span>
          <textarea
            value={rootCauseFindings}
            onChange={(event) => setRootCauseFindings(event.target.value)}
            rows={4}
            placeholder="Record the established root cause, contributing factors, and unresolved questions."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </section>
        )}
        {editingIncidentId && (

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Impact Assessment</h2>
        <p className="mt-1 text-sm text-slate-500">Capture the assessed impact, affected areas, and ownership of the assessment.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Impact Assessment Status</span>
            <select
              value={impactAssessmentStatus}
              onChange={(event) => setImpactAssessmentStatus(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Impact Assessment Owner</span>
            <input
              value={impactAssessmentOwner}
              onChange={(event) => setImpactAssessmentOwner(event.target.value)}
              placeholder="Person or role responsible"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Impact Assessment Findings</span>
          <textarea
            value={impactAssessmentFindings}
            onChange={(event) => setImpactAssessmentFindings(event.target.value)}
            rows={4}
            placeholder="Record affected users, systems, harms, scope, duration, and materiality."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </section>
        )}
        {editingIncidentId && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Investigation</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Investigation Status</span>
              <select
                value={investigationStatus}
                onChange={(event) => setInvestigationStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Investigation Owner</span>
              <input
                value={investigationOwner}
              onChange={(event) => setInvestigationOwner(event.target.value)}
                placeholder="Person or role responsible"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Investigation Objective</span>
            <textarea
              value={investigationObjective}
              onChange={(event) => setInvestigationObjective(event.target.value)}
              rows={3}
              placeholder="State what the investigation is intended to establish."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Investigation Findings</span>
            <textarea
              value={investigationFindings}
              onChange={(event) => setInvestigationFindings(event.target.value)}
              rows={4}
              placeholder="Record confirmed findings, contributing factors, and unresolved questions."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Risk Reassessment</h2>
          <p className="mt-1 text-sm text-slate-500">Capture whether the incident changes the assessed risk, the current findings, and ownership of the reassessment.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Risk Reassessment Status</span>
              <select
                value={riskReassessmentStatus}
                onChange={(event) => setRiskReassessmentStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Risk Reassessment Owner</span>
              <input
                value={riskReassessmentOwner}
                onChange={(event) => setRiskReassessmentOwner(event.target.value)}
                placeholder="Person or role responsible"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Risk Reassessment Findings</span>
            <textarea
              value={riskReassessmentFindings}
              onChange={(event) => setRiskReassessmentFindings(event.target.value)}
              rows={4}
              placeholder="Record changes to likelihood, impact, risk level, controls, or risk treatment."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Capture whether notifications are required, their status, recipients, timing, and relevant notes.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Notification Status</span>
              <select
                value={notificationStatus}
                onChange={(event) => setNotificationStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                checked={notificationRequired}
                onChange={(event) => setNotificationRequired(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Notification Required</span>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Recipients / Parties Notified</span>
              <input
                value={notificationRecipients}
                onChange={(event) => setNotificationRecipients(event.target.value)}
                placeholder="Roles, teams, regulators, customers, or other parties"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Notification Date</span>
              <input
                type="datetime-local"
                value={notificationDate}
                onChange={(event) => setNotificationDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Notification Notes</span>
            <textarea
              value={notificationNotes}
              onChange={(event) => setNotificationNotes(event.target.value)}
              rows={4}
              placeholder="Record notification decisions, rationale, acknowledgements, or outstanding notifications."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Corrective Actions</h2>
          <p className="mt-1 text-sm text-slate-500">Record the primary corrective action, accountable owner, target date, status, and completion notes for this incident.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Corrective Action</span>
              <textarea
                value={correctiveAction}
                onChange={(event) => setCorrectiveAction(event.target.value)}
                rows={3}
                placeholder="Describe the corrective action required to address the incident and prevent recurrence."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Owner</span>
              <input
                value={correctiveActionOwner}
                onChange={(event) => setCorrectiveActionOwner(event.target.value)}
                placeholder="Person, role, or team accountable for the action"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={correctiveActionStatus}
                onChange={(event) => setCorrectiveActionStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Target Date</span>
              <input
                type="datetime-local"
                value={correctiveActionTargetDate}
                onChange={(event) => setCorrectiveActionTargetDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Completion Notes</span>
              <textarea
                value={correctiveActionNotes}
                onChange={(event) => setCorrectiveActionNotes(event.target.value)}
                rows={3}
                placeholder="Record completion evidence, outcomes, or remaining work."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Remediation</h2>
          <p className="mt-1 text-sm text-slate-500">Track the remediation plan, accountable owner, target date, status, and implementation notes.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={remediationStatus}
                onChange={(event) => setRemediationStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Owner</span>
              <input
                value={remediationOwner}
                onChange={(event) => setRemediationOwner(event.target.value)}
                placeholder="Person, role, or team accountable for remediation"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Target Date</span>
              <input
                type="datetime-local"
                value={remediationTargetDate}
                onChange={(event) => setRemediationTargetDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Remediation Plan</span>
            <textarea
              value={remediationPlan}
              onChange={(event) => setRemediationPlan(event.target.value)}
              rows={4}
              placeholder="Describe the remediation approach, actions, dependencies, and expected outcome."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Remediation Notes</span>
            <textarea
              value={remediationNotes}
              onChange={(event) => setRemediationNotes(event.target.value)}
              rows={3}
              placeholder="Record progress, blockers, completion evidence, or remaining work."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Retesting</h2>
          <p className="mt-1 text-sm text-slate-500">Record post-remediation testing, ownership, results, date, and supporting notes.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={retestingStatus}
                onChange={(event) => setRetestingStatus(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Owner</span>
              <input
                value={retestingOwner}
                onChange={(event) => setRetestingOwner(event.target.value)}
                placeholder="Person, role, or team responsible for retesting"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Test Date</span>
              <input
                type="datetime-local"
                value={retestingDate}
                onChange={(event) => setRetestingDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Test Result / Findings</span>
            <textarea
              value={retestingResult}
              onChange={(event) => setRetestingResult(event.target.value)}
              rows={4}
              placeholder="Describe the retest performed and whether the expected condition was restored."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Retesting Notes</span>
            <textarea
              value={retestingNotes}
              onChange={(event) => setRetestingNotes(event.target.value)}
              rows={3}
              placeholder="Record test evidence, limitations, follow-up work, or approvals required."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recovery</h2>
          <p className="mt-1 text-sm text-slate-500">Record controlled recovery of the affected AI system, including ownership, actions, timing, and recovery notes.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select value={recoveryStatus} onChange={(event) => setRecoveryStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Owner</span>
              <input value={recoveryOwner} onChange={(event) => setRecoveryOwner(event.target.value)} placeholder="Person, role, or team responsible for recovery" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Recovery Date</span>
              <input type="datetime-local" value={recoveryDate} onChange={(event) => setRecoveryDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Recovery Actions</span>
            <textarea value={recoveryActions} onChange={(event) => setRecoveryActions(event.target.value)} rows={4} placeholder="Describe the actions taken to restore the system to an approved operating condition." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Recovery Notes</span>
            <textarea value={recoveryNotes} onChange={(event) => setRecoveryNotes(event.target.value)} rows={3} placeholder="Record recovery evidence, limitations, follow-up monitoring, or conditions." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Enhanced Monitoring</h2>
          <p className="mt-1 text-sm text-slate-500">Track heightened monitoring after recovery and before normal operating conditions are resumed.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select value={enhancedMonitoringStatus} onChange={(event) => setEnhancedMonitoringStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Owner</span>
              <input value={enhancedMonitoringOwner} onChange={(event) => setEnhancedMonitoringOwner(event.target.value)} placeholder="Person, role, or monitoring team" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Duration</span>
              <input value={enhancedMonitoringDuration} onChange={(event) => setEnhancedMonitoringDuration(event.target.value)} placeholder="e.g. 14 days" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Monitoring Plan</span>
            <textarea value={enhancedMonitoringPlan} onChange={(event) => setEnhancedMonitoringPlan(event.target.value)} rows={4} placeholder="Describe metrics, thresholds, alerts, frequency, and escalation arrangements." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Monitoring Notes</span>
            <textarea value={enhancedMonitoringNotes} onChange={(event) => setEnhancedMonitoringNotes(event.target.value)} rows={3} placeholder="Record monitoring outcomes, exceptions, alerts, or follow-up actions." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </section>
        )}
        {editingIncidentId && (

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Resumption</h2>
          <p className="mt-1 text-sm text-slate-500">Record the controlled decision to resume normal operation, including approval, timing, conditions, and supporting notes.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select value={resumptionStatus} onChange={(event) => setResumptionStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Approved By / Responsible Authority</span>
              <input value={resumptionApprovedBy} onChange={(event) => setResumptionApprovedBy(event.target.value)} placeholder="Person, role, or authority approving resumption" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Resumption Date</span>
              <input type="datetime-local" value={resumptionDate} onChange={(event) => setResumptionDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Resumption Conditions</span>
            <textarea value={resumptionConditions} onChange={(event) => setResumptionConditions(event.target.value)} rows={4} placeholder="Record conditions, safeguards, monitoring requirements, or restrictions that apply to resumption." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Resumption Notes</span>
            <textarea value={resumptionNotes} onChange={(event) => setResumptionNotes(event.target.value)} rows={3} placeholder="Record the decision rationale, evidence reviewed, or follow-up requirements." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </section>
        )}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Related Records</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Risk IDs", riskIds, setRiskIds],
              ["Control IDs", controlIds, setControlIds],
              ["Evidence IDs", evidenceIds, setEvidenceIds],
              ["Change IDs", changeIds, setChangeIds],
              ["Assurance IDs", assuranceIds, setAssuranceIds],
              ["Related Incident IDs", relatedIncidentIds, setRelatedIncidentIds],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="space-y-1">
                <span className="text-sm font-medium">{label as string}</span>
                <input
                  value={value as string}
                  onChange={(e) =>
                    (setter as (value: string) => void)(e.target.value)
                  }
                  placeholder="Comma-separated IDs"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={saveIncident}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white"
            >
              {editingIncidentId ? "Update Incident" : "Save Incident"}
            </button>

            {editingIncidentId && (
              <button
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Incident History</h2>

          {incidents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No incidents recorded yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {incident.incidentTitle || "Untitled Incident"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        {incident.description}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {incident.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {incident.incidentType}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {incident.severity}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => editIncident(incident)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteIncident(incident)}
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

        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selectedIncident.incidentTitle || "Incident Details"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedIncident.id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Overview
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500">Status</div>
                      <div className="font-medium">{selectedIncident.status}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Incident Type</div>
                      <div className="font-medium">{selectedIncident.incidentType}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Severity</div>
                      <div className="font-medium">{selectedIncident.severity}</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4 whitespace-pre-wrap">
                    {selectedIncident.description || "—"}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Detection
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-slate-500">Detected At</div>
                      <div className="font-medium">
                        {String(selectedIncident.detection?.detectedAt || "—")}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Source</div>
                      <div className="font-medium">
                        {String(selectedIncident.detection?.source || "—")}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Source Description</div>
                      <div className="font-medium">
                        {String(selectedIncident.detection?.sourceDescription || "—")}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Initial Observation</div>
                      <div className="font-medium">
                        {String(selectedIncident.detection?.initialObservation || "—")}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Conditions
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="text-xs text-slate-500">Expected</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {selectedIncident.expectedCondition || "—"}
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="text-xs text-slate-500">Actual</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {selectedIncident.actualCondition || "—"}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Immediate Risk
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">Level</div>
                        <div className="font-medium">
                          {String(selectedIncident.immediateRisk?.level || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Description</div>
                        <div className="font-medium">
                          {String(selectedIncident.immediateRisk?.description || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Potential Harms</div>
                        <div className="font-medium">
                          {listValue(selectedIncident.immediateRisk?.potentialHarms).join(", ") || "—"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Rationale</div>
                        <div className="font-medium">
                          {String(selectedIncident.immediateRisk?.rationale || "—")}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Containment
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">Required</div>
                        <div className="font-medium">
                          {String(selectedIncident.containment?.required ?? "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-medium">
                          {String(selectedIncident.containment?.status || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Owner</div>
                        <div className="font-medium">
                          {String(selectedIncident.containment?.owner || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Completed At</div>
                        <div className="font-medium">
                          {String(selectedIncident.containment?.completedAt || "—")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Actions</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.containment?.actions || "—")}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Investigation
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-medium">
                          {String(selectedIncident.investigation?.status || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Owner</div>
                        <div className="font-medium">
                          {String(selectedIncident.investigation?.owner || "—")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Objective</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.investigation?.objective || "—")}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Findings</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.investigation?.findings || "—")}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Root Cause
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div>
                      <div className="text-xs text-slate-500">Summary</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.rootCause?.summary || selectedIncident.rootCause?.description || "—")}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Contributing Factors</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {listValue(selectedIncident.rootCause?.contributingFactors).join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Impact Assessment
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-medium">
                          {String(selectedIncident.impactAssessment?.status || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Owner</div>
                        <div className="font-medium">
                          {String(selectedIncident.impactAssessment?.owner || "—")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Summary</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.impactAssessment?.summary || selectedIncident.impactAssessment?.description || "—")}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Affected Areas</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {listValue(selectedIncident.impactAssessment?.affectedAreas).join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Risk Reassessment
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-medium">
                          {String(selectedIncident.riskReassessment?.status || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Owner</div>
                        <div className="font-medium">
                          {String(selectedIncident.riskReassessment?.owner || "—")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Findings</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.riskReassessment?.findings || "—")}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Notifications
                  </h3>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="font-medium">
                          {String(selectedIncident.notifications?.status || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Required</div>
                        <div className="font-medium">
                          {String(selectedIncident.notifications?.required ?? "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Recipients</div>
                        <div className="font-medium whitespace-pre-wrap">
                          {String(selectedIncident.notifications?.recipients || "—")}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="font-medium">
                          {String(selectedIncident.notifications?.date || "—")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500">Notes</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {String(selectedIncident.notifications?.notes || "—")}
                      </div>
                    </div>
                  </div>
                </section>
                    Related Records
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-slate-500">Risk IDs</div>
                      <div className="font-medium">
                        {listValue(selectedIncident.riskIds).join(", ") || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Control IDs</div>
                      <div className="font-medium">
                        {listValue(selectedIncident.controlIds).join(", ") || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Evidence IDs</div>
                      <div className="font-medium">
                        {listValue(selectedIncident.evidenceIds).join(", ") || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Change IDs</div>
                      <div className="font-medium">
                        {listValue(selectedIncident.changeIds).join(", ") || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Assurance IDs</div>
                      <div className="font-medium">
                        {listValue(selectedIncident.assuranceIds).join(", ") || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Related Incident IDs</div>
                      <div className="font-medium">
                        {listValue(selectedIncident.relatedIncidentIds).join(", ") || "—"}
                      </div>
                    </div>
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

