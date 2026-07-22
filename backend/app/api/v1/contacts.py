from typing import List
from fastapi import APIRouter, Depends
from backend.app.schemas.contact import ContactRead, ContactManualImport, ContactImportSummary
from backend.app.services.contact_service import ContactService
from backend.app.dependencies import get_contact_service, get_current_user_id

router = APIRouter(prefix="/contacts", tags=["Audience Contacts"])

@router.get("", response_model=List[ContactRead])
def get_contacts(
    current_user_id: int = Depends(get_current_user_id),
    contact_service: ContactService = Depends(get_contact_service)
) -> List[ContactRead]:
    return contact_service.get_audience_contacts(current_user_id)

@router.post("/import-manual", response_model=ContactImportSummary)
def import_manual_contacts(
    dto: ContactManualImport,
    current_user_id: int = Depends(get_current_user_id),
    contact_service: ContactService = Depends(get_contact_service)
) -> ContactImportSummary:
    return contact_service.parse_manual_text(dto.raw_text, current_user_id)
