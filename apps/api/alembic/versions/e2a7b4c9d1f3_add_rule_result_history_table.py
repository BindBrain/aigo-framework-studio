"""add rule result history table

Revision ID: e2a7b4c9d1f3
Revises: d41f7a9c2e63
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e2a7b4c9d1f3"
down_revision: Union[str, None] = "d41f7a9c2e63"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rule_result_history",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ai_system_id", sa.String(length=128), nullable=False),
        sa.Column("rule_id", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("rule_result_history")
