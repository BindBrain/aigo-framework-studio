"""add changes

Revision ID: 8a4c6e2f1b90
Revises: d62dfe53fda8
Create Date: 2026-10-05
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "8a4c6e2f1b90"
down_revision = "d62dfe53fda8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "changes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "ai_system_id",
            sa.String(length=128),
            nullable=False,
        ),
        sa.Column(
            "object_type",
            sa.String(length=100),
            nullable=False,
            server_default="CHANGE",
        ),
        sa.Column(
            "object_version",
            sa.String(length=50),
            nullable=False,
            server_default="0.1",
        ),
        sa.Column(
            "schema_version",
            sa.String(length=50),
            nullable=False,
            server_default="0.1",
        ),
        sa.Column(
            "status",
            sa.String(length=100),
            nullable=False,
            server_default="DRAFT",
        ),
        sa.Column(
            "change_type",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "change_owner",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "change_description",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "change_data",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("changes")
