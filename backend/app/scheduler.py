import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import delete
from app.database import async_session, engine
from app.models import FluCase, GenomicSequence, Anomaly, Base

logger = logging.getLogger(__name__)


async def _run_who_flunet():
    from app.services.flunet import ingest_flunet
    logger.info("Running WHO FluNet ingestion (last 4 weeks)")
    await ingest_flunet(weeks_back=4)


async def _run_anomaly_detection():
    from app.services.anomaly import detect_anomalies
    logger.info("Running anomaly detection")
    await detect_anomalies()


async def _run_full_rebuild():
    from app.services.flunet import ingest_flunet_full
    from app.services.nextstrain import ingest_nextstrain
    from app.services.anomaly import detect_anomalies

    logger.info("Running full daily rebuild")
    async with async_session() as session:
        await session.execute(delete(FluCase))
        await session.execute(delete(GenomicSequence))
        await session.execute(delete(Anomaly))
        await session.commit()
    logger.info("Cleared all tables for rebuild")

    await ingest_flunet_full()
    await ingest_nextstrain()
    await detect_anomalies()
    logger.info("Full rebuild complete")


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()

    scheduler.add_job(
        _run_who_flunet,
        trigger=IntervalTrigger(hours=6),
        id="who_flunet",
        replace_existing=True,
    )

    scheduler.add_job(
        _run_anomaly_detection,
        trigger=CronTrigger(hour="1,7,13,19"),
        id="anomaly_detection",
        replace_existing=True,
    )

    scheduler.add_job(
        _run_full_rebuild,
        trigger=CronTrigger(hour=5),
        id="full_daily_rebuild",
        replace_existing=True,
    )

    return scheduler


async def init_db():
    """Create tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")


async def run_startup_jobs():
    """Run initial data ingestion on startup."""
    logger.info("Running startup jobs...")
    await _run_who_flunet()
    await _run_anomaly_detection()
    # Also try nextstrain on startup
    try:
        from app.services.nextstrain import ingest_nextstrain
        await ingest_nextstrain()
    except Exception:
        logger.exception("Nextstrain startup ingestion failed (non-fatal)")
