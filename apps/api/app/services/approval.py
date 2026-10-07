from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.approval import ApprovalModel
from app.schemas.approval import ApprovalCreate


def save_approval(db: Session, ai_system_id: str, data: ApprovalCreate) -> dict:
    approval = db.scalars(
        select(ApprovalModel).where(
            ApprovalModel.ai_system_id == ai_system_id
        )
    ).first()

    if approval is None:
        approval = ApprovalModel(ai_system_id=ai_system_id)

    approval.object_type = "APPROVAL"
    approval.object_version = data.objectVersion
    approval.schema_version = data.schemaVersion
    approval.status = data.status
    approval.approval_type = data.approvalType
    approval.approval_scope = data.approval_scope
    approval.approval_notes = data.approval_notes
    approval.approval_outcome = data.approval_outcome
    approval.ai_system_id = ai_system_id
    approval.performed_by = UUID(data.performedBy) if data.performedBy else None

    db.add(approval)
    db.commit()
    db.refresh(approval)

    return _to_dict(approval)


def get_approval(db: Session, ai_system_id: str) -> dict:
    approval = db.scalars(
        select(ApprovalModel).where(
            ApprovalModel.ai_system_id == ai_system_id
        )
    ).first()

    if approval is None:
        return {
            "ai_system_id": ai_system_id,
            "status": "NOT_STARTED",
            "approvalType": "GOVERNANCE_APPROVAL",
            "approval_scope": None,
            "approval_notes": None,
            "approval_outcome": "NOT_ASSESSED",
        }

    return _to_dict(approval)


def _to_dict(approval: ApprovalModel) -> dict:
    return {
        "id": str(approval.id),
        "objectType": approval.object_type,
        "objectVersion": approval.object_version,
        "schemaVersion": approval.schema_version,
        "status": approval.status,
        "approvalType": approval.approval_type,
        "ai_system_id": approval.ai_system_id,
        "approval_scope": approval.approval_scope,
        "approval_notes": approval.approval_notes,
        "approval_outcome": approval.approval_outcome,
        "performedBy": str(approval.performed_by) if approval.performed_by else None,
        "createdAt": approval.created_at.isoformat() if approval.created_at else None,
        "updatedAt": approval.updated_at.isoformat() if approval.updated_at else None,
    }
