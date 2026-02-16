"""Tests for ORM models (table creation, unique constraints, basic CRUD)."""

import pytest
import pytest_asyncio
from datetime import date, datetime
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import FluCase, GenomicSequence, Anomaly


@pytest.mark.asyncio
async def test_flu_case_insert_and_read(db_session):
    case = FluCase(
        country_code="US", flu_type="H1N1", source="who_flunet",
        time=date(2025, 1, 6), new_cases=42, iso_year=2025, iso_week=2,
    )
    db_session.add(case)
    await db_session.commit()

    result = await db_session.execute(select(FluCase))
    rows = list(result.scalars())
    assert len(rows) == 1
    assert rows[0].country_code == "US"
    assert rows[0].new_cases == 42


@pytest.mark.asyncio
async def test_flu_case_unique_constraint(db_session):
    """Inserting two rows with same logical key should violate unique constraint."""
    shared = dict(
        country_code="US", region="", city="", flu_type="H1N1",
        source="who_flunet", time=date(2025, 1, 6), new_cases=10,
        iso_year=2025, iso_week=2,
    )
    db_session.add(FluCase(**shared))
    await db_session.commit()

    db_session.add(FluCase(**shared))
    with pytest.raises(IntegrityError):
        await db_session.commit()


@pytest.mark.asyncio
async def test_genomic_sequence_insert(db_session):
    seq = GenomicSequence(
        country_code="GB", clade="2a.3a.1", lineage="",
        collection_date=date(2025, 3, 15), count=5,
    )
    db_session.add(seq)
    await db_session.commit()

    result = await db_session.execute(select(GenomicSequence))
    rows = list(result.scalars())
    assert len(rows) == 1
    assert rows[0].clade == "2a.3a.1"


@pytest.mark.asyncio
async def test_anomaly_insert(db_session):
    a = Anomaly(
        country_code="FR", country_name="France",
        anomaly_type="spike", severity="medium",
        message="test", detected_at=datetime(2025, 6, 1),
    )
    db_session.add(a)
    await db_session.commit()

    result = await db_session.execute(select(Anomaly))
    rows = list(result.scalars())
    assert len(rows) == 1
    assert rows[0].severity == "medium"
