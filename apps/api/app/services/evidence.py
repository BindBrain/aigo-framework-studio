from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.evidence import EvidenceModel
from app.schemas.evidence import EvidenceCreate


def create_evidence(db: Session, data: EvidenceCreate) -> dict:
    evidence = EvidenceModel(
        evidence_title=data.evidenceTitle,
        purpose=data.purpose,
        source=data.source,
        status=data.status,
        object_type=data.objectType,
        object_version=data.objectVersion,
        schema_version=data.schemaVersion,
        evidence_description=data.evidenceDescription,
        evidence_type=data.evidenceType,
        format=data.format,
        ai_system_id=data.aiSystemId,
        lifecycle_stage=data.lifecycleStage,
        control_ids=data.controlIds,
        assessment_ids=data.assessmentIds,
    )

    if data.id:
        evidence.id = UUID(data.id)

    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return _to_dict(evidence)


def list_evidence(
    db: Session,
    ai_system_id: str | None = None,
) -> list[dict]:
    query = select(EvidenceModel).order_by(EvidenceModel.created_at.desc())

    if ai_system_id:
        query = query.where(EvidenceModel.ai_system_id == ai_system_id)

    items = db.scalars(query).all()

    return [_to_dict(item) for item in items]


def update_evidence(
    db: Session,
    evidence_id: str,
    data: EvidenceCreate,
) -> dict | None:
    evidence = db.scalar(
        select(EvidenceModel).where(
            EvidenceModel.id == UUID(evidence_id),
        )
    )

    if evidence is None:
        return None

    evidence.evidence_title = data.evidenceTitle
    evidence.purpose = data.purpose
    evidence.source = data.source
    evidence.status = data.status
    evidence.object_type = data.objectType
    evidence.object_version = data.objectVersion
    evidence.schema_version = data.schemaVersion
    evidence.evidence_description = data.evidenceDescription
    evidence.evidence_type = data.evidenceType
    evidence.format = data.format
    evidence.ai_system_id = data.aiSystemId
    evidence.lifecycle_stage = data.lifecycleStage
    evidence.control_ids = data.controlIds
    evidence.assessment_ids = data.assessmentIds

    db.commit()
    db.refresh(evidence)

    return _to_dict(evidence)


def delete_evidence(
    db: Session,
    evidence_id: str,
) -> bool:
    evidence = db.scalar(
        select(EvidenceModel).where(
            EvidenceModel.id == UUID(evidence_id),
        )
    )

    if evidence is None:
        return False

    db.delete(evidence)
    db.commit()

    return True


def _to_dict(evidence: EvidenceModel) -> dict:
    return {
        "id": str(evidence.id),
        "objectType": evidence.object_type,
        "objectVersion": evidence.object_version,
        "schemaVersion": evidence.schema_version,
        "status": evidence.status,
        "evidenceTitle": evidence.evidence_title,
        "purpose": evidence.purpose,
        "source": evidence.source,
        "evidenceDescription": evidence.evidence_description,
        "evidenceType": evidence.evidence_type,
        "format": evidence.format,
        "aiSystemId": evidence.ai_system_id,
        "lifecycleStage": evidence.lifecycle_stage,
        "controlIds": evidence.control_ids,
        "assessmentIds": evidence.assessment_ids,
    }