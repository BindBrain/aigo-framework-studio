from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai_system import AISystemModel
from app.schemas.ai_system import AISystemCreate


def create_ai_system(
    db: Session,
    data: AISystemCreate,
) -> dict:
    model_provider = data.model.provider if data.model else None
    model_name = data.model.modelName if data.model else None

    owner_name = data.systemOwner.personReference or data.systemOwner.roleType.value

    system = AISystemModel(
        name=data.systemName,
        provider=model_provider,
        model=model_name,
        purpose=data.intendedPurpose,
        owner=owner_name,
        description=data.description,
        lifecycle_status=data.status.value,
        governance_context=data.governanceRecordId,
        metadata_json=data.model_dump(mode="json"),
    )

    db.add(system)
    db.commit()
    db.refresh(system)

    return {
        "id": str(system.id),
        "name": system.name,
        "provider": system.provider,
        "model": system.model,
        "purpose": system.purpose,
        "owner": system.owner,
        "description": system.description,
        "lifecycle_status": system.lifecycle_status,
        "governance_context": system.governance_context,
        "canonical": system.metadata_json,
    }


def list_ai_systems(db: Session) -> list[dict]:
    systems = db.scalars(
        select(AISystemModel).order_by(AISystemModel.created_at.desc())
    ).all()

    return [
        {
            "id": str(system.id),
            "name": system.name,
            "provider": system.provider,
            "model": system.model,
            "purpose": system.purpose,
            "owner": system.owner,
            "description": system.description,
            "lifecycle_status": system.lifecycle_status,
            "governance_context": system.governance_context,
            "canonical": system.metadata_json,
        }
        for system in systems
    ]