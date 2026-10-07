from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MonitoringModel(Base):
    __tablename__ = "monitoring"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    ai_system_id: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    object_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="MONITORING",
    )

    object_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="1.0",
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

    monitoring_objectives: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    indicators: Mapped[list] = mapped_column(
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
