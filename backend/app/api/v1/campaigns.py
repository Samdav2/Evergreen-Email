from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from backend.app.schemas.campaign import CampaignCreate, CampaignRead, CampaignLaunchRequest
from backend.app.services.campaign_service import CampaignService
from backend.app.dependencies import get_campaign_service, get_current_user_id

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=List[CampaignRead])
def get_campaigns(
    current_user_id: int = Depends(get_current_user_id),
    campaign_service: CampaignService = Depends(get_campaign_service)
) -> List[CampaignRead]:
    return campaign_service.get_user_campaigns(current_user_id)

@router.post("", response_model=CampaignRead)
def create_campaign(
    dto: CampaignCreate,
    current_user_id: int = Depends(get_current_user_id),
    campaign_service: CampaignService = Depends(get_campaign_service)
) -> CampaignRead:
    return campaign_service.create_campaign(dto, current_user_id)

@router.post("/launch", response_model=CampaignRead)
def launch_campaign(
    dto: CampaignLaunchRequest,
    background_tasks: BackgroundTasks,
    campaign_service: CampaignService = Depends(get_campaign_service)
) -> CampaignRead:
    try:
        is_immediate = dto.schedule_option == "immediate"
        return campaign_service.launch_campaign(dto.campaign_id, is_immediate, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

