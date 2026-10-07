from pydantic import BaseModel, ConfigDict, Field


class RoleReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    roleType: str
    personReference: str | None = Field(default=None, max_length=256)
    organizationUnit: str | None = Field(default=None, max_length=256)


class RiskRating(BaseModel):
    model_config = ConfigDict(extra="forbid")

    likelihood: float = Field(ge=0)
    likelihoodLevel: str | None = None
    impact: float = Field(ge=0)
    impactLevel: str | None = None
    score: float | None = Field(default=None, ge=0)
    level: str
    method: str | None = None
    rationale: str | None = None


class RiskAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    assessmentId: str = Field(min_length=1, max_length=128)
    assessmentDate: str
    assessmentType: str | None = None
    assessmentOwner: RoleReference | None = None
    methodology: str | None = None
    scope: str | None = None
    result: str | None = None
    evidenceIds: list[str] = Field(default_factory=list)


class RiskControlLink(BaseModel):
    model_config = ConfigDict(extra="forbid")

    controlId: str = Field(min_length=1, max_length=128)
    relationship: str | None = None
    expectedRiskReduction: str | None = None
    effectiveness: str | None = None
    assessmentId: str | None = Field(default=None, max_length=128)
    evidenceIds: list[str] = Field(default_factory=list)


class RiskTreatment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision: str
    objective: str | None = None
    rationale: str | None = None
    owner: RoleReference | None = None
    treatmentIds: list[str] = Field(default_factory=list)
    targetDate: str | None = None
    status: str | None = None


class Condition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conditionId: str = Field(min_length=1, max_length=128)
    description: str = Field(min_length=1)
    owner: RoleReference | None = None
    dueDate: str | None = None
    status: str | None = None
    verificationEvidenceIds: list[str] = Field(default_factory=list)


class RiskAcceptance(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool
    acceptanceId: str | None = Field(default=None, max_length=128)
    authority: RoleReference | None = None
    status: str | None = None
    effectiveDate: str | None = None
    expiryDate: str | None = None
    conditions: list[Condition] = Field(default_factory=list)
    rationale: str | None = None


class RiskDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision: str | None = None
    rationale: str | None = None
    authority: RoleReference | None = None
    decisionDate: str | None = None
    evidenceIds: list[str] = Field(default_factory=list)


class RiskEscalation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool | None = None
    triggers: list[str] = Field(default_factory=list)
    path: list[RoleReference] = Field(default_factory=list)
    authority: RoleReference | None = None
    decision: RiskDecision | None = None


class RiskIndicator(BaseModel):
    model_config = ConfigDict(extra="forbid")

    indicatorId: str = Field(min_length=1, max_length=128)
    name: str = Field(min_length=1)
    description: str | None = None
    source: str | None = None
    frequency: str | None = None
    owner: RoleReference | None = None


class RiskThreshold(BaseModel):
    model_config = ConfigDict(extra="forbid")

    indicatorId: str = Field(min_length=1, max_length=128)
    warningThreshold: object | None = None
    criticalThreshold: object | None = None
    action: str | None = None


class RiskMonitoring(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool | None = None
    monitoringPlanId: str | None = Field(default=None, max_length=128)
    owner: RoleReference | None = None
    frequency: str | None = None
    indicators: list[RiskIndicator] = Field(default_factory=list)
    thresholds: list[RiskThreshold] = Field(default_factory=list)
    reassessmentTriggers: list[str] = Field(default_factory=list)


class Reassessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool | None = None
    trigger: str | None = None
    assessmentId: str | None = Field(default=None, max_length=128)
    assessmentDate: str | None = None
    result: str | None = None
    actions: list[str] = Field(default_factory=list)


class Scenario(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scenario: str = Field(min_length=1)
    description: str | None = None
    likelihood: float | None = Field(default=None, ge=0)
    impact: float | None = Field(default=None, ge=0)
    riskLevel: str | None = None
    treatment: str | None = None


class Uncertainty(BaseModel):
    model_config = ConfigDict(extra="forbid")

    level: str | None = None
    sources: list[str] = Field(default_factory=list)
    materialUnknowns: list[str] = Field(default_factory=list)
    treatment: str | None = None
    monitoringRequirements: list[str] = Field(default_factory=list)


class ThirdPartyRisk(BaseModel):
    model_config = ConfigDict(extra="forbid")

    supplierId: str | None = Field(default=None, max_length=128)
    supplierName: str | None = None
    riskDescription: str | None = None
    riskLevel: str | None = None
    controls: list[str] = Field(default_factory=list)
    evidenceIds: list[str] = Field(default_factory=list)


class RiskReview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    frequency: str | None = None
    nextReviewDate: str | None = None
    reviewOwner: RoleReference | None = None
    triggeredReviewCriteria: list[str] = Field(default_factory=list)


class RiskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, min_length=1, max_length=128)
    objectType: str = "RISK"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"
    status: str = "DRAFT"

    createdAt: str | None = None
    updatedAt: str | None = None
    effectiveAt: str | None = None
    organization: dict | None = None

    aiSystemId: str | None = Field(default=None, max_length=128)
    aiSystemIds: list[str] = Field(default_factory=list)

    riskTitle: str = Field(min_length=1, max_length=500)
    riskStatement: str = Field(min_length=1)
    cause: str | None = None
    riskEvent: str | None = None
    consequences: list[str] = Field(default_factory=list)
    riskCategory: list[str] = Field(default_factory=list)
    lifecycleStages: list[str] = Field(default_factory=list)

    riskOwner: RoleReference
    controlOwnerIds: list[str] = Field(default_factory=list)
    affectedStakeholders: list[str] = Field(default_factory=list)
    affectedPersons: list[str] = Field(default_factory=list)
    potentialHarms: list[str] = Field(default_factory=list)

    inherentRisk: RiskRating | None = None
    residualRisk: RiskRating | None = None
    riskAssessment: RiskAssessment

    riskTreatment: RiskTreatment | None = None
    controls: list[RiskControlLink] = Field(default_factory=list)
    riskAcceptance: RiskAcceptance | None = None
    riskEscalation: RiskEscalation | None = None
    monitoring: RiskMonitoring | None = None
    reassessment: Reassessment | None = None
    scenarioAnalysis: list[Scenario] = Field(default_factory=list)
    uncertainty: Uncertainty | None = None
    thirdPartyRisks: list[ThirdPartyRisk] = Field(default_factory=list)

    incidentIds: list[str] = Field(default_factory=list)
    changeIds: list[str] = Field(default_factory=list)
    assuranceIds: list[str] = Field(default_factory=list)
    assessmentIds: list[str] = Field(default_factory=list)
    approvalIds: list[str] = Field(default_factory=list)
    improvementIds: list[str] = Field(default_factory=list)
    evidenceIds: list[str] = Field(default_factory=list)
    riskAcceptanceId: str | None = Field(default=None, max_length=128)
    relatedRiskIds: list[str] = Field(default_factory=list)

    decision: RiskDecision | None = None
    review: RiskReview | None = None
    conditions: list[Condition] = Field(default_factory=list)


class RiskResponse(RiskCreate):
    id: str
    aiSystemId: str