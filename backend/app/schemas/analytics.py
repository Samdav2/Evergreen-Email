from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel


class EngagementTrendPoint(BaseModel):
    time: str
    opens: int
    clicks: int


class DeviceBreakdown(BaseModel):
    device: str
    percentage: float


class AnalyticsOverview(BaseModel):
    total_sent_30d: int
    sent_growth_pct: float
    avg_open_rate: float
    open_rate_growth_pct: float
    avg_click_rate: float
    click_rate_change_pct: float
    avg_bounce_rate: float
    bounce_rate_status: str
    total_contacts: int = 0
    active_automations: int = 0


class CampaignAnalyticsDetail(BaseModel):
    campaign_id: int
    subject: str
    sent_date: str
    total_opens: int
    open_rate_growth: float
    ctr: float
    ctr_growth: float
    conversion_rate: float
    conversion_growth: float
    bounce_rate: float
    bounce_growth: float
    engagement_trends: List[EngagementTrendPoint]
