from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.incident import IncidentModel
from app.schemas.incident import IncidentCreate


def _to_dict(incident: IncidentModel) -> dict:
    data = dict(incident.incident_data or {})
    data.update(
        {
            "id": str(incident.id),
            "objectType": incident.object_type,
            "objectVersion": incident.object_version,
            "schemaVersion": incident.schema_version,
            "status": incident.status,
            "aiSystemId": incident.ai_system_id,
            "incidentType": incident.incident_type,
            "severity": incident.severity,
            "description": incident.description,
            "detection": incident.detection,
            "performedBy": str(incident.performed_by) if incident.performed_by else None,
            "createdAt": incident.created_at.isoformat() if incident.created_at else None,
            "updatedAt": incident.updated_at.isoformat() if incident.updated_at else None,
        }
    )
    return data


def save_incident(
    db: Session,
    ai_system_id: str,
    payload: IncidentCreate,
) -> dict:
    data = payload.model_dump(exclude_none=True)
    incident_id = UUID(payload.id) if payload.id else uuid4()

    incident = IncidentModel(
        id=incident_id,
        ai_system_id=ai_system_id,
        object_type="INCIDENT",
        object_version=payload.objectVersion,
        schema_version=payload.schemaVersion,
        status=payload.status,
        incident_type=payload.incidentType,
        severity=payload.severity,
        description=payload.description,
        detection=payload.detection.model_dump(),
        incident_data=data,
        performed_by=UUID(payload.performedBy) if payload.performedBy else None,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)
    return _to_dict(incident)


def get_incidents(
    db: Session,
    ai_system_id: str,
) -> list[dict]:
    incidents = (
        db.query(IncidentModel)
        .filter(IncidentModel.ai_system_id == ai_system_id)
        .order_by(IncidentModel.created_at.desc())
        .all()
    )
    return [_to_dict(incident) for incident in incidents]


def update_incident(
    db: Session,
    ai_system_id: str,
    incident_id: str,
    payload: IncidentCreate,
) -> dict | None:
    incident = (
        db.query(IncidentModel)
        .filter(
            IncidentModel.ai_system_id == ai_system_id,
            IncidentModel.id == UUID(incident_id),
        )
        .first()
    )

    if incident is None:
        return None

    data = payload.model_dump(exclude_none=True)

    incident.object_version = payload.objectVersion
    incident.schema_version = payload.schemaVersion
    incident.status = payload.status
    incident.incident_type = payload.incidentType
    incident.severity = payload.severity
    incident.description = payload.description
    incident.detection = payload.detection.model_dump()
    incident.incident_data = data
    incident.performed_by = UUID(payload.performedBy) if payload.performedBy else None

    db.commit()
    db.refresh(incident)
    return _to_dict(incident)


def delete_incident(
    db: Session,
    ai_system_id: str,
    incident_id: str,
) -> bool:
    incident = (
        db.query(IncidentModel)
        .filter(
            IncidentModel.ai_system_id == ai_system_id,
            IncidentModel.id == UUID(incident_id),
        )
        .first()
    )

    if incident is None:
        return False

    db.delete(incident)
    db.commit()
    return True
