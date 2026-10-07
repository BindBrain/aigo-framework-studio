"""add rule results table

Revision ID: d41f7a9c2e63
Revises: c78e641e5a15
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d41f7a9c2e63"
down_revision: Union[str, None] = "c78e641e5a15"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rule_results",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ai_system_id", sa.String(length=128), nullable=False),
        sa.Column("rule_id", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "ai_system_id",
            "rule_id",
            name="uq_rule_results_ai_system_rule",
        ),
    )


def downgrade() -> None:
    op.drop_table("rule_results")