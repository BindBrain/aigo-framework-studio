from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    ai_system_id: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        unique=True,
    )

    object_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="ASSESSMENT",
    )

    object_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="0.1",
    )

    schema_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="0.1",
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="DRAFT",
    )

    assessment_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="CONTROL",
    )

    subject: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    scope: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    criteria: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    assessment_result: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    reassessment: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    evaluation_purpose: Mapped[str | None] = mapped_column(
        String(5000),
        nullable=True,
    )

    governance_context: Mapped[str | None] = mapped_column(
        String(5000),
        nullable=True,
    )

    evaluation_scope: Mapped[str | None] = mapped_column(
        String(5000),
        nullable=True,
    )

    evaluation_trigger: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="initial_assessment",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

