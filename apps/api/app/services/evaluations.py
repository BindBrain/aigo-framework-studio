from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.evaluation import EvaluationModel
from app.schemas.evaluation import EvaluationRequestCreate


def save_evaluation_request(
    db: Session,
    ai_system_id: str,
    data: EvaluationRequestCreate,
) -> dict:
    evaluation = db.scalars(
        select(EvaluationModel).where(
            EvaluationModel.ai_system_id == ai_system_id
        )
    ).first()

    if evaluation is None:
        evaluation = EvaluationModel(ai_system_id=ai_system_id)

    evaluation.object_type = "ASSESSMENT"
    evaluation.object_version = data.objectVersion
    evaluation.schema_version = data.schemaVersion
    evaluation.status = data.status
    evaluation.assessment_type = data.assessmentType
    evaluation.subject = data.subject.model_dump()
    evaluation.scope = data.scope.model_dump()
    evaluation.criteria = [
        criterion.model_dump() for criterion in data.criteria
    ]
    evaluation.assessment_result = data.assessmentResult.model_dump()
    evaluation.reassessment = data.reassessment.model_dump() if data.reassessment else None
    evaluation.evaluation_purpose = data.evaluation_purpose
    evaluation.governance_context = data.governance_context
    evaluation.evaluation_scope = data.evaluation_scope
    evaluation.evaluation_trigger = data.evaluation_trigger
    evaluation.ai_system_id = ai_system_id

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return _to_dict(evaluation)


def get_evaluation_request(
    db: Session,
    ai_system_id: str,
) -> dict | None:
    evaluation = db.scalars(
        select(EvaluationModel).where(
            EvaluationModel.ai_system_id == ai_system_id
        )
    ).first()

    if evaluation is None:
        return None

    return _to_dict(evaluation)


def _to_dict(evaluation: EvaluationModel) -> dict:
    return {
        "id": str(evaluation.id),
        "objectType": evaluation.object_type,
        "objectVersion": evaluation.object_version,
        "schemaVersion": evaluation.schema_version,
        "status": evaluation.status,
        "assessmentType": evaluation.assessment_type,
        "subject": evaluation.subject,
        "scope": evaluation.scope,
        "criteria": evaluation.criteria,
        "assessmentResult": evaluation.assessment_result,
        "reassessment": evaluation.reassessment,
        "evaluation_purpose": evaluation.evaluation_purpose,
        "governance_context": evaluation.governance_context,
        "evaluation_scope": evaluation.evaluation_scope,
        "evaluation_trigger": evaluation.evaluation_trigger,
        "aiSystemId": evaluation.ai_system_id,
    }
