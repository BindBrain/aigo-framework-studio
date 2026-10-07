from typing import Optional

from pydantic import BaseModel, Field


class GovernanceRule(BaseModel):
    id: str
    name: str = Field(min_length=1, max_length=300)
    description: Optional[str] = Field(default=None, max_length=5000)
    source: Optional[str] = Field(default=None, max_length=300)
    applicability: Optional[str] = Field(default=None, max_length=5000)


class GovernanceRulesUpdate(BaseModel):
    rules: list[GovernanceRule] = Field(default_factory=list)