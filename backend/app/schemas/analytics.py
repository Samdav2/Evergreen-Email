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
    count: int = 0


class LocationBreakdown(BaseModel):
    location: str
    percentage: float
    count: int = 0


class RecentActivityItem(BaseModel):
    id: Optional[int] = None
    recipient_email: str
    event_type: str
    timestamp: str
    device_type: str = "Desktop"
    location: str = "United States"


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
    total_sent: int = 0
    total_delivered: int = 0
    total_opens: int = 0
    open_rate: float = 0.0
    open_rate_growth: float = 0.0
    total_clicks: int = 0
    ctr: float = 0.0
    ctr_growth: float = 0.0
    conversion_rate: float = 0.0
    conversion_growth: float = 0.0
    bounce_rate: float = 0.0
    bounce_growth: float = 0.0
    engagement_trends: List[EngagementTrendPoint] = []
    device_breakdown: List[DeviceBreakdown] = []
    location_breakdown: List[LocationBreakdown] = []
    recent_activity: List[RecentActivityItem] = []

