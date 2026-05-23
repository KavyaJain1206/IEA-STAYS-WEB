from enum import StrEnum


class VisitStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ResidentStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    INACTIVE = "inactive"


class VisitTimeSlot(StrEnum):
    MORNING = "Morning"
    AFTERNOON = "Afternoon"
    EVENING = "Evening"


class PreferredHome(StrEnum):
    STUDIO = "Studio"
    NEST = "Nest"
    BNB = "BNB"
