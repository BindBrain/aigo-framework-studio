from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.risk import RiskModel
from app.schemas.risk import RiskCreate


def save_risk(
    db: Session,
    ai_system_id: str,
    data: RiskCreate,
) -> dict:
    risk = RiskModel(
        ai_system_id=ai_system_id,
        object_type=data.objectType,
        object_version=data.objectVersion,
        schema_version=data.schemaVersion,
        status=data.status,
        risk_title=data.riskTitle,
        risk_statement=data.riskStatement,
        risk_owner=data.riskOwner.model_dump(),
        risk_assessment=data.riskAssessment.model_dump(),
        risk_data={
            "createdAt": data.createdAt,
            "updatedAt": data.updatedAt,
            "effectiveAt": data.effectiveAt,
            "organization": data.organization,
            "aiSystemId": ai_system_id,
            "aiSystemIds": data.aiSystemIds,
            "cause": data.cause,
            "riskEvent": data.riskEvent,
            "consequences": data.consequences,
            "riskCategory": data.riskCategory,
            "lifecycleStages": data.lifecycleStages,
            "controlOwnerIds": data.controlOwnerIds,
            "affectedStakeholders": data.affectedStakeholders,
            "affectedPersons": data.affectedPersons,
            "potentialHarms": data.potentialHarms,
            "inherentRisk": data.inherentRisk.model_dump() if data.inherentRisk else None,
            "residualRisk": data.residualRisk.model_dump() if data.residualRisk else None,
            "riskTreatment": data.riskTreatment.model_dump() if data.riskTreatment else None,
            "controls": [item.model_dump() for item in data.controls],
            "riskAcceptance": data.riskAcceptance.model_dump() if data.riskAcceptance else None,
            "riskEscalation": data.riskEscalation.model_dump() if data.riskEscalation else None,
            "monitoring": data.monitoring.model_dump() if data.monitoring else None,
            "reassessment": data.reassessment.model_dump() if data.reassessment else None,
            "scenarioAnalysis": [item.model_dump() for item in data.scenarioAnalysis],
            "uncertainty": data.uncertainty.model_dump() if data.uncertainty else None,
            "thirdPartyRisks": [item.model_dump() for item in data.thirdPartyRisks],
            "incidentIds": data.incidentIds,
            "changeIds": data.changeIds,
            "assuranceIds": data.assuranceIds,
            "assessmentIds": data.assessmentIds,
            "approvalIds": data.approvalIds,
            "improvementIds": data.improvementIds,
            "evidenceIds": data.evidenceIds,
            "riskAcceptanceId": data.riskAcceptanceId,
            "relatedRiskIds": data.relatedRiskIds,
            "decision": data.decision.model_dump() if data.decision else None,
            "review": data.review.model_dump() if data.review else None,
            "conditions": [item.model_dump() for item in data.conditions],
        },
    )

    if data.id:
        risk.id = UUID(data.id)

    db.add(risk)
    db.commit()
    db.refresh(risk)

    return _to_dict(risk)


def get_risks(
    db: Session,
    ai_system_id: str,
) -> list[dict]:
    risks = db.scalars(
        select(RiskModel)
        .where(RiskModel.ai_system_id == ai_system_id)
        .order_by(RiskModel.created_at.desc())
    ).all()

    return [_to_dict(risk) for risk in risks]


def _to_dict(risk: RiskModel) -> dict:
    data = risk.risk_data or {}

    return {
        "id": str(risk.id),
        "objectType": risk.object_type,
        "objectVersion": risk.object_version,
        "schemaVersion": risk.schema_version,
        "status": risk.status,
        "aiSystemId": risk.ai_system_id,
        "riskTitle": risk.risk_title,
        "riskStatement": risk.risk_statement,
        "riskOwner": risk.risk_owner,
        "riskAssessment": risk.risk_assessment,
        **data,
    }
def update_risk(
    db: Session,
    ai_system_id: str,
    risk_id: str,
    data: RiskCreate,
) -> dict | None:
    risk = db.scalar(
        select(RiskModel).where(
            RiskModel.id == UUID(risk_id),
            RiskModel.ai_system_id == ai_system_id,
        )
    )

    if risk is None:
        return None

    risk.object_type = data.objectType
    risk.object_version = data.objectVersion
    risk.schema_version = data.schemaVersion
    risk.status = data.status
    risk.risk_title = data.riskTitle
    risk.risk_statement = data.riskStatement
    risk.risk_owner = data.riskOwner.model_dump()
    risk.risk_assessment = data.riskAssessment.model_dump()
    risk.risk_data = {
        "createdAt": data.createdAt,
        "updatedAt": data.updatedAt,
        "effectiveAt": data.effectiveAt,
        "organization": data.organization,
        "aiSystemId": ai_system_id,
        "aiSystemIds": data.aiSystemIds,
        "cause": data.cause,
        "riskEvent": data.riskEvent,
        "consequences": data.consequences,
        "riskCategory": data.riskCategory,
        "lifecycleStages": data.lifecycleStages,
        "controlOwnerIds": data.controlOwnerIds,
        "affectedStakeholders": data.affectedStakeholders,
        "affectedPersons": data.affectedPersons,
        "potentialHarms": data.potentialHarms,
        "inherentRisk": data.inherentRisk.model_dump() if data.inherentRisk else None,
        "residualRisk": data.residualRisk.model_dump() if data.residualRisk else None,
        "riskTreatment": data.riskTreatment.model_dump() if data.riskTreatment else None,
        "controls": [item.model_dump() for item in data.controls],
        "riskAcceptance": data.riskAcceptance.model_dump() if data.riskAcceptance else None,
        "riskEscalation": data.riskEscalation.model_dump() if data.riskEscalation else None,
        "monitoring": data.monitoring.model_dump() if data.monitoring else None,
        "reassessment": data.reassessment.model_dump() if data.reassessment else None,
        "scenarioAnalysis": [item.model_dump() for item in data.scenarioAnalysis],
        "uncertainty": data.uncertainty.model_dump() if data.uncertainty else None,
        "thirdPartyRisks": [item.model_dump() for item in data.thirdPartyRisks],
        "incidentIds": data.incidentIds,
        "changeIds": data.changeIds,
        "assuranceIds": data.assuranceIds,
        "assessmentIds": data.assessmentIds,
        "approvalIds": data.approvalIds,
        "improvementIds": data.improvementIds,
        "evidenceIds": data.evidenceIds,
        "riskAcceptanceId": data.riskAcceptanceId,
        "relatedRiskIds": data.relatedRiskIds,
        "decision": data.decision.model_dump() if data.decision else None,
        "review": data.review.model_dump() if data.review else None,
        "conditions": [item.model_dump() for item in data.conditions],
    }

    db.commit()
    db.refresh(risk)

    return _to_dict(risk)


def delete_risk(
    db: Session,
    ai_system_id: str,
    risk_id: str,
) -> bool:
    risk = db.scalar(
        select(RiskModel).where(
            RiskModel.id == UUID(risk_id),
            RiskModel.ai_system_id == ai_system_id,
        )
    )

    if risk is None:
        return False

    db.delete(risk)
    db.commit()

    return True