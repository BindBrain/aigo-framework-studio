from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ChangeModel(Base):
    __tablename__ = "changes"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    ai_system_id: Mapped[str] = mapped_column(String(128), nullable=False)
    object_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="CHANGE",
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
        String(100),
        nullable=False,
        default="DRAFT",
    )
    change_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    change_owner: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )
    change_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    change_data: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
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
