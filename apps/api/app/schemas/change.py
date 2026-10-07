from pydantic import BaseModel, ConfigDict, Field


class RoleReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    roleType: str
    personReference: str | None = Field(default=None, max_length=256)
    organizationUnit: str | None = Field(default=None, max_length=256)


class ChangeTest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    testId: str = Field(min_length=1, max_length=128)
    testType: str = Field(min_length=1, max_length=256)
    expectedResult: str | None = None
    actualResult: str | None = None
    result: str = "NOT_TESTED"
    testDate: str | None = None
    tester: RoleReference | None = None
    evidenceIds: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


class TestingPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    testPlanId: str | None = Field(default=None, max_length=128)
    objective: str | None = None
    methods: list[str] = Field(default_factory=list)
    owner: RoleReference | None = None
    environment: str | None = None
    testDataReference: str | None = None
    exitCriteria: list[str] = Field(default_factory=list)
    tests: list[ChangeTest] = Field(default_factory=list)
    overallResult: str | None = None


class RollbackPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool | None = None
    available: bool | None = None
    approvedPreviousState: str | None = None
    procedureReference: str | None = None
    conditions: list[str] = Field(default_factory=list)
    tested: bool | None = None
    testEvidenceId: str | None = None


class ChangeReview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    frequency: str | None = None
    nextReviewDate: str | None = None
    reviewOwner: RoleReference | None = None
    triggeredReviewCriteria: list[str] = Field(default_factory=list)


class EmergencyChange(BaseModel):
    model_config = ConfigDict(extra="forbid")

    used: bool | None = None
    reason: str | None = None
    immediateRisk: str | None = None
    authority: RoleReference | None = None
    authorityBasis: str | None = None
    immediateControls: list[str] = Field(default_factory=list)
    retrospectiveReviewRequired: bool | None = None
    retrospectiveReviewDate: str | None = None
    retrospectiveReviewOutcome: str | None = None


class ChangeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, min_length=1, max_length=128)
    objectType: str = "CHANGE"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"
    status: str = "DRAFT"
    performedBy: str | None = None
    aiSystemId: str | None = None
    changeTitle: str | None = Field(default=None, max_length=256)
    changeType: str
    changeClassification: str | None = None

    changeOwner: RoleReference
    changeRequestor: RoleReference | None = None
    systemOwner: RoleReference | None = None
    businessOwner: RoleReference | None = None
    technicalOwner: RoleReference | None = None
    riskOwner: RoleReference | None = None
    approvalAuthority: RoleReference | None = None

    dateRequested: str | None = None
    plannedImplementationDate: str | None = None
    actualImplementationDate: str | None = None
    targetClosureDate: str | None = None

    changeObjective: str | None = None
    businessObjective: str | None = None
    background: str | None = None
    currentState: str | None = None
    proposedState: str | None = None
    changeDescription: str
    affectedComponents: list[str] = Field(default_factory=list)

    riskIds: list[str] = Field(default_factory=list)
    controlIds: list[str] = Field(default_factory=list)
    evidenceIds: list[str] = Field(default_factory=list)
    approvalIds: list[str] = Field(default_factory=list)
    incidentIds: list[str] = Field(default_factory=list)
    assuranceIds: list[str] = Field(default_factory=list)
    improvementIds: list[str] = Field(default_factory=list)

    testing: TestingPlan | None = None
    rollback: RollbackPlan | None = None
    emergencyChange: EmergencyChange | None = None
    review: ChangeReview | None = None

    relatedChangeIds: list[str] = Field(default_factory=list)
    relatedRecordIds: list[str] = Field(default_factory=list)


class ChangeResponse(ChangeCreate):
    id: str
    aiSystemId: str
