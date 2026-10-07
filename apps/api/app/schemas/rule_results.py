from typing import Literal, Optional

from pydantic import BaseModel, Field


class RuleResult(BaseModel):
    rule_id: str
    status: Literal["PASS", "FAIL", "NOT_APPLICABLE"]
    notes: Optional[str] = Field(default=None, max_length=5000)


class RuleResultsUpdate(BaseModel):
    results: list[RuleResult] = Field(default_factory=list)