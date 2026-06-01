from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard_summary(db)

