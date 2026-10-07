from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EvidenceModel(Base):
    __tablename__ = "evidence"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    evidence_title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    purpose: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="DRAFT",
    )

    object_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="EVIDENCE",
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

    evidence_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    evidence_type: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    format: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    ai_system_id: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    lifecycle_stage: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    control_ids: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    assessment_ids: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
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
