"""Tests for FluNet service — pure functions only (no network calls)."""

import pytest
from datetime import date

from app.services.flunet import (
    _parse_week_date,
    _normalize_country,
    _process_records,
)


class TestParseWeekDate:
    def test_known_date(self):
        # ISO week 1 of 2025 → Monday 2024-12-30
        d = _parse_week_date(2025, 1)
        assert d.date() == date(2024, 12, 30)

    def test_mid_year(self):
        d = _parse_week_date(2025, 26)
        assert d.year == 2025
        assert d.weekday() == 0  # Monday


class TestNormalizeCountry:
    def test_uk_codes(self):
        for code in ("XE", "XI", "XS", "XW"):
            assert _normalize_country(code) == "GB"

    def test_regular_code(self):
        assert _normalize_country("us") == "US"
        assert _normalize_country("FR") == "FR"

    def test_empty(self):
        assert _normalize_country("") == ""
        assert _normalize_country(None) == ""


class TestProcessRecords:
    def _make_record(self, iso2="US", year=2025, week=10, **fields):
        rec = {"ISO2": iso2, "ISO_YEAR": year, "ISO_WEEK": week}
        rec.update(fields)
        return rec

    def test_specific_subtype_preferred(self):
        rec = self._make_record(AH1N12009=50, AH3=30, INF_A=100)
        result = _process_records([rec])
        types = {r["flu_type"] for r in result}
        assert "H1N1" in types
        assert "H3N2" in types
        # Aggregate INF_A should NOT appear because specific subtypes exist
        assert "A (unsubtyped)" not in types

    def test_aggregate_when_no_specific(self):
        rec = self._make_record(INF_A=100, INF_B=20)
        result = _process_records([rec])
        types = {r["flu_type"] for r in result}
        assert "A (unsubtyped)" in types
        assert "B (lineage unknown)" in types

    def test_last_resort(self):
        rec = self._make_record(INF_ALL=200)
        result = _process_records([rec])
        assert len(result) == 1
        assert result[0]["flu_type"] == "unknown"

    def test_zero_value_ignored(self):
        rec = self._make_record(AH1N12009=0, INF_ALL=50)
        result = _process_records([rec])
        types = {r["flu_type"] for r in result}
        assert "H1N1" not in types
        assert "unknown" in types

    def test_uk_merging(self):
        recs = [
            self._make_record(iso2="XE", AH3=10),
            self._make_record(iso2="XS", AH3=20),
        ]
        result = _process_records(recs)
        assert len(result) == 1
        assert result[0]["country_code"] == "GB"
        assert result[0]["new_cases"] == 30  # merged

    def test_skips_missing_year(self):
        rec = {"ISO2": "US", "ISO_YEAR": None, "ISO_WEEK": 10, "AH3": 5}
        assert _process_records([rec]) == []

    def test_skips_missing_country(self):
        rec = {"ISO2": "", "ISO_YEAR": 2025, "ISO_WEEK": 10, "AH3": 5}
        assert _process_records([rec]) == []
