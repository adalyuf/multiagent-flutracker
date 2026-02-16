import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import create_scheduler, init_db, run_startup_jobs

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    scheduler = create_scheduler()
    scheduler.start()
    # Run startup jobs in background so the app starts immediately
    asyncio.create_task(run_startup_jobs())
    logger.info("FluTracker backend started")
    yield
    # Shutdown
    scheduler.shutdown(wait=False)
    logger.info("FluTracker backend stopped")


app = FastAPI(title="FluTracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routers import cases, genomics, anomalies, forecast as forecast_router

app.include_router(cases.router, prefix="/api")
app.include_router(genomics.router, prefix="/api/genomics")
app.include_router(anomalies.router, prefix="/api")
app.include_router(forecast_router.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
