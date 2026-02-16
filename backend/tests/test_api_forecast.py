"""Tests for /api/forecast endpoint."""

import pytest


@pytest.mark.asyncio
async def test_forecast_empty(client):
    resp = await client.get("/api/forecast")
    assert resp.status_code == 200
    data = resp.json()
    assert data["historical"] == []
    assert data["forecast"] == []


@pytest.mark.asyncio
async def test_forecast_with_data(client, seed_flu_cases):
    resp = await client.get("/api/forecast")
    assert resp.status_code == 200
    data = resp.json()
    # Only 2 data points in seed, below the 10-point threshold
    assert data["historical"] == []
    assert data["forecast"] == []
