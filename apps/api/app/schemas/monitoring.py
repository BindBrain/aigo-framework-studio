from pydantic import BaseModel, ConfigDict, Field


class MonitoringIndicator(BaseModel):
    model_config = ConfigDict(extra="forbid")

    indicatorId: str = Field(min_length=1, max_length=128)
    name: str = Field(min_length=1, max_length=500)
    category: str = Field(min_length=1, max_length=100)
    measurementDefinition: str = Field(min_length=1, max_length=5000)
    measurementMethod: str | None = Field(default=None, max_length=5000)
    frequency: str | None = Field(default=None, max_length=200)
    target: float | None = None
    active: bool = True


class MonitoringCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, max_length=128)
    objectType: str = "MONITORING"
    objectVersion: str = "1.0"
    schemaVersion: str = "0.1"
    status: str = "DRAFT"
    aiSystemId: str = Field(min_length=1, max_length=128)
    monitoringObjectives: list[str] = Field(min_length=1)
    indicators: list[MonitoringIndicator] = Field(default_factory=list)
