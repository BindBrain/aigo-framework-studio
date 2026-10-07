from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AssuranceCreate(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(min_length=1, max_length=128)
    objectType: str = "ASSURANCE"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"
    status: str = "DRAFT"
    assuranceType: str = "INITIAL"
    objective: str = Field(min_length=1, max_length=10000)
    scope: dict[str, Any]
    criteria: list[dict[str, Any]] = Field(min_length=1)

    aiSystemId: str | None = Field(default=None, max_length=128)
    aiSystemIds: list[str] = Field(default_factory=list)
    title: str | None = Field(default=None, max_length=1000)
