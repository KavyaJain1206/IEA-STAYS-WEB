import json
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.homepage import HomepageContent
from app.schemas.homepage import HomepageUpdate
from app.services.homepage_sections import list_sections, get_section_by_key
from app.models.homepage_section import HomepageSection


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
        {"icon": "\u9826", "title": "Verified Homes", "description": "Every home is verified for quality, safety, and reliability."},
        {"icon": "\u8962", "title": "Managed Services", "description": "Professional management for a hassle-free living experience."},
        {"icon": "\u9817", "title": "Safe Living", "description": "24/7 security, CCTV, and emergency support."},
        {"icon": "\u9831", "title": "Community Experiences", "description": "Events, workshops, and connections that feel like family."},
    ],
    "coming": {
        "symbol": "\u10038;",
        "name": "Taurus",
        "tone": "Grounded. Warm. Sensory.",
        "description": (
            "This zodiac-led PG collection is being curated. Soon, it will have its own homes, "
            "imagery, amenities, and story while keeping the same premium IEA Stays experience."
        ),
    },
}


def get_homepage(db: Session) -> dict:
    # Compose homepage from ordered active sections. If no sections exist, fall back to single HomepageContent
    sections = list_sections(db, include_inactive=False)
    # if there are no modular sections yet, seed defaults from DEFAULT_HOMEPAGE to preserve UX
    if not sections:
        # ensure legacy single-row exists
        legacy = db.scalar(select(HomepageContent).limit(1))
        if legacy is None:
            legacy = HomepageContent(
                hero_title=DEFAULT_HOMEPAGE["hero_title"],
                hero_subtitle=DEFAULT_HOMEPAGE["hero_subtitle"],
                stats_json=json.dumps(DEFAULT_HOMEPAGE["stats"]),
                promises_json=json.dumps(DEFAULT_HOMEPAGE["promises"]),
                coming_json=json.dumps(DEFAULT_HOMEPAGE["coming"]),
            )
            db.add(legacy)
            db.commit()
            db.refresh(legacy)

        # create modular sections mirroring legacy content
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
        except Exception:
            # if seeding fails, continue with legacy behavior
            pass

        sections = list_sections(db, include_inactive=False)

    if sections:
        composed: dict = {}
        for sec in sections:
            try:
                content = json.loads(sec.content_json) if sec.content_json else {}
                # core section types map to the existing response shape
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
                    # custom sections are added under their key
                    composed[sec.key] = content
            except Exception:
                # if a section's JSON is malformed, skip it to preserve public UX
                continue
        # ensure the response always satisfies the legacy schema
        legacy = db.scalar(select(HomepageContent).limit(1))
        fallback_homepage = legacy or HomepageContent(
            hero_title=DEFAULT_HOMEPAGE["hero_title"],
            hero_subtitle=DEFAULT_HOMEPAGE["hero_subtitle"],
            stats_json=json.dumps(DEFAULT_HOMEPAGE["stats"]),
            promises_json=json.dumps(DEFAULT_HOMEPAGE["promises"]),
            coming_json=json.dumps(DEFAULT_HOMEPAGE["coming"]),
        )
        composed.setdefault(
            "hero",
            {
                "title": fallback_homepage.hero_title,
                "description": fallback_homepage.hero_subtitle,
                "cta_primary_text": "Explore Homes",
                "cta_primary_href": "#homes",
                "cta_secondary_text": "Book a Visit",
                "cta_secondary_href": "/visit",
                "image_src": "",
                "image_alt": "",
            },
        )
        composed.setdefault("hero_title", fallback_homepage.hero_title)
        composed.setdefault("hero_subtitle", fallback_homepage.hero_subtitle)
        composed.setdefault(
            "stats",
            json.loads(fallback_homepage.stats_json) if getattr(fallback_homepage, "stats_json", None) else DEFAULT_HOMEPAGE["stats"],
        )
        composed.setdefault(
            "promises",
            json.loads(fallback_homepage.promises_json) if getattr(fallback_homepage, "promises_json", None) else DEFAULT_HOMEPAGE["promises"],
        )
        composed.setdefault(
            "coming",
            json.loads(fallback_homepage.coming_json) if getattr(fallback_homepage, "coming_json", None) else DEFAULT_HOMEPAGE["coming"],
        )
        return composed

    # legacy single-row behavior for sites that haven't migrated
    row = db.scalar(select(HomepageContent).limit(1))
    if row is None:
        # create default
        row = HomepageContent(
            hero_title=DEFAULT_HOMEPAGE["hero_title"],
            hero_subtitle=DEFAULT_HOMEPAGE["hero_subtitle"],
            stats_json=json.dumps(DEFAULT_HOMEPAGE["stats"]),
            promises_json=json.dumps(DEFAULT_HOMEPAGE["promises"]),
            coming_json=json.dumps(DEFAULT_HOMEPAGE["coming"]),
        )
        db.add(row)
        db.commit()
        db.refresh(row)

    result = {
        "hero_title": row.hero_title,
        "hero_subtitle": row.hero_subtitle,
        "stats": json.loads(row.stats_json) if row.stats_json else None,
        "promises": json.loads(row.promises_json) if row.promises_json else None,
        "coming": json.loads(row.coming_json) if row.coming_json else None,
    }
    return result


def update_homepage(db: Session, payload: HomepageUpdate) -> dict:
    # Keep legacy behavior for the single-row homepage content model
    row = db.scalar(select(HomepageContent).limit(1))
    data = payload.model_dump(exclude_unset=True)
    if row is None:
        row = HomepageContent()

    if "hero_title" in data:
        row.hero_title = data.get("hero_title")
    if "hero_subtitle" in data:
        row.hero_subtitle = data.get("hero_subtitle")
    if "stats" in data:
        row.stats_json = json.dumps(data.get("stats"))
    if "promises" in data:
        row.promises_json = json.dumps(data.get("promises"))
    if "coming" in data:
        row.coming_json = json.dumps(data.get("coming"))

    db.add(row)
    db.commit()
    db.refresh(row)

    return get_homepage(db)
