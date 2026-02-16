"""Tests for app.config."""

from app.config import Settings


def test_async_url_conversion():
    s = Settings(DATABASE_URL="postgresql://user:pass@host:5432/db")
    assert s.async_database_url == "postgresql+asyncpg://user:pass@host:5432/db"


def test_async_url_already_async():
    s = Settings(DATABASE_URL="postgresql+asyncpg://user:pass@host/db")
    assert s.async_database_url == "postgresql+asyncpg://user:pass@host/db"


def test_extra_ignored():
    # Settings uses extra="ignore", so unknown fields shouldn't raise
    s = Settings(DATABASE_URL="postgresql://x:x@x/x", SOME_RANDOM_VAR="ok")
    assert s.DATABASE_URL == "postgresql://x:x@x/x"
