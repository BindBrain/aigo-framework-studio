from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.responsibility import ResponsibilityAssignmentModel
from app.models.user import UserModel
from app.schemas.user import UserCreate


def create_user(db: Session, data: UserCreate) -> dict:
    user = UserModel(
        name=data.name,
        title=data.title,
        organization_unit=data.organization_unit,
        active=data.active,
        active_from=data.active_from,
        active_to=data.active_to,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _to_dict(user)


def get_users(db: Session) -> list[dict]:
    users = db.scalars(
        select(UserModel).order_by(UserModel.name.asc())
    ).all()
    return [_to_dict(user) for user in users]


def update_user(db: Session, user_id: UUID, data: UserCreate) -> dict | None:
    user = db.get(UserModel, user_id)
    if not user:
        return None

    user.name = data.name
    user.title = data.title
    user.organization_unit = data.organization_unit
    user.active = data.active
    user.active_from = data.active_from
    user.active_to = data.active_to

    db.commit()
    db.refresh(user)
    return _to_dict(user)


def delete_user(db: Session, user_id: UUID) -> bool:
    user = db.get(UserModel, user_id)
    if not user:
        return False

    has_history = db.scalar(
        select(ResponsibilityAssignmentModel.id)
        .where(ResponsibilityAssignmentModel.user_id == user_id)
        .limit(1)
    )

    if has_history:
        raise ValueError("Person has responsibility history and cannot be deleted.")

    db.delete(user)
    db.commit()
    return True


def _to_dict(user: UserModel) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "title": user.title,
        "organizationUnit": user.organization_unit,
        "active": user.active,
        "activeFrom": user.active_from.isoformat() if user.active_from else None,
        "activeTo": user.active_to.isoformat() if user.active_to else None,
    }
