from fastapi import APIRouter
from sqlalchemy import desc, select

from app.database import async_session
from app.models import Anomaly
from app.schemas import AnomalyOut

router = APIRouter()


@router.get("/anomalies", response_model=list[AnomalyOut])
async def get_anomalies():
    async with async_session() as session:
        result = await session.execute(select(Anomaly).order_by(desc(Anomaly.detected_at)).limit(50))
        return [
            AnomalyOut(
                id=a.id,
                country_code=a.country_code,
                country_name=a.country_name,
                anomaly_type=a.anomaly_type,
                severity=a.severity,
                message=a.message,
                detected_at=a.detected_at,
            )
            for a in result.scalars()
        ]
