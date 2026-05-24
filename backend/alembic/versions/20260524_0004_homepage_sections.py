"""create homepage_sections table

Revision ID: 20260524_0004_homepage_sections
Revises: 20260523_0002
Create Date: 2026-05-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260524_0004_homepage_sections'
down_revision = '20260524_0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'homepage_sections',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('key', sa.String(length=160), nullable=False, unique=True, index=True),
        sa.Column('type', sa.String(length=80), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=True),
        sa.Column('content_json', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('homepage_sections')
