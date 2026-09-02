from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class FormFieldSchema(BaseModel):
    id: str
    label: str
    field_type: str  # text, email, phone, textarea, select, checkbox
    required: bool = True
    placeholder: Optional[str] = ""
    options: Optional[List[str]] = []

class LandingPageCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    headline: Optional[str] = "Welcome to Our Exclusive Offer"
    subheadline: Optional[str] = "Please fill out the form below to get started."
    body_text: Optional[str] = None
    banner_url: Optional[str] = None
    cta_button_text: Optional[str] = "Submit & Continue"
    cta_redirect_url: Optional[str] = None
    form_fields: List[FormFieldSchema] = []
    status: Optional[str] = "Active"

class LandingPageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    headline: Optional[str] = None
    subheadline: Optional[str] = None
    body_text: Optional[str] = None
    banner_url: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_redirect_url: Optional[str] = None
    form_fields: Optional[List[FormFieldSchema]] = None
    status: Optional[str] = None

class LandingPageResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    slug: str
    headline: str
    subheadline: Optional[str] = None
    body_text: Optional[str] = None
    banner_url: Optional[str] = None
    cta_button_text: str
    cta_redirect_url: Optional[str] = None
    form_fields: List[FormFieldSchema] = []
    views_count: int
    cta_clicks_count: int
    submissions_count: int
    conversion_rate: float = 0.0
    status: str
    created_at: datetime
    updated_at: datetime

class FormSubmissionCreate(BaseModel):
    recipient_email: Optional[str] = None
    campaign_id: Optional[int] = None
    submitted_data: Dict[str, Any]

class FormSubmissionResponse(BaseModel):
    id: int
    landing_page_id: int
    landing_page_title: Optional[str] = ""
    landing_page_slug: Optional[str] = ""
    campaign_id: Optional[int] = None
    recipient_email: Optional[str] = None
    submitted_data: Dict[str, Any]
    ip_address: Optional[str] = None
    created_at: datetime

class CtaClickRequest(BaseModel):
    campaign_id: Optional[int] = None
    recipient_email: Optional[str] = None
    source: Optional[str] = "landing_page"

class ResponseTrackingOverview(BaseModel):
    total_pages: int
    total_views: int
    total_clicks: int
    total_submissions: int
    overall_conversion_rate: float
    recent_submissions: List[FormSubmissionResponse] = []
    top_landing_pages: List[LandingPageResponse] = []
