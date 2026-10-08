"""add governance actor fields

Revision ID: f7a2c9d4e6b1
Revises: f3c8a1b7d4e2
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f7a2c9d4e6b1"
down_revision: Union[str, None] = "f3c8a1b7d4e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for table in ("reviews", "approvals", "changes", "incidents"):
        op.add_column(table, sa.Column("performed_by", postgresql.UUID(as_uuid=True), nullable=True))
        op.create_foreign_key(f"fk_{table}_performed_by_users", table, "users", ["performed_by"], ["id"])


def downgrade() -> None:
    for table in ("incidents", "changes", "approvals", "reviews"):
        op.drop_constraint(f"fk_{table}_performed_by_users", table, type_="foreignkey")
        op.drop_column(table, "performed_by")