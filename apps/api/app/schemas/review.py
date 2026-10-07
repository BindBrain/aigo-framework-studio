from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str = "DRAFT"
    reviewType: str = "GOVERNANCE_REVIEW"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"

    ai_system_id: str = Field(min_length=1, max_length=128)
    review_scope: str | None = Field(default=None, max_length=5000)
    review_notes: str | None = Field(default=None, max_length=10000)
    review_outcome: str = "NOT_ASSESSED"