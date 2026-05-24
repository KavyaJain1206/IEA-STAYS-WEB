from typing import Any

from pydantic import BaseModel


class StatItem(BaseModel):
    value: str
    lines: list[str]


class PromiseItem(BaseModel):
    icon: str
    title: str
    description: str


class ComingSoon(BaseModel):
    symbol: str
    name: str
    tone: str
    description: str


class HomepageRead(BaseModel):
    hero_title: str | None
    hero_subtitle: str | None
    stats: list[StatItem] | None
    promises: list[PromiseItem] | None
    coming: ComingSoon | None
    # allow extra keys produced by modular sections (e.g. custom sections)
    class Config:
        extra = "allow"


class HomepageUpdate(BaseModel):
    hero_title: str | None = None
    hero_subtitle: str | None = None
    stats: list[StatItem] | None = None
    promises: list[PromiseItem] | None = None
    coming: ComingSoon | None = None

    class Config:
        extra = "ignore"
