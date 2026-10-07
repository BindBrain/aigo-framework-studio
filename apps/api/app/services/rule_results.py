from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.rule_result import RuleResultModel
from app.models.rule_result_history import RuleResultHistoryModel
from app.schemas.rule_results import RuleResultsUpdate


def save_rule_results(
    db: Session,
    ai_system_id: str,
    data: RuleResultsUpdate,
) -> list[dict]:
    for result in data.results:
        item = db.scalar(
            select(RuleResultModel).where(
                RuleResultModel.ai_system_id == ai_system_id,
                RuleResultModel.rule_id == result.rule_id,
            )
        )

        changed = (
            item is None
            or item.status != result.status
            or item.notes != result.notes
        )

        if item is None:
            item = RuleResultModel(
                ai_system_id=ai_system_id,
                rule_id=result.rule_id,
                status=result.status,
                notes=result.notes,
            )
            db.add(item)
        else:
            item.status = result.status
            item.notes = result.notes

        if changed:
            db.add(
                RuleResultHistoryModel(
                    ai_system_id=ai_system_id,
                    rule_id=result.rule_id,
                    status=result.status,
                    notes=result.notes,
                )
            )

    db.commit()

    return get_rule_results(db, ai_system_id)


def get_rule_results(
    db: Session,
    ai_system_id: str,
) -> list[dict]:
    items = db.scalars(
        select(RuleResultModel)
        .where(RuleResultModel.ai_system_id == ai_system_id)
        .order_by(RuleResultModel.rule_id.asc())
    ).all()

    return [_to_dict(item) for item in items]


def get_rule_result_history(
    db: Session,
    ai_system_id: str,
    rule_id: str,
) -> list[dict]:
    items = db.scalars(
        select(RuleResultHistoryModel)
        .where(
            RuleResultHistoryModel.ai_system_id == ai_system_id,
            RuleResultHistoryModel.rule_id == rule_id,
        )
        .order_by(RuleResultHistoryModel.created_at.desc())
    ).all()

    return [_history_to_dict(item) for item in items]


def _to_dict(result: RuleResultModel) -> dict:
    return {
        "rule_id": result.rule_id,
        "status": result.status,
        "notes": result.notes,
    }


def _history_to_dict(result: RuleResultHistoryModel) -> dict:
    return {
        "id": str(result.id),
        "rule_id": result.rule_id,
        "status": result.status,
        "notes": result.notes,
        "created_at": result.created_at,
    }
