from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.control import ControlModel
from app.schemas.control import ControlCreate


def save_control(
    db: Session,
    ai_system_id: str,
    data: ControlCreate,
) -> dict:
    control = ControlModel(
        ai_system_id=ai_system_id,
        object_type=data.objectType,
        object_version=data.objectVersion,
        schema_version=data.schemaVersion,
        status=data.status,
        control_name=data.controlName,
        control_objective=data.controlObjective,
        control_owner=data.controlOwner.model_dump(),
        control_data={
            "controlFamily": data.controlFamily,
            "controlType": data.controlType,
            "controlDescription": data.controlDescription,
            "requirement": data.requirement.model_dump() if data.requirement else None,
            "riskIds": data.riskIds,
            "aiSystemIds": data.aiSystemIds,
            "lifecycleStages": data.lifecycleStages,
            "controlPerformers": [item.model_dump() for item in data.controlPerformers],
            "controlReviewer": data.controlReviewer.model_dump() if data.controlReviewer else None,
            "approvalAuthority": data.approvalAuthority.model_dump() if data.approvalAuthority else None,
            "criticality": data.criticality,
            "frequency": data.frequency,
            "frequencyDescription": data.frequencyDescription,
            "execution": data.execution.model_dump() if data.execution else None,
            "controlActivities": [item.model_dump() for item in data.controlActivities],
            "implementation": data.implementation.model_dump() if data.implementation else None,
            "monitoring": data.monitoring.model_dump() if data.monitoring else None,
            "review": data.review.model_dump() if data.review else None,
            "assuranceIds": data.assuranceIds,
            "improvementIds": data.improvementIds,
            "evidenceIds": data.evidenceIds,
            "assessmentIds": data.assessmentIds,
            "relatedControlIds": data.relatedControlIds,
            "documentReferences": data.documentReferences,
        },
    )

    if data.id:
        control.id = UUID(data.id)

    db.add(control)
    db.commit()
    db.refresh(control)

    return _to_dict(control)


def get_controls(
    db: Session,
    ai_system_id: str,
) -> list[dict]:
    controls = db.scalars(
        select(ControlModel)
        .where(ControlModel.ai_system_id == ai_system_id)
        .order_by(ControlModel.created_at.desc())
    ).all()

    return [_to_dict(control) for control in controls]


def _to_dict(control: ControlModel) -> dict:
    data = control.control_data or {}

    return {
        "id": str(control.id),
        "objectType": control.object_type,
        "objectVersion": control.object_version,
        "schemaVersion": control.schema_version,
        "status": control.status,
        "aiSystemId": control.ai_system_id,
        "controlName": control.control_name,
        "controlObjective": control.control_objective,
        "controlOwner": control.control_owner,
        **data,
    }


def update_control(
    db: Session,
    ai_system_id: str,
    control_id: str,
    data: ControlCreate,
) -> dict | None:
    control = db.scalar(
        select(ControlModel).where(
            ControlModel.id == UUID(control_id),
            ControlModel.ai_system_id == ai_system_id,
        )
    )

    if control is None:
        return None

    control.object_type = data.objectType
    control.object_version = data.objectVersion
    control.schema_version = data.schemaVersion
    control.status = data.status
    control.control_name = data.controlName
    control.control_objective = data.controlObjective
    control.control_owner = data.controlOwner.model_dump()
    control.control_data = {
        "controlFamily": data.controlFamily,
        "controlType": data.controlType,
        "controlDescription": data.controlDescription,
        "requirement": data.requirement.model_dump() if data.requirement else None,
        "riskIds": data.riskIds,
        "aiSystemIds": data.aiSystemIds,
        "lifecycleStages": data.lifecycleStages,
        "controlPerformers": [item.model_dump() for item in data.controlPerformers],
        "controlReviewer": data.controlReviewer.model_dump() if data.controlReviewer else None,
        "approvalAuthority": data.approvalAuthority.model_dump() if data.approvalAuthority else None,
        "criticality": data.criticality,
        "frequency": data.frequency,
        "frequencyDescription": data.frequencyDescription,
        "execution": data.execution.model_dump() if data.execution else None,
        "controlActivities": [item.model_dump() for item in data.controlActivities],
        "implementation": data.implementation.model_dump() if data.implementation else None,
        "monitoring": data.monitoring.model_dump() if data.monitoring else None,
        "review": data.review.model_dump() if data.review else None,
        "assuranceIds": data.assuranceIds,
        "improvementIds": data.improvementIds,
        "evidenceIds": data.evidenceIds,
        "assessmentIds": data.assessmentIds,
        "relatedControlIds": data.relatedControlIds,
        "documentReferences": data.documentReferences,
    }

    db.commit()
    db.refresh(control)

    return _to_dict(control)


def delete_control(
    db: Session,
    ai_system_id: str,
    control_id: str,
) -> bool:
    control = db.scalar(
        select(ControlModel).where(
            ControlModel.id == UUID(control_id),
            ControlModel.ai_system_id == ai_system_id,
        )
    )

    if control is None:
        return False

    db.delete(control)
    db.commit()

    return True