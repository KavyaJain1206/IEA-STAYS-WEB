SYSTEM_COLLECTION_NAMES = {
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
}


def is_system_collection_name(name: str | None) -> bool:
    return bool(name and name.strip() in SYSTEM_COLLECTION_NAMES)
