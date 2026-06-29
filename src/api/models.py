from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import date

db = SQLAlchemy()

# ---------------------------------------------------------------------------
# PUZZLE
# ---------------------------------------------------------------------------
# The top-level record for a single day's puzzle. Each puzzle has exactly
# one date, enforced by unique=True — this prevents accidentally seeding
# two puzzles for the same day, which would break the "puzzle of the day"
# logic in the API.
#
# WHY a separate Puzzle table instead of just storing the date on each group?
# Because a puzzle is a meaningful whole — it has an identity beyond its
# groups. If you ever want to add metadata (author notes, a difficulty rating,
# a "puzzle of the week" flag), this table is where it lives cleanly.
#
# MODERN STYLE NOTE: Mapped[type] is SQLAlchemy 2.0's way of declaring
# columns with Python type hints. The type you put inside Mapped[] tells
# SQLAlchemy (and your editor) what Python type this column holds.
# Mapped[str] = not nullable. Mapped[Optional[str]] = nullable.
class Puzzle(db.Model):
    __tablename__ = "puzzle"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Mapped[date] uses Python's built-in date type (imported above).
    # SQLAlchemy maps it to a DATE column in Postgres automatically.
    # unique=True enforces one puzzle per calendar day at the database level.
    publish_date: Mapped[date] = mapped_column(Date, unique=True)

    # Optional[str] tells SQLAlchemy this column is nullable — a puzzle
    # doesn't need author notes to be valid.
    author_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # back_populates="puzzle" means PuzzleGroup also has a .puzzle attribute
    # that points back here. Both sides of the relationship stay in sync.
    # cascade="all, delete-orphan" means deleting a Puzzle automatically
    # deletes all its groups — no orphaned rows left behind.
    groups: Mapped[List["PuzzleGroup"]] = relationship(
        back_populates="puzzle",
        cascade="all, delete-orphan",
        order_by="PuzzleGroup.difficulty_tier"  # always sorted 1 → 4
    )

    # serialize() converts this object to a plain dict for jsonify().
    # The shape matches puzzleGroups in GeoConnectionsGrid.jsx exactly —
    # so the frontend needs zero changes when we swap in the real API call.
    def serialize(self):
        return {
            "puzzleId": self.id,
            "publishDate": self.publish_date.isoformat(),  # e.g. "2025-06-15"
            "groups": [group.serialize() for group in self.groups]
        }

    def __repr__(self):
        return f"<Puzzle {self.publish_date}>"


# ---------------------------------------------------------------------------
# PUZZLE GROUP
# ---------------------------------------------------------------------------
# One of the four categories within a puzzle. Holds the trait label (the
# thing the four items have in common) and the difficulty tier (1-4).
#
# WHY store difficulty_tier explicitly instead of deriving it from position? If you ever reorder groups or skip a
# tier for a special puzzle, the stored number is the source of truth.
class PuzzleGroup(db.Model):
    __tablename__ = "puzzle_group"

    id: Mapped[int] = mapped_column(primary_key=True)

    # ForeignKey links this group back to its parent puzzle.
    # Mapped[int] (not Optional) means this is required.

    puzzle_id: Mapped[int] = mapped_column(ForeignKey("puzzle.id"))

    # The text revealed when the player solves this group.
    # e.g. "Countries the equator passes through"
    trait_label: Mapped[str] = mapped_column(String(255))

    # 1 = easiest (yellow), 2 = medium (green),
    # 3 = hard (blue), 4 = trickiest (purple).
    # Matches difficultyTierStyles in GeoConnectionsGrid.jsx exactly.
    difficulty_tier: Mapped[int] = mapped_column(Integer)

    # The back_populates on both sides keep the relationship in sync.
    puzzle: Mapped["Puzzle"] = relationship(back_populates="groups")

    items: Mapped[List["PuzzleItem"]] = relationship(
        back_populates="group",
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "groupId": str(self.id),
            "traitLabel": self.trait_label,
            "difficultyTier": self.difficulty_tier,
            # Flatten items to just their display names — the React component
            # only needs the string, not the full item object.
            "countryNames": [item.display_name for item in self.items]
        }

    def __repr__(self):
        return f"<PuzzleGroup tier={self.difficulty_tier} '{self.trait_label}'>"


# ---------------------------------------------------------------------------
# PUZZLE ITEM
# ---------------------------------------------------------------------------
# A single tile in the grid — one country, city, or place name.
# Each item belongs to exactly one group.

class PuzzleItem(db.Model):
    __tablename__ = "puzzle_item"

    id: Mapped[int] = mapped_column(primary_key=True)

    group_id: Mapped[int] = mapped_column(ForeignKey("puzzle_group.id"))

    # The text shown on the tile. e.g. "Bolivia", "Washington D.C."
    # Should be kept short enough to fit within the tile
    display_name: Mapped[str] = mapped_column(String(100))

    group: Mapped["PuzzleGroup"] = relationship(back_populates="items")

    def serialize(self):
        return {
            "itemId": self.id,
            "displayName": self.display_name
        }

    def __repr__(self):
        return f"<PuzzleItem '{self.display_name}'>"