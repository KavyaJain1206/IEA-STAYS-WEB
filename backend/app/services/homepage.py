import json
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.homepage_section import HomepageSection
from app.schemas.homepage import HomepageUpdate
from app.services.homepage_sections import list_sections

DEFAULT_HOMEPAGE = {
    "hero_title": "Premium PG stays, shaped around comfort and belonging.",
    "hero_subtitle": (
        "IEA Stays Live brings you a chain of refined PG homes, each inspired by a zodiac sign "
        "and crafted for modern living, community, and peace of mind."
    ),
    "stats": [
        {"value": "12", "lines": ["Zodiac Collections", "Unique PG Chains"]},
        {"value": "30+", "lines": ["Curated Locations", "Across Cities"]},
        {"value": "1,000+", "lines": ["Happy Residents", "And Growing"]},
    ],
    "promises": [
        {"icon": "\u2616", "title": "Verified Homes", "description": "Every home is verified for quality, safety, and reliability."},
        {"icon": "\u2662", "title": "Managed Services", "description": "Professional management for a hassle-free living experience."},
        {"icon": "\u2668", "title": "Safe Living", "description": "24/7 security, CCTV, and emergency support."},
        {"icon": "\u2617", "title": "Community Experiences", "description": "Events, workshops, and connections that feel like family."},
    ],
    "coming": {
        "symbol": "\u2649",
        "name": "Taurus",
        "tone": "Grounded. Warm. Sensory.",
        "description": (
            "This zodiac-led PG collection is being curated. Soon, it will have its own homes, "
            "imagery, amenities, and story while keeping the same premium IEA Stays experience."
        ),
    },
}


def get_homepage(db: Session) -> dict:
    sections = list_sections(db, include_inactive=False)
    
    # If no modular sections exist in the database, seed them from defaults to preserve the UI
    if not sections:
        try:
            hero_sec = HomepageSection(
                key="hero",
                type="hero",
                title=DEFAULT_HOMEPAGE["hero_title"],
                content_json=json.dumps({"subtitle": DEFAULT_HOMEPAGE["hero_subtitle"]}),
                is_active=True,
                sort_order=0,
            )
            stats_sec = HomepageSection(
                key="stats",
                type="stats",
                content_json=json.dumps(DEFAULT_HOMEPAGE["stats"]),
                is_active=True,
                sort_order=10,
            )
            promises_sec = HomepageSection(
                key="promises",
                type="promises",
                content_json=json.dumps(DEFAULT_HOMEPAGE["promises"]),
                is_active=True,
                sort_order=20,
            )
            coming_sec = HomepageSection(
                key="coming",
                type="coming",
                content_json=json.dumps(DEFAULT_HOMEPAGE["coming"]),
                is_active=True,
                sort_order=30,
            )
            db.add_all([hero_sec, stats_sec, promises_sec, coming_sec])
            db.commit()
            sections = list_sections(db, include_inactive=False)
        except Exception:
            pass

    composed: dict = {}
    for sec in sections:
        try:
            content = json.loads(sec.content_json) if sec.content_json else {}
            if sec.type == "hero":
                hero = {
                    "title": sec.title or content.get("title") or DEFAULT_HOMEPAGE["hero_title"],
                    "description": content.get("description") or content.get("subtitle") or DEFAULT_HOMEPAGE["hero_subtitle"],
                    "cta_primary_text": content.get("cta_primary_text") or "Explore Homes",
                    "cta_primary_href": content.get("cta_primary_href") or "#homes",
                    "cta_secondary_text": content.get("cta_secondary_text") or "Book a Visit",
                    "cta_secondary_href": content.get("cta_secondary_href") or "/visit",
                    "image_src": content.get("image_src") or "",
                    "image_alt": content.get("image_alt") or "",
                }
                composed["hero"] = hero
                composed["hero_title"] = hero["title"]
                composed["hero_subtitle"] = hero["description"]
            elif sec.type == "stats":
                composed["stats"] = content.get("items") if isinstance(content, dict) else content
            elif sec.type == "promises":
                composed["promises"] = content.get("items") if isinstance(content, dict) else content
            elif sec.type == "coming":
                composed["coming"] = content
            elif sec.type == "featured_homes":
                composed["featured_homes"] = content
            elif sec.type == "featured_collections":
                composed["featured_collections"] = content
            elif sec.type == "testimonials":
                composed["testimonials"] = content
            else:
                composed[sec.key] = content
        except Exception:
            continue

    # Clean default fallbacks to satisfy the expected layout schema
    composed.setdefault(
        "hero",
        {
            "title": DEFAULT_HOMEPAGE["hero_title"],
            "description": DEFAULT_HOMEPAGE["hero_subtitle"],
            "cta_primary_text": "Explore Homes",
            "cta_primary_href": "#homes",
            "cta_secondary_text": "Book a Visit",
            "cta_secondary_href": "/visit",
            "image_src": "",
            "image_alt": "",
        },
    )
    composed.setdefault("hero_title", DEFAULT_HOMEPAGE["hero_title"])
    composed.setdefault("hero_subtitle", DEFAULT_HOMEPAGE["hero_subtitle"])
    composed.setdefault("stats", DEFAULT_HOMEPAGE["stats"])
    composed.setdefault("promises", DEFAULT_HOMEPAGE["promises"])
    composed.setdefault("coming", DEFAULT_HOMEPAGE["coming"])

    return composed


def update_homepage(db: Session, payload: HomepageUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)

    if "hero_title" in data or "hero_subtitle" in data:
        hero_sec = db.scalar(select(HomepageSection).where(HomepageSection.key == "hero"))
        if hero_sec is None:
            hero_sec = HomepageSection(key="hero", type="hero", sort_order=0)
        if "hero_title" in data:
            hero_sec.title = data.get("hero_title")
        if "hero_subtitle" in data:
            hero_content = json.loads(hero_sec.content_json) if hero_sec.content_json else {}
            hero_content["subtitle"] = data.get("hero_subtitle")
            hero_content["description"] = data.get("hero_subtitle")
            hero_sec.content_json = json.dumps(hero_content)
        db.add(hero_sec)

    if "stats" in data:
        stats_sec = db.scalar(select(HomepageSection).where(HomepageSection.key == "stats"))
        if stats_sec is None:
            stats_sec = HomepageSection(key="stats", type="stats", sort_order=10)
        stats_sec.content_json = json.dumps(data.get("stats"))
        db.add(stats_sec)

    if "promises" in data:
        promises_sec = db.scalar(select(HomepageSection).where(HomepageSection.key == "promises"))
        if promises_sec is None:
            promises_sec = HomepageSection(key="promises", type="promises", sort_order=20)
        promises_sec.content_json = json.dumps(data.get("promises"))
        db.add(promises_sec)

    if "coming" in data:
        coming_sec = db.scalar(select(HomepageSection).where(HomepageSection.key == "coming"))
        if coming_sec is None:
            coming_sec = HomepageSection(key="coming", type="coming", sort_order=30)
        coming_sec.content_json = json.dumps(data.get("coming"))
        db.add(coming_sec)

    db.commit()
    return get_homepage(db)
