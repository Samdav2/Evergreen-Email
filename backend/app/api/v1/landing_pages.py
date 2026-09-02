from typing import List, Optional
from fastapi import APIRouter, Depends, Request, status
from backend.app.schemas.landing_page import (
    LandingPageCreate,
    LandingPageUpdate,
    LandingPageResponse,
    FormSubmissionCreate,
    FormSubmissionResponse,
    CtaClickRequest,
    ResponseTrackingOverview,
)
from backend.app.services.landing_page_service import LandingPageService
from backend.app.dependencies import get_landing_page_service, get_current_user_id

router = APIRouter(prefix="/landing-pages", tags=["Landing Pages & Response Tracking"])

@router.get("", response_model=List[LandingPageResponse])
def get_landing_pages(
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> List[LandingPageResponse]:
    return service.get_owner_landing_pages(user_id)

@router.post("", response_model=LandingPageResponse, status_code=status.HTTP_201_CREATED)
def create_landing_page(
    payload: LandingPageCreate,
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> LandingPageResponse:
    return service.create_landing_page(user_id, payload)

@router.get("/overview/summary", response_model=ResponseTrackingOverview)
def get_response_tracking_overview(
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> ResponseTrackingOverview:
    return service.get_response_tracking_overview(user_id)

@router.get("/{landing_page_id}", response_model=LandingPageResponse)
def get_landing_page(
    landing_page_id: int,
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> LandingPageResponse:
    return service.get_landing_page(landing_page_id, owner_id=user_id)

@router.put("/{landing_page_id}", response_model=LandingPageResponse)
def update_landing_page(
    landing_page_id: int,
    payload: LandingPageUpdate,
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> LandingPageResponse:
    return service.update_landing_page(landing_page_id, user_id, payload)

@router.delete("/{landing_page_id}")
def delete_landing_page(
    landing_page_id: int,
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> dict:
    success = service.delete_landing_page(landing_page_id, user_id)
    return {"status": "success", "deleted": success}

@router.get("/{landing_page_id}/submissions", response_model=List[FormSubmissionResponse])
def get_landing_page_submissions(
    landing_page_id: int,
    user_id: int = Depends(get_current_user_id),
    service: LandingPageService = Depends(get_landing_page_service),
) -> List[FormSubmissionResponse]:
    return service.get_page_submissions(landing_page_id, user_id)

# Public Endpoints
@router.get("/public/p/{slug}", response_model=LandingPageResponse)
def get_public_landing_page(
    slug: str,
    service: LandingPageService = Depends(get_landing_page_service),
) -> LandingPageResponse:
    return service.get_public_landing_page(slug, increment_view=True)

@router.post("/public/p/{slug}/submit", response_model=FormSubmissionResponse)
def submit_public_form(
    slug: str,
    payload: FormSubmissionCreate,
    request: Request,
    service: LandingPageService = Depends(get_landing_page_service),
) -> FormSubmissionResponse:
    ip_address = request.client.host if request.client else None
    return service.submit_form(slug, payload, ip_address=ip_address)

@router.post("/public/p/{slug}/track-click")
def track_public_cta_click(
    slug: str,
    payload: CtaClickRequest,
    service: LandingPageService = Depends(get_landing_page_service),
) -> dict:
    return service.track_cta_click(slug, payload)
