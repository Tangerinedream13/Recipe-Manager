"""
Recipe model
============

This file defines the Recipe database model using SQLAlchemy ORM.
It represents a single recipe item stored in the database.

Each Recipe has:
- title: the name of the recipe
- description: a short summary of the dish
- ingredients: list or text of ingredients
- instructions: cooking steps
- created_at: timestamp when the recipe was created
- updated_at: timestamp when the recipe was last updated
"""

from sqlalchemy import Column, Date, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from .base import Base


class Recipe(Base):
    """
    SQLAlchemy Recipe model.

    This maps directly to the "recipes" table in the PostgreSQL database.
    Each attribute below becomes a column in the table.
    """

    __tablename__ = "recipes"

    # Primary key ID column
    id = Column(Integer, primary_key=True, index=True)

    # Recipe fields
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)

    # Optional meal-planning date (YYYY-MM-DD)
    planned_for = Column(Date, nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<Recipe id={self.id} title={self.title!r}>"


# end of file
