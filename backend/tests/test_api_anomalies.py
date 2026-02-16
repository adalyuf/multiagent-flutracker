"""Tests for /api/anomalies endpoint."""

import pytest


@pytest.mark.asyncio
async def test_anomalies_empty(client):
    resp = await client.get("/api/anomalies")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_anomalies_with_data(client, seed_anomalies):
    resp = await client.get("/api/anomalies")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    severities = {a["severity"] for a in data}
    assert "high" in severities
    assert "medium" in severities
    # Check all required fields present
    for a in data:
        assert "id" in a
        assert "country_code" in a
        assert "message" in a
        assert "detected_at" in a
