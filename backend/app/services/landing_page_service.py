import json
import re
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException

from backend.app.models.landing_page import LandingPage, FormSubmission, LandingPageClickLog
from backend.app.schemas.landing_page import (
    LandingPageCreate,
    LandingPageUpdate,
    LandingPageResponse,
    FormFieldSchema,
    FormSubmissionCreate,
    FormSubmissionResponse,
    CtaClickRequest,
    ResponseTrackingOverview,
)
from backend.app.repositories.landing_page_repository import LandingPageRepository

def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

class LandingPageService:
    def __init__(self, repo: LandingPageRepository) -> None:
        self.repo = repo

    def _to_response_schema(self, page: LandingPage) -> LandingPageResponse:
        form_fields_raw = []
        if page.form_fields_json:
            try:
                form_fields_raw = json.loads(page.form_fields_json)
            except Exception:
                form_fields_raw = []
        
        fields = [FormFieldSchema(**f) for f in form_fields_raw]
        conversion_rate = 0.0
        if page.views_count > 0:
            conversion_rate = round((page.submissions_count / page.views_count) * 100, 1)

        return LandingPageResponse(
            id=page.id,
            owner_id=page.owner_id,
            title=page.title,
            slug=page.slug,
            headline=page.headline,
            subheadline=page.subheadline,
            body_text=page.body_text,
            banner_url=page.banner_url,
            cta_button_text=page.cta_button_text,
            cta_redirect_url=page.cta_redirect_url,
            form_fields=fields,
            views_count=page.views_count,
            cta_clicks_count=page.cta_clicks_count,
            submissions_count=page.submissions_count,
            conversion_rate=conversion_rate,
            status=page.status,
            created_at=page.created_at,
            updated_at=page.updated_at,
        )

    def create_landing_page(self, owner_id: int, data: LandingPageCreate) -> LandingPageResponse:
        # Generate unique slug if not provided
        raw_slug = data.slug or _slugify(data.title)
        if not raw_slug:
            raw_slug = f"page-{uuid.uuid4().hex[:6]}"
        
        existing = self.repo.get_by_slug(raw_slug)
        if existing:
            raw_slug = f"{raw_slug}-{uuid.uuid4().hex[:4]}"

        # Default form fields if none provided
        fields_data = [f.model_dump() for f in data.form_fields] if data.form_fields else [
            {"id": "name", "label": "Full Name", "field_type": "text", "required": True, "placeholder": "Enter your full name"},
            {"id": "email", "label": "Email Address", "field_type": "email", "required": True, "placeholder": "name@company.com"},
            {"id": "phone", "label": "Phone Number", "field_type": "phone", "required": False, "placeholder": "+1 (555) 000-0000"},
            {"id": "message", "label": "Comments / Feedback", "field_type": "textarea", "required": False, "placeholder": "Tell us how we can help..."}
        ]

        page = LandingPage(
            owner_id=owner_id,
            title=data.title,
            slug=raw_slug,
            headline=data.headline or "Welcome to Our Exclusive Offer",
            subheadline=data.subheadline or "Please fill out the form below to get started.",
            body_text=data.body_text,
            banner_url=data.banner_url,
            cta_button_text=data.cta_button_text or "Submit & Continue",
            cta_redirect_url=data.cta_redirect_url,
            form_fields_json=json.dumps(fields_data),
            status=data.status or "Active",
        )
        created = self.repo.create(page)
        return self._to_response_schema(created)

    def update_landing_page(self, landing_page_id: int, owner_id: int, data: LandingPageUpdate) -> LandingPageResponse:
        page = self.repo.get_by_id(landing_page_id)
        if not page or page.owner_id != owner_id:
            raise HTTPException(status_code=404, detail="Landing page not found")

        if data.title is not None:
            page.title = data.title
        if data.headline is not None:
            page.headline = data.headline
        if data.subheadline is not None:
            page.subheadline = data.subheadline
        if data.body_text is not None:
            page.body_text = data.body_text
        if data.banner_url is not None:
            page.banner_url = data.banner_url
        if data.cta_button_text is not None:
            page.cta_button_text = data.cta_button_text
        if data.cta_redirect_url is not None:
            page.cta_redirect_url = data.cta_redirect_url
        if data.status is not None:
            page.status = data.status
        if data.form_fields is not None:
            page.form_fields_json = json.dumps([f.model_dump() for f in data.form_fields])
        if data.slug is not None and data.slug != page.slug:
            new_slug = _slugify(data.slug)
            existing = self.repo.get_by_slug(new_slug)
            if existing and existing.id != landing_page_id:
                raise HTTPException(status_code=400, detail="Slug already in use")
            page.slug = new_slug

        page.updated_at = datetime.utcnow()
        updated = self.repo.update(page)
        return self._to_response_schema(updated)

    def get_landing_page(self, landing_page_id: int, owner_id: Optional[int] = None) -> LandingPageResponse:
        page = self.repo.get_by_id(landing_page_id)
        if not page:
            raise HTTPException(status_code=404, detail="Landing page not found")
        if owner_id and page.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Permission denied")
        return self._to_response_schema(page)

    def get_public_landing_page(self, slug: str, increment_view: bool = True) -> LandingPageResponse:
        page = self.repo.get_by_slug(slug)
        if not page:
            raise HTTPException(status_code=404, detail="Landing page not found")
        if increment_view:
            self.repo.increment_views(page.id)
            page.views_count += 1
        return self._to_response_schema(page)

    def get_owner_landing_pages(self, owner_id: int) -> List[LandingPageResponse]:
        pages = self.repo.get_by_owner(owner_id)
        return [self._to_response_schema(p) for p in pages]

    def delete_landing_page(self, landing_page_id: int, owner_id: int) -> bool:
        page = self.repo.get_by_id(landing_page_id)
        if not page or page.owner_id != owner_id:
            raise HTTPException(status_code=404, detail="Landing page not found")
        return self.repo.delete(landing_page_id)

    def submit_form(self, slug: str, data: FormSubmissionCreate, ip_address: Optional[str] = None) -> FormSubmissionResponse:
        page = self.repo.get_by_slug(slug)
        if not page:
            raise HTTPException(status_code=404, detail="Landing page not found")

        # Extract email if present in submitted_data
        email = data.recipient_email
        if not email and "email" in data.submitted_data:
            email = str(data.submitted_data["email"])

        submission = FormSubmission(
            landing_page_id=page.id,
            campaign_id=data.campaign_id,
            recipient_email=email,
            submitted_data_json=json.dumps(data.submitted_data),
            ip_address=ip_address,
        )
        created = self.repo.create_submission(submission)
        self.repo.increment_submissions(page.id)

        return FormSubmissionResponse(
            id=created.id,
            landing_page_id=created.landing_page_id,
            landing_page_title=page.title,
            landing_page_slug=page.slug,
            campaign_id=created.campaign_id,
            recipient_email=created.recipient_email,
            submitted_data=data.submitted_data,
            ip_address=created.ip_address,
            created_at=created.created_at,
        )

    def track_cta_click(self, slug: str, click_data: CtaClickRequest) -> Dict[str, Any]:
        page = self.repo.get_by_slug(slug)
        if not page:
            raise HTTPException(status_code=404, detail="Landing page not found")

        log = LandingPageClickLog(
            landing_page_id=page.id,
            campaign_id=click_data.campaign_id,
            recipient_email=click_data.recipient_email,
            source=click_data.source or "landing_page",
            target_url=page.cta_redirect_url,
        )
        self.repo.create_click_log(log)
        self.repo.increment_clicks(page.id)

        return {
            "status": "success",
            "landing_page_id": page.id,
            "redirect_url": page.cta_redirect_url or "/",
        }

    def get_page_submissions(self, landing_page_id: int, owner_id: int) -> List[FormSubmissionResponse]:
        page = self.repo.get_by_id(landing_page_id)
        if not page or page.owner_id != owner_id:
            raise HTTPException(status_code=404, detail="Landing page not found")

        submissions = self.repo.get_submissions_by_page(landing_page_id)
        result = []
        for s in submissions:
            data_dict = {}
            if s.submitted_data_json:
                try:
                    data_dict = json.loads(s.submitted_data_json)
                except Exception:
                    data_dict = {}
            result.append(
                FormSubmissionResponse(
                    id=s.id,
                    landing_page_id=s.landing_page_id,
                    landing_page_title=page.title,
                    landing_page_slug=page.slug,
                    campaign_id=s.campaign_id,
                    recipient_email=s.recipient_email,
                    submitted_data=data_dict,
                    ip_address=s.ip_address,
                    created_at=s.created_at,
                )
            )
        return result

    def get_response_tracking_overview(self, owner_id: int) -> ResponseTrackingOverview:
        pages = self.repo.get_by_owner(owner_id)
        page_dict = {p.id: p for p in pages}

        total_pages = len(pages)
        total_views = sum(p.views_count for p in pages)
        total_clicks = sum(p.cta_clicks_count for p in pages)
        total_submissions = sum(p.submissions_count for p in pages)

        overall_conversion_rate = 0.0
        if total_views > 0:
            overall_conversion_rate = round((total_submissions / total_views) * 100, 1)

        raw_submissions = self.repo.get_all_submissions_for_owner(owner_id, limit=50)
        recent_submissions = []
        for s in raw_submissions:
            parent_page = page_dict.get(s.landing_page_id)
            title = parent_page.title if parent_page else f"Page #{s.landing_page_id}"
            slug = parent_page.slug if parent_page else ""
            data_dict = {}
            if s.submitted_data_json:
                try:
                    data_dict = json.loads(s.submitted_data_json)
                except Exception:
                    data_dict = {}

            recent_submissions.append(
                FormSubmissionResponse(
                    id=s.id,
                    landing_page_id=s.landing_page_id,
                    landing_page_title=title,
                    landing_page_slug=slug,
                    campaign_id=s.campaign_id,
                    recipient_email=s.recipient_email,
                    submitted_data=data_dict,
                    ip_address=s.ip_address,
                    created_at=s.created_at,
                )
            )

        top_pages = [self._to_response_schema(p) for p in sorted(pages, key=lambda x: x.submissions_count, reverse=True)[:5]]

        return ResponseTrackingOverview(
            total_pages=total_pages,
            total_views=total_views,
            total_clicks=total_clicks,
            total_submissions=total_submissions,
            overall_conversion_rate=overall_conversion_rate,
            recent_submissions=recent_submissions,
            top_landing_pages=top_pages,
        )
