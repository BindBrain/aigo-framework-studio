from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.responsibility import ResponsibilityAssignmentModel
from app.schemas.responsibility import ResponsibilityAssignmentCreate


def create_responsibility(
    db: Session,
    ai_system_id: str,
    data: ResponsibilityAssignmentCreate,
) -> dict:
    assignment = ResponsibilityAssignmentModel(
        ai_system_id=ai_system_id,
        user_id=data.user_id,
        role=data.role,
        effective_from=data.effective_from,
        effective_to=data.effective_to,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return _to_dict(assignment)


def get_responsibilities(db: Session, ai_system_id: str) -> list[dict]:
    assignments = db.scalars(
        select(ResponsibilityAssignmentModel)
        .where(ResponsibilityAssignmentModel.ai_system_id == ai_system_id)
        .order_by(ResponsibilityAssignmentModel.effective_from.desc())
    ).all()
    return [_to_dict(item) for item in assignments]


def _to_dict(assignment: ResponsibilityAssignmentModel) -> dict:
    return {
        "id": str(assignment.id),
        "aiSystemId": assignment.ai_system_id,
        "userId": str(assignment.user_id),
        "role": assignment.role,
        "effectiveFrom": assignment.effective_from.isoformat(),
        "effectiveTo": assignment.effective_to.isoformat() if assignment.effective_to else None,
    }
