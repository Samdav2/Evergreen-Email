from typing import List
from backend.app.schemas.analytics import AnalyticsOverview, CampaignAnalyticsDetail, EngagementTrendPoint

class AnalyticsService:
    """Service computing analytics, open rates, CTRs, and engagement metrics."""

    def get_overall_summary((self) -> AnalyticsOverview:
        return AnalyticsOverview(
            total_sent_30d=124502,
            sent_growth_pct=12.0,
            avg_open_rate=24.8,
            open_rate_growth_pct=2.4,
            avg_click_rate=3.2,
            click_rate_change_pct=-0.8,
            avg_bounce_rate=0.14,
            bounce_rate_status="Stable"
        )

    def get_campaign_detail(self, campaign_id: int) -> CampaignAnalyticsDetail:
        trends = [
            EngagementTrendPoint(time="10:00", opens=1200, clicks=450),
            EngagementTrendPoint(time="14:00", opens=2800, clicks=920),
            EngagementTrendPoint(time="18:00", opens=5400, clicks=1890),
            EngagementTrendPoint(time="22:00", opens=8900, clicks=3100),
            EngagementTrendPoint(time="02:00", opens=11200, clicks=4050),
            EngagementTrendPoint(time="06:00", opens=12450, clicks=4280)
        ]
        return CampaignAnalyticsDetail(
            campaign_id=campaign_id,
            subject="Q4 Product Launch Announcement",
            sent_date="Oct 24, 2024 at 10:15 AM",
            total_opens=42891,
            open_rate_growth=12.4,
            ctr=8.42,
            ctr_growth=3.1,
            conversion_rate=2.15,
            conversion_growth=0.8,
            bounce_rate=0.42,
            bounce_growth=-2.4,
            engagement_trends=trends
        )
