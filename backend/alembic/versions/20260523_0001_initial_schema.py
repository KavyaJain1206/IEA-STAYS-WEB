"""initial schema

Revision ID: 20260523_0001
Revises:
Create Date: 2026-05-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260523_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


resident_status = sa.Enum("pending", "approved", "rejected", "inactive", name="resident_status")
preferred_home = sa.Enum("Studio", "Nest", "BNB", name="preferred_home")
visit_time_slot = sa.Enum("Morning", "Afternoon", "Evening", name="visit_time_slot")
visit_status = sa.Enum("new", "contacted", "scheduled", "completed", "cancelled", name="visit_status")


def upgrade() -> None:
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_admin_users_email"), "admin_users", ["email"], unique=True)
    op.create_index(op.f("ix_admin_users_id"), "admin_users", ["id"], unique=False)

    op.create_table(
        "residents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("mobile", sa.String(length=20), nullable=False),
        sa.Column("alternate_mobile", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("aadhaar_number", sa.String(length=12), nullable=False),
        sa.Column("pan_number", sa.String(length=10), nullable=False),
        sa.Column("permanent_address", sa.Text(), nullable=False),
        sa.Column("residence_address", sa.Text(), nullable=False),
        sa.Column("occupation", sa.String(length=120), nullable=False),
        sa.Column("firm_name", sa.String(length=180), nullable=True),
        sa.Column("firm_address", sa.Text(), nullable=True),
        sa.Column("next_of_kin", sa.String(length=160), nullable=False),
        sa.Column("relationship", sa.String(length=80), nullable=False),
        sa.Column("kin_mobile", sa.String(length=20), nullable=False),
        sa.Column("kin_alternate_mobile", sa.String(length=20), nullable=True),
        sa.Column("food_from_iea", sa.Boolean(), nullable=False),
        sa.Column("food_delivery_provider", sa.String(length=160), nullable=True),
        sa.Column("status", resident_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_residents_aadhaar_number"), "residents", ["aadhaar_number"], unique=True)
    op.create_index(op.f("ix_residents_email"), "residents", ["email"], unique=True)
    op.create_index(op.f("ix_residents_id"), "residents", ["id"], unique=False)
    op.create_index(op.f("ix_residents_mobile"), "residents", ["mobile"], unique=False)
    op.create_index(op.f("ix_residents_pan_number"), "residents", ["pan_number"], unique=True)
    op.create_index(op.f("ix_residents_status"), "residents", ["status"], unique=False)

    op.create_table(
        "visit_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("home", preferred_home, nullable=False),
        sa.Column("preferred_date", sa.Date(), nullable=True),
        sa.Column("preferred_time", visit_time_slot, nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", visit_status, nullable=False),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_visit_requests_email"), "visit_requests", ["email"], unique=False)
    op.create_index(op.f("ix_visit_requests_id"), "visit_requests", ["id"], unique=False)
    op.create_index(op.f("ix_visit_requests_phone"), "visit_requests", ["phone"], unique=False)
    op.create_index(op.f("ix_visit_requests_status"), "visit_requests", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_visit_requests_status"), table_name="visit_requests")
    op.drop_index(op.f("ix_visit_requests_phone"), table_name="visit_requests")
    op.drop_index(op.f("ix_visit_requests_id"), table_name="visit_requests")
    op.drop_index(op.f("ix_visit_requests_email"), table_name="visit_requests")
    op.drop_table("visit_requests")

    op.drop_index(op.f("ix_residents_status"), table_name="residents")
    op.drop_index(op.f("ix_residents_pan_number"), table_name="residents")
    op.drop_index(op.f("ix_residents_mobile"), table_name="residents")
    op.drop_index(op.f("ix_residents_id"), table_name="residents")
    op.drop_index(op.f("ix_residents_email"), table_name="residents")
    op.drop_index(op.f("ix_residents_aadhaar_number"), table_name="residents")
    op.drop_table("residents")

    op.drop_index(op.f("ix_admin_users_id"), table_name="admin_users")
    op.drop_index(op.f("ix_admin_users_email"), table_name="admin_users")
    op.drop_table("admin_users")

    visit_status.drop(op.get_bind(), checkfirst=True)
    visit_time_slot.drop(op.get_bind(), checkfirst=True)
    preferred_home.drop(op.get_bind(), checkfirst=True)
    resident_status.drop(op.get_bind(), checkfirst=True)
