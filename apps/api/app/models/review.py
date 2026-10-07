from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ReviewModel(Base):
    __tablename__ = "reviews"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    ai_system_id: Mapped[str] = mapped_column(String(128), nullable=False)
    performed_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    object_type: Mapped[str] = mapped_column(String(100), nullable=False, default="REVIEW")
    object_version: Mapped[str] = mapped_column(String(50), nullable=False, default="0.1")
    schema_version: Mapped[str] = mapped_column(String(50), nullable=False, default="0.1")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="DRAFT")
    review_type: Mapped[str] = mapped_column(String(100), nullable=False, default="GOVERNANCE_REVIEW")
    review_scope: Mapped[str | None] = mapped_column(String(5000), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(String(10000), nullable=True)
    review_outcome: Mapped[str] = mapped_column(String(100), nullable=False, default="NOT_ASSESSED")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
