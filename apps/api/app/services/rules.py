from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.rule import RuleModel
from app.schemas.rules import GovernanceRulesUpdate


def save_governance_rules(
    db: Session,
    ai_system_id: str,
    data: GovernanceRulesUpdate,
) -> list[dict]:
    db.execute(
        delete(RuleModel).where(RuleModel.ai_system_id == ai_system_id)
    )

    rules = []

    for rule in data.rules:
        item = RuleModel(
            id=UUID(rule.id),
            ai_system_id=ai_system_id,
            name=rule.name,
            description=rule.description,
            source=rule.source,
            applicability=rule.applicability,
        )
        db.add(item)
        rules.append(_to_dict(item))

    db.commit()

    return rules


def get_governance_rules(
    db: Session,
    ai_system_id: str,
) -> list[dict]:
    items = db.scalars(
        select(RuleModel)
        .where(RuleModel.ai_system_id == ai_system_id)
        .order_by(RuleModel.name.asc())
    ).all()

    return [_to_dict(item) for item in items]


def _to_dict(rule: RuleModel) -> dict:
    return {
        "id": str(rule.id),
        "name": rule.name,
        "description": rule.description,
        "source": rule.source,
        "applicability": rule.applicability,
    }