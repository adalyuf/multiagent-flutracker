import httpx
import logging
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.database import async_session
from app.models import GenomicSequence

logger = logging.getLogger(__name__)

NEXTSTRAIN_URL = "https://nextstrain.org/charon/getDataset?prefix=/flu/seasonal/h3n2/ha/2y"


async def fetch_nextstrain():
    """Fetch genomic data from Nextstrain."""
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.get(NEXTSTRAIN_URL, headers={"Accept": "application/json"})
        resp.raise_for_status()
        data = resp.json()

    tree = data.get("tree", {})
    meta = data.get("meta", {})

    records = []
    _walk_tree(tree, records)
    logger.info(f"Parsed {len(records)} genomic sequences from Nextstrain")
    return records


def _walk_tree(node: dict, records: list):
    """Recursively walk Nextstrain tree to extract sequences."""
    attrs = node.get("node_attrs", {})
    country_val = attrs.get("country", {}).get("value", "")
    clade = attrs.get("clade_membership", {}).get("value", "") or attrs.get("subclade", {}).get("value", "")
    num_date = attrs.get("num_date", {}).get("value")

    if country_val and clade and num_date:
        try:
            year = int(num_date)
            frac = num_date - year
            date_val = datetime(year, 1, 1) + __import__("datetime").timedelta(days=frac * 365.25)
            records.append({
                "country_code": country_val[:10],
                "clade": clade,
                "lineage": "",
                "collection_date": date_val.date(),
                "count": 1,
            })
        except (ValueError, TypeError):
            pass

    for child in node.get("children", []):
        _walk_tree(child, records)


async def ingest_nextstrain():
    """Fetch and upsert Nextstrain data."""
    try:
        records = await fetch_nextstrain()
        if not records:
            return

        async with async_session() as session:
            for i in range(0, len(records), 1000):
                batch = records[i:i + 1000]
                stmt = pg_insert(GenomicSequence).values(batch)
                stmt = stmt.on_conflict_do_nothing(constraint="uq_genomic_seq")
                await session.execute(stmt)
            await session.commit()
            logger.info(f"Ingested {len(records)} genomic sequences")
    except Exception:
        logger.exception("Nextstrain ingestion failed")
