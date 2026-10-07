from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AIObjectStatus(str, Enum):
    DRAFT = "DRAFT"
    PROPOSED = "PROPOSED"
    UNDER_ASSESSMENT = "UNDER_ASSESSMENT"
    REGISTERED = "REGISTERED"
    APPROVED = "APPROVED"
    OPERATIONAL = "OPERATIONAL"
    RESTRICTED = "RESTRICTED"
    SUSPENDED = "SUSPENDED"
    RETIRING = "RETIRING"
    RETIRED = "RETIRED"


class LifecycleStage(str, Enum):
    GOVERN = "GOVERN"
    IDENTIFY = "IDENTIFY"
    CLASSIFY = "CLASSIFY"
    ASSESS = "ASSESS"
    TREAT = "TREAT"
    APPROVE = "APPROVE"
    DEPLOY = "DEPLOY"
    OPERATE = "OPERATE"
    MONITOR = "MONITOR"
    ASSURE = "ASSURE"
    IMPROVE = "IMPROVE"
    CHANGE = "CHANGE"
    CONTINUE = "CONTINUE"
    RETIRE = "RETIRE"


class ClassificationLevel(str, Enum):
    CLASS_1 = "CLASS_1"
    CLASS_2 = "CLASS_2"
    CLASS_3 = "CLASS_3"
    CLASS_4 = "CLASS_4"


class RoleType(str, Enum):
    GOVERNANCE_OWNER = "GOVERNANCE_OWNER"
    SYSTEM_OWNER = "SYSTEM_OWNER"
    BUSINESS_OWNER = "BUSINESS_OWNER"
    TECHNICAL_OWNER = "TECHNICAL_OWNER"
    RISK_OWNER = "RISK_OWNER"
    CONTROL_OWNER = "CONTROL_OWNER"
    PROCESS_OWNER = "PROCESS_OWNER"
    ASSURANCE_OWNER = "ASSURANCE_OWNER"
    REVIEWER = "REVIEWER"
    APPROVER = "APPROVER"
    CUSTODIAN = "CUSTODIAN"
    OPERATOR = "OPERATOR"
    OTHER = "OTHER"


class RoleReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    roleType: RoleType
    personReference: Optional[str] = Field(default=None, max_length=256)
    organizationUnit: Optional[str] = Field(default=None, max_length=256)


class ClassificationProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    level: ClassificationLevel
    classificationDate: Optional[str] = None
    owner: Optional[RoleReference] = None
    reviewer: Optional[RoleReference] = None
    approvalAuthority: Optional[RoleReference] = None
    rationale: Optional[str] = None
    factors: list[str] = Field(default_factory=list)
    assessmentId: Optional[str] = None


class ModelProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    modelId: Optional[str] = None
    modelName: Optional[str] = None
    modelVersion: Optional[str] = None
    modelFamily: Optional[str] = None
    modelType: Optional[str] = None
    architecture: Optional[str] = None
    provider: Optional[str] = None
    providerType: Optional[str] = None
    documentationReference: Optional[str] = None
    limitations: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)


class OrganizationMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    organizationId: Optional[str] = None
    organizationName: Optional[str] = None
    businessUnit: Optional[str] = None
    department: Optional[str] = None
    jurisdiction: Optional[str] = None


class AISystemCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    systemName: str = Field(min_length=1, max_length=256)
    intendedPurpose: str = Field(min_length=1, max_length=5000)
    systemOwner: RoleReference
    classification: ClassificationProfile

    objectType: str = "AI_SYSTEM"
    objectVersion: str = "0.1"
    schemaVersion: str = "0.1"
    status: AIObjectStatus = AIObjectStatus.DRAFT

    systemShortName: Optional[str] = Field(default=None, max_length=128)
    description: Optional[str] = Field(default=None, max_length=5000)
    systemVersion: Optional[str] = Field(default=None, max_length=128)
    businessFunction: Optional[str] = Field(default=None, max_length=256)
    businessProcess: Optional[str] = Field(default=None, max_length=512)

    businessCriticality: Optional[str] = None
    intendedUse: Optional[str] = Field(default=None, max_length=5000)
    restrictedUses: list[str] = Field(default_factory=list)
    prohibitedUses: list[str] = Field(default_factory=list)

    aiCapabilities: list[str] = Field(default_factory=list)
    decisionRole: Optional[str] = None

    authorizedUsers: list[str] = Field(default_factory=list)
    affectedStakeholders: list[str] = Field(default_factory=list)
    affectedPersons: list[str] = Field(default_factory=list)

    operatingContext: Optional[str] = Field(default=None, max_length=5000)
    jurisdictions: list[str] = Field(default_factory=list)

    currentLifecycleStage: LifecycleStage = LifecycleStage.IDENTIFY
    plannedNextLifecycleStage: Optional[LifecycleStage] = None

    businessOwner: Optional[RoleReference] = None
    technicalOwner: Optional[RoleReference] = None
    riskOwner: Optional[RoleReference] = None

    model: Optional[ModelProfile] = None
    organization: Optional[OrganizationMetadata] = None

    governanceRecordId: Optional[str] = None