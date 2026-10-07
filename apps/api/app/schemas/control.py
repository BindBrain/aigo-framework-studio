from pydantic import BaseModel, ConfigDict, Field


class RoleReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    roleType: str
    personReference: str | None = Field(default=None, max_length=256)
    organizationUnit: str | None = Field(default=None, max_length=256)


class RequirementReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requirementId: str | None = Field(default=None, max_length=128)
    requirementSource: str | None = None
    requirementReference: str | None = None
    requirementDescription: str | None = None
    mandatory: bool | None = None


class ControlExecution(BaseModel):
    model_config = ConfigDict(extra="forbid")

    method: str | None = None
    automationLevel: str | None = None
    location: str | None = None
    trigger: str | None = None
    expectedOutput: str | None = None
    completionCriteria: str | None = None


class ControlActivity(BaseModel):
    model_config = ConfigDict(extra="forbid")

    activityId: str = Field(min_length=1, max_length=128)
    description: str = Field(min_length=1)
    sequence: int | None = Field(default=None, ge=1)
    performer: RoleReference | None = None
    reviewer: RoleReference | None = None
    requiredEvidenceIds: list[str] = Field(default_factory=list)


class ControlImplementation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str | None = None
    implementationDate: str | None = None
    implementationOwner: RoleReference | None = None
    evidenceIds: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)


class ControlMonitoring(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool | None = None
    monitoringPlanId: str | None = Field(default=None, max_length=128)
    owner: RoleReference | None = None
    frequency: str | None = None
    indicators: list[dict] = Field(default_factory=list)
    thresholds: list[dict] = Field(default_factory=list)
    reassessmentTriggers: list[str] = Field(default_factory=list)


class ControlReview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    frequency: str | None = None
    nextReviewDate: str | None = None
    reviewOwner: RoleReference | None = None
    triggeredReviewCriteria: list[str] = Field(default_factory=list)


class ControlCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, min_length=1, max_length=128)
    objectType: str = "CONTROL"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"
    status: str = "DRAFT"

    controlName: str = Field(min_length=1, max_length=256)
    controlFamily: str | None = Field(default=None, max_length=256)
    controlType: str | None = None
    controlObjective: str = Field(min_length=1, max_length=5000)
    controlDescription: str | None = Field(default=None, max_length=10000)

    requirement: RequirementReference | None = None
    riskIds: list[str] = Field(default_factory=list)
    aiSystemIds: list[str] = Field(default_factory=list)
    lifecycleStages: list[str] = Field(default_factory=list)

    controlOwner: RoleReference
    controlPerformers: list[RoleReference] = Field(default_factory=list)
    controlReviewer: RoleReference | None = None
    approvalAuthority: RoleReference | None = None

    criticality: str | None = None
    frequency: str | None = None
    frequencyDescription: str | None = None

    execution: ControlExecution | None = None
    controlActivities: list[ControlActivity] = Field(default_factory=list)

    implementation: ControlImplementation | None = None
    monitoring: ControlMonitoring | None = None
    review: ControlReview | None = None

    assuranceIds: list[str] = Field(default_factory=list)
    improvementIds: list[str] = Field(default_factory=list)
    evidenceIds: list[str] = Field(default_factory=list)
    assessmentIds: list[str] = Field(default_factory=list)

    relatedControlIds: list[str] = Field(default_factory=list)
    documentReferences: list[dict] = Field(default_factory=list)


class ControlResponse(ControlCreate):
    id: str
    aiSystemId: str