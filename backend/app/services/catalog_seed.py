import re
from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.catalog import HomeCollection


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "item"


ZODIAC_STARTER_COLLECTIONS: Sequence[dict[str, object]] = (
    {
        "name": "Aries",
        "symbol": "\u2648",
        "tone": "Bold. Energetic. Driven.",
        "description": "A high-energy stay concept built for residents who value momentum, focus, and premium convenience.",
        "sort_order": 10,
    },
    {
        "name": "Taurus",
        "symbol": "\u2649",
        "tone": "Grounded. Warm. Sensory.",
        "description": "A comfort-led stay concept with calm interiors, stable routines, and reliable hospitality.",
        "sort_order": 20,
    },
    {
        "name": "Gemini",
        "symbol": "\u264A",
        "tone": "Social. Smart. Dynamic.",
        "description": "A connected stay concept designed for flexibility, conversation, and modern everyday flow.",
        "sort_order": 30,
    },
    {
        "name": "Cancer",
        "symbol": "\u264B",
        "tone": "Nurturing. Secure. Home-like.",
        "description": "A stay concept centered on emotional comfort, trust, and a genuine sense of belonging.",
        "sort_order": 40,
    },
    {
        "name": "Leo",
        "symbol": "\u264C",
        "tone": "Confident. Premium. Expressive.",
        "description": "A statement stay concept with elevated finishes and a confident lifestyle atmosphere.",
        "sort_order": 50,
    },
    {
        "name": "Virgo",
        "symbol": "\u264D",
        "tone": "Clean. Precise. Functional.",
        "description": "An efficiency-first stay concept for residents who prefer order, hygiene, and dependable operations.",
        "sort_order": 60,
    },
    {
        "name": "Libra",
        "symbol": "\u264E",
        "tone": "Balanced. Refined. Harmonious.",
        "description": "A design-conscious stay concept that balances social comfort, elegance, and practical living.",
        "sort_order": 70,
    },
    {
        "name": "Scorpio",
        "symbol": "\u264F",
        "tone": "Private. Deep. Intentional.",
        "description": "A focused stay concept offering privacy, depth, and a strongly curated resident experience.",
        "sort_order": 80,
    },
    {
        "name": "Sagittarius",
        "symbol": "\u2650",
        "tone": "Open. Adventurous. Optimistic.",
        "description": "An expansive stay concept built around freedom, growth, and an active urban lifestyle.",
        "sort_order": 90,
    },
    {
        "name": "Capricorn",
        "symbol": "\u2651",
        "tone": "Disciplined. Professional. Steady.",
        "description": "A structured stay concept for goal-driven residents seeking dependable premium standards.",
        "sort_order": 100,
    },
    {
        "name": "Aquarius",
        "symbol": "\u2652",
        "tone": "Progressive. Independent. Urban.",
        "description": "A future-facing stay concept blending individuality, innovation, and city convenience.",
        "sort_order": 110,
    },
    {
        "name": "Pisces",
        "symbol": "\u2653",
        "tone": "Calm. Creative. Restorative.",
        "description": "A restful stay concept with soft ambience, creative energy, and emotional ease.",
        "sort_order": 120,
    },
)

ZODIAC_STARTER_NAMES = tuple(entry["name"] for entry in ZODIAC_STARTER_COLLECTIONS)


def ensure_zodiac_starter_collections(db: Session) -> dict[str, int]:
    created = 0

    for entry in ZODIAC_STARTER_COLLECTIONS:
        name = str(entry["name"])
        slug = slugify(name)

        existing = db.scalar(
            select(HomeCollection).where(
                (func.lower(HomeCollection.name) == name.lower()) | (HomeCollection.slug == slug)
            )
        )
        if existing is not None:
            continue

        db.add(
            HomeCollection(
                name=name,
                slug=slug,
                symbol=str(entry["symbol"]),
                tone=str(entry["tone"]),
                description=str(entry["description"]),
                cover_image_src=None,
                is_active=True,
                sort_order=int(entry["sort_order"]),
            )
        )
        created += 1

    if created:
        db.commit()

    return {"created": created, "total_starters": len(ZODIAC_STARTER_COLLECTIONS)}
