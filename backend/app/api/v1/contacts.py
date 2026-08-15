from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from backend.app.schemas.contact import (
    ContactRead,
    ContactManualImport,
    ContactImportSummary,
    PaginatedContacts,
)
from backend.app.services.contact_service import ContactService
from backend.app.dependencies import get_contact_service, get_current_user_id

router = APIRouter(prefix="/contacts", tags=["Audience Contacts"])


@router.get("", response_model=PaginatedContacts)
def get_contacts(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    current_user_id: int = Depends(get_current_user_id),
    contact_service: ContactService = Depends(get_contact_service),
) -> PaginatedContacts:
    return contact_service.get_audience_contacts(current_user_id, page, page_size)


@router.post("/import-manual", response_model=ContactImportSummary)
def import_manual_contacts(
    dto: ContactManualImport,
    current_user_id: int = Depends(get_current_user_id),
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactImportSummary:
    return contact_service.parse_manual_text(dto.raw_text, current_user_id)


@router.post("/upload", response_model=ContactImportSummary)
def upload_contacts_file(
    file: UploadFile = File(...),
    current_user_id: int = Depends(get_current_user_id),
    contact_service: ContactService = Depends(get_contact_service),
) -> ContactImportSummary:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")
    try:
        return contact_service.parse_uploaded_file(file, current_user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/all")
def delete_all_contacts(
    current_user_id: int = Depends(get_current_user_id),
    contact_service: ContactService = Depends(get_contact_service),
) -> dict:
    count = contact_service.delete_all_contacts(current_user_id)
    return {"status": "success", "deleted_count": count, "message": f"Successfully deleted {count} contacts."}

