"""create homepage table

Revision ID: 20260524_0003
Revises: 20260523_0002
Create Date: 2026-05-24
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260524_0003"
down_revision: Union[str, None] = "20260523_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "homepage",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hero_title", sa.String(length=500), nullable=True),
        sa.Column("hero_subtitle", sa.Text(), nullable=True),
        sa.Column("stats_json", sa.Text(), nullable=True),
        sa.Column("promises_json", sa.Text(), nullable=True),
        sa.Column("coming_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_homepage_id"), "homepage", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_homepage_id"), table_name="homepage")
    op.drop_table("homepage")
