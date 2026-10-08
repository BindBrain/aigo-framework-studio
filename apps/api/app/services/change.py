from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.change import ChangeModel
from app.schemas.change import ChangeCreate


def _to_dict(change: ChangeModel) -> dict:
    data = dict(change.change_data or {})
    data.update(
        {
            "id": str(change.id),
            "objectType": change.object_type,
            "objectVersion": change.object_version,
            "schemaVersion": change.schema_version,
            "status": change.status,
            "aiSystemId": change.ai_system_id,
            "changeType": change.change_type,
            "changeOwner": change.change_owner,
            "changeDescription": change.change_description,
            "performedBy": str(change.performed_by) if change.performed_by else None,
            "createdAt": change.created_at.isoformat() if change.created_at else None,
            "updatedAt": change.updated_at.isoformat() if change.updated_at else None,
        }
    )
    return data


def save_change(
    db: Session,
    ai_system_id: str,
    payload: ChangeCreate,
) -> dict:
    data = payload.model_dump(exclude_none=True)

    change_id = UUID(payload.id) if payload.id else uuid4()

    change = ChangeModel(
        id=change_id,
        ai_system_id=ai_system_id,
        object_type="CHANGE",
        object_version=payload.objectVersion,
        schema_version=payload.schemaVersion,
        status=payload.status,
        change_type=payload.changeType,
        change_owner=payload.changeOwner.model_dump(),
        change_description=payload.changeDescription,
        change_data=data,
        performed_by=UUID(payload.performedBy) if payload.performedBy else None,
    )

    db.add(change)
    db.commit()
    db.refresh(change)

    return _to_dict(change)


def get_changes(
    db: Session,
    ai_system_id: str,
) -> list[dict]:
    changes = (
        db.query(ChangeModel)
        .filter(ChangeModel.ai_system_id == ai_system_id)
        .order_by(ChangeModel.created_at.desc())
        .all()
    )

    return [_to_dict(change) for change in changes]


def update_change(
    db: Session,
    ai_system_id: str,
    change_id: str,
    payload: ChangeCreate,
) -> dict | None:
    change = (
        db.query(ChangeModel)
        .filter(
            ChangeModel.ai_system_id == ai_system_id,
            ChangeModel.id == UUID(change_id),
        )
        .first()
    )

    if change is None:
        return None

    data = payload.model_dump(exclude_none=True)

    change.object_version = payload.objectVersion
    change.schema_version = payload.schemaVersion
    change.status = payload.status
    change.change_type = payload.changeType
    change.change_owner = payload.changeOwner.model_dump()
    change.change_description = payload.changeDescription
    change.change_data = data
    change.performed_by = UUID(payload.performedBy) if payload.performedBy else None

    db.commit()
    db.refresh(change)

    return _to_dict(change)


def delete_change(
    db: Session,
    ai_system_id: str,
    change_id: str,
) -> bool:
    change = (
        db.query(ChangeModel)
        .filter(
            ChangeModel.ai_system_id == ai_system_id,
            ChangeModel.id == UUID(change_id),
        )
        .first()
    )

    if change is None:
        return False

    db.delete(change)
    db.commit()

    return True
