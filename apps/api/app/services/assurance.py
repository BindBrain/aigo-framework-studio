from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assurance import AssuranceModel
from app.schemas.assurance import AssuranceCreate


def save_assurance(db: Session, data: AssuranceCreate) -> dict:
    assurance = db.scalars(
        select(AssuranceModel).where(AssuranceModel.id == data.id)
    ).first()

    if assurance is None:
        assurance = AssuranceModel(id=data.id)

    document = data.model_dump()

    assurance.object_type = data.objectType
    assurance.object_version = data.objectVersion
    assurance.schema_version = data.schemaVersion
    assurance.status = data.status
    assurance.assurance_type = data.assuranceType
    assurance.ai_system_id = data.aiSystemId
    assurance.title = data.title
    assurance.document = document

    db.add(assurance)
    db.commit()
    db.refresh(assurance)

    return _to_dict(assurance)


def get_assurance(db: Session, assurance_id: str) -> dict | None:
    assurance = db.scalars(
        select(AssuranceModel).where(AssuranceModel.id == assurance_id)
    ).first()

    if assurance is None:
        return None

    return _to_dict(assurance)


def list_assurances(
    db: Session,
    ai_system_id: str | None = None,
) -> list[dict]:
    query = select(AssuranceModel).order_by(AssuranceModel.created_at.desc())

    if ai_system_id:
        query = query.where(AssuranceModel.ai_system_id == ai_system_id)

    assurances = db.scalars(query).all()

    return [_to_dict(assurance) for assurance in assurances]


def _to_dict(assurance: AssuranceModel) -> dict:
    return assurance.document
