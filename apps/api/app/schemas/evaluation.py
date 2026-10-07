from pydantic import BaseModel, ConfigDict, Field


class AssessmentSubject(BaseModel):
    model_config = ConfigDict(extra="forbid")

    aiSystemId: str = Field(min_length=1, max_length=128)
    objectType: str = "AI_SYSTEM"
    objectId: str = Field(min_length=1, max_length=128)


class AssessmentScope(BaseModel):
    model_config = ConfigDict(extra="forbid")

    description: str = Field(min_length=1, max_length=10000)
    jurisdictions: list[str] = Field(default_factory=list)
    lifecycleStages: list[str] = Field(default_factory=list)


class AssessmentCriterion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    criterionId: str = Field(min_length=1, max_length=128)
    source: str = Field(min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    mandatory: bool = False


class AssessmentResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    outcome: str = "NOT_ASSESSED"
    summary: str | None = Field(default=None, max_length=5000)
    rationale: str | None = Field(default=None, max_length=5000)


class ReassessmentProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    required: bool = False
    trigger: str | None = None
    assessmentId: str | None = Field(default=None, max_length=128)
    nextAssessmentDate: str | None = None
    frequency: str | None = None
    nextReviewDate: str | None = None
    reviewOwner: dict | None = None
    triggeredReviewCriteria: list[str] = Field(default_factory=list)


class EvaluationRequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    evaluation_purpose: str | None = Field(default=None, max_length=5000)
    governance_context: str | None = Field(default=None, max_length=5000)
    evaluation_scope: str | None = Field(default=None, max_length=5000)
    evaluation_trigger: str = Field(default="initial_assessment", max_length=100)

    status: str = "DRAFT"
    assessmentType: str = "CONTROL"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"

    subject: AssessmentSubject
    scope: AssessmentScope
    criteria: list[AssessmentCriterion] = Field(default_factory=list)
    assessmentResult: AssessmentResult
    reassessment: ReassessmentProfile | None = None
