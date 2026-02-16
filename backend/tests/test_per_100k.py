"""Tests for the _per_100k helper in the cases router."""

from app.routers.cases import _per_100k, POPULATIONS


def test_known_country():
    # US population = 331 million = 331_000_000
    # _per_100k(cases, cc) = cases / (pop_millions * 10000) * 100000
    # = cases / pop_millions * 10
    # For 1000 cases: 1000 / 331 * 10 = 30.21
    result = _per_100k(1000, "US")
    expected = round(1000 / (331 * 10000) * 100000, 2)
    assert result == expected


def test_unknown_country_uses_default():
    # Default population = 50 million
    result = _per_100k(1000, "ZZ")
    expected = round(1000 / (50 * 10000) * 100000, 2)
    assert result == expected


def test_zero_cases():
    assert _per_100k(0, "US") == 0.0


def test_large_case_count():
    result = _per_100k(1_000_000, "US")
    assert result > 0
    assert isinstance(result, float)
