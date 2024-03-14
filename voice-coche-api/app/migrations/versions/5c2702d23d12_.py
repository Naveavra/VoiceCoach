"""empty message

Revision ID: 5c2702d23d12
Revises: 8a6bada576da
Create Date: 2024-03-11 11:35:58.293321

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5c2702d23d12'
down_revision = '8a6bada576da'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('notification', sa.Column('class_id', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'notification', 'class', ['class_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'notification', type_='foreignkey')
    op.drop_column('notification', 'class_id')
    # ### end Alembic commands ###