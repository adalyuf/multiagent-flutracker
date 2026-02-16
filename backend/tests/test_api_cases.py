"""Tests for /api/cases/* endpoints."""

import pytest


@pytest.mark.asyncio
async def test_cases_summary_empty(client):
    resp = await client.get("/api/cases/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_cases"] == 0
    assert data["countries_reporting"] == 0


@pytest.mark.asyncio
async def test_cases_summary_with_data(client, seed_flu_cases):
    resp = await client.get("/api/cases/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_cases"] > 0
    assert data["countries_reporting"] == 2  # US and GB


@pytest.mark.asyncio
async def test_cases_map_empty(client):
    resp = await client.get("/api/cases/map")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_cases_map_with_data(client, seed_flu_cases):
    resp = await client.get("/api/cases/map")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    codes = {d["country_code"] for d in data}
    assert "US" in codes


@pytest.mark.asyncio
async def test_cases_historical_empty(client):
    resp = await client.get("/api/cases/historical")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_cases_historical_with_data(client, seed_flu_cases):
    resp = await client.get("/api/cases/historical")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert "season" in data[0]
    assert "week_offset" in data[0]


@pytest.mark.asyncio
async def test_cases_subtypes_empty(client):
    resp = await client.get("/api/cases/subtypes")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_cases_subtypes_with_data(client, seed_flu_cases):
    resp = await client.get("/api/cases/subtypes")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    subtypes = {d["subtype"] for d in data}
    assert len(subtypes) >= 1


@pytest.mark.asyncio
async def test_cases_countries_empty(client):
    resp = await client.get("/api/cases/countries")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_cases_countries_with_data(client, seed_flu_cases):
    resp = await client.get("/api/cases/countries")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert "country_code" in data[0]
    assert "total_cases" in data[0]
    assert "sparkline" in data[0]


@pytest.mark.asyncio
async def test_cases_countries_search_filter(client, seed_flu_cases):
    resp = await client.get("/api/cases/countries?search=US")
    assert resp.status_code == 200
    data = resp.json()
    for row in data:
        assert "US" in row["country_code"].upper()
