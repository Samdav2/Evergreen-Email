from fastapi import APIRouter, Depends
from backend.app.schemas.analytics import AnalyticsOverview, CampaignAnalyticsDetail
from backend.app.services.analytics_service import AnalyticsService
from backend.app.dependencies import get_analytics_service

router = APIRouter(prefix="/analytics", tags=["Campaign Analytics"])

@router.get("/summary", response_model=AnalyticsOverview)
def get_analytics_summary(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> AnalyticsOverview:
    return analytics_service.get_overall_summary()

@router.get("/campaign/{campaign_id}", response_model=CampaignAnalyticsDetail)
def get_campaign_analytics(
    campaign_id: int,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> CampaignAnalyticsDetail:
    return analytics_service.get_campaign_detail(campaign_id)
