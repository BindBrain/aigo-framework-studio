from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


IncidentStatus = Literal[
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
]

IncidentType = Literal[
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
]

IncidentSeverity = Literal[
    "INFORMATIONAL",
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]

DetectionSource = Literal[
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
]


class RoleReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    roleType: str
    personReference: str | None = Field(default=None, max_length=256)
    organizationUnit: str | None = Field(default=None, max_length=256)


class Detection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    detectedAt: str
    source: DetectionSource
    reportedAt: str | None = None
    registeredAt: str | None = None
    sourceDescription: str | None = None
    alertId: str | None = None
    reportedBy: RoleReference | None = None
    initialObservation: str | None = None
    evidenceIds: list[str] = Field(default_factory=list)


class IncidentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, min_length=1, max_length=128)
    objectType: Literal["INCIDENT"] = "INCIDENT"
    objectVersion: str = "0.1"
    schemaVersion: Literal["0.1"] = "0.1"
    status: IncidentStatus = "DETECTED"
    performedBy: str | None = None
    aiSystemId: str
    incidentType: IncidentType
    severity: IncidentSeverity
    description: str
    detection: Detection

    createdAt: str | None = None
    updatedAt: str | None = None

    organization: dict[str, Any] | None = None
    aiSystemVersion: str | None = None
    modelId: str | None = None
    modelVersion: str | None = None

    systemOwner: RoleReference | None = None
    businessOwner: RoleReference | None = None
    technicalOwner: RoleReference | None = None
    incidentOwner: RoleReference | None = None
    incidentManager: RoleReference | None = None
    riskOwner: RoleReference | None = None

    incidentTitle: str | None = Field(default=None, max_length=256)
    categories: list[IncidentType] = Field(default_factory=list)
    severityRationale: str | None = None
    expectedCondition: str | None = None
    actualCondition: str | None = None
    difference: str | None = None

    timeline: list[dict[str, Any]] = Field(default_factory=list)
    lifecycleStage: str | None = None
    scope: dict[str, Any] | None = None
    stakeholders: list[dict[str, Any]] = Field(default_factory=list)
    affectedPersons: list[str] = Field(default_factory=list)
    affectedGroups: list[str] = Field(default_factory=list)
    estimatedAffectedScale: dict[str, Any] | None = None

    immediateRisk: dict[str, Any] | None = None
    containment: dict[str, Any] | None = None
    businessContinuity: dict[str, Any] | None = None
    investigation: dict[str, Any] | None = None
    evidence: dict[str, Any] | None = None
    technicalInvestigation: dict[str, Any] | None = None
    dataInvestigation: dict[str, Any] | None = None
    modelInvestigation: dict[str, Any] | None = None
    humanOversightInvestigation: dict[str, Any] | None = None
    privacyInvestigation: dict[str, Any] | None = None
    securityInvestigation: dict[str, Any] | None = None
    fairnessImpactInvestigation: dict[str, Any] | None = None

    rootCause: dict[str, Any] | None = None
    controlFailureAnalysis: dict[str, Any] | None = None
    riskReassessment: dict[str, Any] | None = None
    impactAssessment: dict[str, Any] | None = None
    notifications: dict[str, Any] | None = None

    correctiveActions: list[dict[str, Any]] = Field(default_factory=list)
    remediation: dict[str, Any] | None = None
    retesting: dict[str, Any] | None = None
    recovery: dict[str, Any] | None = None
    enhancedMonitoring: dict[str, Any] | None = None
    resumption: dict[str, Any] | None = None

    changeManagement: dict[str, Any] | None = None
    assurance: dict[str, Any] | None = None
    lessonsLearned: dict[str, Any] | None = None
    improvements: list[dict[str, Any]] = Field(default_factory=list)

    closure: dict[str, Any] | None = None
    postIncidentReview: dict[str, Any] | None = None
    communications: dict[str, Any] | None = None

    riskIds: list[str] = Field(default_factory=list)
    controlIds: list[str] = Field(default_factory=list)
    monitoringPlanId: str | None = None
    alertIds: list[str] = Field(default_factory=list)
    changeIds: list[str] = Field(default_factory=list)
    approvalIds: list[str] = Field(default_factory=list)
    assuranceIds: list[str] = Field(default_factory=list)
    evidenceIds: list[str] = Field(default_factory=list)
    riskAcceptanceId: str | None = None
    managementReviewId: str | None = None
    relatedIncidentIds: list[str] = Field(default_factory=list)

    review: dict[str, Any] | None = None
    conditions: list[dict[str, Any]] = Field(default_factory=list)


class IncidentResponse(IncidentCreate):
    id: str
    aiSystemId: str
