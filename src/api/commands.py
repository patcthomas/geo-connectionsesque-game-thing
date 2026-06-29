import click
from datetime import date
from api.models import db, Puzzle, PuzzleGroup, PuzzleItem
 
 
def setup_commands(app):
 
    # -----------------------------------------------------------------------
    # SEED PUZZLE COMMAND
    # -----------------------------------------------------------------------
    # Run with: pipenv run flask seed-puzzle
    #
    # This creates one complete puzzle in the database — 4 groups, 4 items
    # each — so you have real data to test the API and frontend against.
    #
    # WHY a Flask CLI command instead of a plain Python script?
    # Flask CLI commands run inside the app context, which means SQLAlchemy
    # already knows about your database connection and models. A plain script
    # would need you to manually set all that up first.
    @app.cli.command("seed-puzzle")
    def seed_puzzle():
 
        # -----------------------------------------------------------------------
        # PUZZLE DATA
        # -----------------------------------------------------------------------
        # One puzzle, four groups, four items each.
        # Groups are ordered tier 1 (easiest) → tier 4 (trickiest).
        # This is the same structure your models and serialize() expect.
        puzzle_data = {
            # Using today's date so /api/puzzle/today works immediately.
            # Swap this out for a specific date when building a puzzle bank.
            "publish_date": date.today(),
            "author_notes": "Inaugural puzzle — mix of straightforward and tricky.",
            "groups": [
                {
                    "trait_label": "Countries that share a border with France",
                    "difficulty_tier": 1,
                    "items": ["Belgium", "Switzerland", "Italy", "Spain"]
                },
                {
                    "trait_label": "Countries whose capital is NOT their largest city",
                    "difficulty_tier": 2,
                    # Australia (Canberra/Sydney), Brazil (Brasília/São Paulo),
                    # Canada (Ottawa/Toronto), Pakistan (Islamabad/Karachi)
                    "items": ["Australia", "Brazil", "Canada", "Pakistan"]
                },
                {
                    "trait_label": "Countries that have hosted both Summer AND Winter Olympics",
                    "difficulty_tier": 3,
                    # USA, France, Germany, Japan have all hosted both.
                    # France appearing here is intentional misdirection —
                    # players might assume it belongs in the "borders France" group.
                    "items": ["USA", "France", "Germany", "Japan"]
                },
                {
                    "trait_label": "NATO members that share a border with Russia",
                    "difficulty_tier": 4,
                    # Norway (founding member), Estonia, Latvia (joined 2004),
                    # Finland (joined 2023). Requires knowing both NATO
                    # membership AND geography — hence tier 4.
                    "items": ["Norway", "Finland", "Estonia", "Latvia"]
                }
            ]
        }
 
        # -----------------------------------------------------------------------
        # GUARD: don't seed the same date twice
        # -----------------------------------------------------------------------
        # The database enforces this with unique=True on publish_date, but
        # checking here first gives a friendlier error message than a raw
        # SQLAlchemy IntegrityError.
        existing_puzzle = Puzzle.query.filter_by(
            publish_date=puzzle_data["publish_date"]
        ).first()
 
        if existing_puzzle:
            click.echo(
                f"⚠️  A puzzle already exists for {puzzle_data['publish_date']}. "
                f"Skipping seed. (Puzzle ID: {existing_puzzle.id})"
            )
            return
 
        # -----------------------------------------------------------------------
        # BUILD AND COMMIT
        # -----------------------------------------------------------------------
        # WHY build the whole tree in memory first, then commit once?
        # If any part of this fails (e.g. a duplicate item name), the entire
        # transaction rolls back automatically. You won't end up with a half-
        # seeded puzzle missing some groups or items in the database.
        try:
            new_puzzle = Puzzle(
                publish_date=puzzle_data["publish_date"],
                author_notes=puzzle_data["author_notes"]
            )
            db.session.add(new_puzzle)
 
            for group_data in puzzle_data["groups"]:
                new_group = PuzzleGroup(
                    puzzle=new_puzzle,  # SQLAlchemy links the foreign key for us
                    trait_label=group_data["trait_label"],
                    difficulty_tier=group_data["difficulty_tier"]
                )
                db.session.add(new_group)
 
                for item_name in group_data["items"]:
                    new_item = PuzzleItem(
                        group=new_group,
                        display_name=item_name
                    )
                    db.session.add(new_item)
 
            db.session.commit()
 
            click.echo(
                f"✅ Puzzle seeded for {puzzle_data['publish_date']}! "
                f"Puzzle ID: {new_puzzle.id}"
            )
 
        except Exception as error:
            db.session.rollback()
            click.echo(f"❌ Seed failed and was rolled back: {error}")
