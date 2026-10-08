from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai_system import AISystemModel
from app.models.classification import ClassificationModel
from app.schemas.classification import AIClassificationCreate


def save_classification(
    db: Session,
    ai_system_id: str,
    data: AIClassificationCreate,
) -> dict:
    ai_system = db.scalars(
        select(AISystemModel).where(AISystemModel.id == UUID(ai_system_id))
    ).first()
    if ai_system is None:
        raise ValueError("AI system not found")

    classification = db.scalars(
        select(ClassificationModel).where(
            ClassificationModel.ai_system_id == ai_system_id
        )
    ).first()

    if classification is None:
        classification = ClassificationModel(ai_system_id=ai_system_id)

    classification.object_type = "ASSESSMENT"
    classification.object_version = data.objectVersion
    classification.schema_version = data.schemaVersion
    classification.status = data.status
    classification.assessment_type = data.assessmentType
    classification.subject = data.subject.model_dump()
    classification.scope = data.scope.model_dump()
    classification.criteria = [
        criterion.model_dump() for criterion in data.criteria
    ]
    classification.assessment_result = data.assessmentResult.model_dump()
    classification.applicable_domains = data.applicable_domains
    classification.requirements = data.requirements
    classification.risk_considerations = data.risk_considerations
    classification.evaluation_scope = data.evaluation_scope
    classification.ai_system_id = ai_system_id

    canonical = dict(ai_system.metadata_json or {})
    current_classification = dict(canonical.get("classification") or {})
    current_classification["level"] = data.classificationLevel
    canonical["classification"] = current_classification
    ai_system.metadata_json = canonical

    db.add(classification)
    db.add(ai_system)
    db.commit()
    db.refresh(classification)

    return _to_dict(classification)

def get_classification(
    db: Session,
    ai_system_id: str,
) -> dict | None:
    classification = db.scalars(
        select(ClassificationModel).where(
            ClassificationModel.ai_system_id == ai_system_id
        )
    ).first()

    if classification is None:
        return None

    return _to_dict(classification)


def _to_dict(classification: ClassificationModel) -> dict:
    return {
        "id": str(classification.id),
        "objectType": classification.object_type,
        "objectVersion": classification.object_version,
        "schemaVersion": classification.schema_version,
        "status": classification.status,
        "assessmentType": classification.assessment_type,
        "subject": classification.subject,
        "scope": classification.scope,
        "criteria": classification.criteria,
        "assessmentResult": classification.assessment_result,
        "applicable_domains": classification.applicable_domains,
        "requirements": classification.requirements,
        "risk_considerations": classification.risk_considerations,
        "evaluation_scope": classification.evaluation_scope,
        "aiSystemId": classification.ai_system_id,
    }


def delete_classification(db: Session, ai_system_id: str) -> bool:
    ai_system = db.scalars(
        select(AISystemModel).where(AISystemModel.id == UUID(ai_system_id))
    ).first()
    if ai_system is None:
        return False

    classification = db.scalars(
        select(ClassificationModel).where(
            ClassificationModel.ai_system_id == ai_system_id
        )
    ).first()
    if classification is None:
        return False

    canonical = dict(ai_system.metadata_json or {})
    canonical.pop("classification", None)
    ai_system.metadata_json = canonical

    db.delete(classification)
    db.add(ai_system)
    db.commit()
    return True