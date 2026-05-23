"""catalog tables

Revision ID: 20260523_0002
Revises: 20260523_0001
Create Date: 2026-05-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260523_0002"
down_revision: Union[str, None] = "20260523_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "home_collections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("symbol", sa.String(length=16), nullable=False),
        sa.Column("tone", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cover_image_src", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_home_collections_id"), "home_collections", ["id"], unique=False)
    op.create_index(op.f("ix_home_collections_name"), "home_collections", ["name"], unique=True)
    op.create_index(op.f("ix_home_collections_slug"), "home_collections", ["slug"], unique=True)

    op.create_table(
        "homes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_src", sa.String(length=500), nullable=False),
        sa.Column("photo_class_name", sa.String(length=80), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["collection_id"], ["home_collections.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_homes_collection_id"), "homes", ["collection_id"], unique=False)
    op.create_index(op.f("ix_homes_id"), "homes", ["id"], unique=False)
    op.create_index(op.f("ix_homes_name"), "homes", ["name"], unique=True)
    op.create_index(op.f("ix_homes_slug"), "homes", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_homes_slug"), table_name="homes")
    op.drop_index(op.f("ix_homes_name"), table_name="homes")
    op.drop_index(op.f("ix_homes_id"), table_name="homes")
    op.drop_index(op.f("ix_homes_collection_id"), table_name="homes")
    op.drop_table("homes")

    op.drop_index(op.f("ix_home_collections_slug"), table_name="home_collections")
    op.drop_index(op.f("ix_home_collections_name"), table_name="home_collections")
    op.drop_index(op.f("ix_home_collections_id"), table_name="home_collections")
    op.drop_table("home_collections")