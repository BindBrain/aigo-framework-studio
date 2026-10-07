from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=300)
    title: str | None = Field(default=None, max_length=300)
    organization_unit: str | None = Field(default=None, max_length=300)
    active: bool = True
    active_from: datetime | None = None
    active_to: datetime | None = None
