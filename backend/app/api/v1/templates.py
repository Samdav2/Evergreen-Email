from typing import List
from fastapi import APIRouter, Depends, HTTPException
from backend.app.schemas.template import TemplateCreate, TemplateUpdate, TemplateRead
from backend.app.services.template_service import TemplateService
from backend.app.dependencies import get_template_service, get_current_user_id

router = APIRouter(prefix="/templates", tags=["Templates"])

@router.get("", response_model=List[TemplateRead])
def list_templates(
    current_user_id: int = Depends(get_current_user_id),
    template_service: TemplateService = Depends(get_template_service)
) -> List[TemplateRead]:
    return template_service.get_templates(current_user_id)

@router.post("", response_model=TemplateRead)
def create_template(
    dto: TemplateCreate,
    current_user_id: int = Depends(get_current_user_id),
    template_service: TemplateService = Depends(get_template_service)
) -> TemplateRead:
    return template_service.create_template(dto, current_user_id)

@router.put("/{template_id}", response_model=TemplateRead)
def update_template(
    template_id: int,
    dto: TemplateUpdate,
    template_service: TemplateService = Depends(get_template_service)
) -> TemplateRead:
    res = template_service.update_template(template_id, dto)
    if not res:
        raise HTTPException(status_code=404, detail="Template not found")
    return res
