from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.monitoring import MonitoringModel
from app.schemas.monitoring import MonitoringCreate


def save_monitoring(
    db: Session,
    ai_system_id: str,
    data: MonitoringCreate,
) -> dict:
    monitoring = db.scalars(
        select(MonitoringModel).where(
            MonitoringModel.ai_system_id == ai_system_id
        )
    ).first()

    if monitoring is None:
        monitoring = MonitoringModel(
            ai_system_id=ai_system_id,
        )

    if data.id:
        monitoring.id = UUID(data.id)

    monitoring.object_type = data.objectType
    monitoring.object_version = data.objectVersion
    monitoring.schema_version = data.schemaVersion
    monitoring.status = data.status
    monitoring.ai_system_id = ai_system_id
    monitoring.monitoring_objectives = data.monitoringObjectives
    monitoring.indicators = [
        indicator.model_dump()
        for indicator in data.indicators
    ]

    db.add(monitoring)
    db.commit()
    db.refresh(monitoring)

    return _to_dict(monitoring)


def get_monitoring(
    db: Session,
    ai_system_id: str,
) -> dict | None:
    monitoring = db.scalars(
        select(MonitoringModel).where(
            MonitoringModel.ai_system_id == ai_system_id
        )
    ).first()

    if monitoring is None:
        return None

    return _to_dict(monitoring)


def _to_dict(monitoring: MonitoringModel) -> dict:
    return {
        "id": str(monitoring.id),
        "objectType": monitoring.object_type,
        "objectVersion": monitoring.object_version,
        "schemaVersion": monitoring.schema_version,
        "status": monitoring.status,
        "aiSystemId": monitoring.ai_system_id,
        "monitoringObjectives": monitoring.monitoring_objectives,
        "indicators": monitoring.indicators,
    }
