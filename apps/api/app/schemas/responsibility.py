from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ResponsibilityAssignmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UUID
    role: str = Field(min_length=1, max_length=100)
    effective_from: datetime
    effective_to: datetime | None = None
