from pydantic import BaseModel, ConfigDict, Field


class ApprovalCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str = "DRAFT"
    approvalType: str = "GOVERNANCE_APPROVAL"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"

    ai_system_id: str = Field(min_length=1, max_length=128)
    performedBy: str | None = Field(default=None, max_length=128)
    approval_scope: str | None = Field(default=None, max_length=5000)
    approval_notes: str | None = Field(default=None, max_length=10000)
    approval_outcome: str = "NOT_ASSESSED"
