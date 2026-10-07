"""allow multiple reviews per AI system

Revision ID: 4f2c8a1d7e91
Revises: ed1b7442909d
Create Date: 2026-10-05

"""
from typing import Sequence, Union

from alembic import op


revision: str = "4f2c8a1d7e91"
down_revision: Union[str, Sequence[str], None] = "ed1b7442909d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "reviews_ai_system_id_key",
        "reviews",
        type_="unique",
    )


def downgrade() -> None:
    op.create_unique_constraint(
        "reviews_ai_system_id_key",
        "reviews",
        ["ai_system_id"],
    )