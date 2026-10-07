from pydantic import BaseModel, ConfigDict, Field


class EvidenceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, max_length=128)
    objectType: str = "EVIDENCE"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"
    status: str = "DRAFT"

    evidenceTitle: str = Field(min_length=1, max_length=500)
    purpose: str = Field(min_length=1, max_length=5000)
    source: str = Field(min_length=1, max_length=5000)

    evidenceDescription: str | None = Field(default=None, max_length=10000)
    evidenceType: str | None = Field(default=None, max_length=200)
    format: str | None = Field(default=None, max_length=100)
    aiSystemId: str | None = Field(default=None, max_length=128)
    lifecycleStage: str | None = Field(default=None, max_length=100)
    controlIds: list[str] = Field(default_factory=list)
    assessmentIds: list[str] = Field(default_factory=list)