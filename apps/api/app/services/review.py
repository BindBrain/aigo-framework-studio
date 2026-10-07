from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.review import ReviewModel
from app.schemas.review import ReviewCreate


def save_review(db: Session, ai_system_id: str, data: ReviewCreate) -> dict:
    review = ReviewModel(ai_system_id=ai_system_id)

    review.object_type = "REVIEW"
    review.object_version = data.objectVersion
    review.schema_version = data.schemaVersion
    review.status = data.status
    review.review_type = data.reviewType
    review.review_scope = data.review_scope
    review.review_notes = data.review_notes
    review.review_outcome = data.review_outcome
    review.ai_system_id = ai_system_id

    db.add(review)
    db.commit()
    db.refresh(review)

    return _to_dict(review)


def get_review(db: Session, ai_system_id: str) -> list[dict]:
    reviews = db.scalars(
        select(ReviewModel)
        .where(ReviewModel.ai_system_id == ai_system_id)
        .order_by(desc(ReviewModel.created_at))
    ).all()

    return [_to_dict(review) for review in reviews]


def _to_dict(review: ReviewModel) -> dict:
    return {
        "id": str(review.id),
        "objectType": review.object_type,
        "objectVersion": review.object_version,
        "schemaVersion": review.schema_version,
        "status": review.status,
        "reviewType": review.review_type,
        "ai_system_id": review.ai_system_id,
        "review_scope": review.review_scope,
        "review_notes": review.review_notes,
        "review_outcome": review.review_outcome,
    }
